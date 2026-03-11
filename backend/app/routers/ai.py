"""
WebSocket AI pipeline endpoint.
ws://localhost:8000/ws/ai/{project_id}?token=<jwt>

Protocol (JSON messages):
  Client → Server:  { "type": "user_input", "phase": 1, "content": "..." }
                    { "type": "start" }
  Server → Client:  { "type": "token",     "content": "..." }        <- streaming token
                    { "type": "phase_end",  "phase": 1 }
                    { "type": "done" }
                    { "type": "error",      "content": "..." }
                    { "type": "system",     "content": "..." }
"""

import json
import asyncio
import logging
from datetime import datetime
from typing import AsyncGenerator

import httpx
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..config import get_settings
from ..services.auth import decode_token, get_user_by_id
from ..models.ai import AISession, AIMessage
from ..models.generation import GeneratedDoc

logger = logging.getLogger(__name__)
router = APIRouter(tags=["ai"])
settings = get_settings()

STACK_GUARDRAILS = (
    "REGLAS NO NEGOCIABLES DEL PROYECTO:\n"
    "- Stack obligatorio: Frontend en Angular (TypeScript), Backend en FastAPI (Python), Base de datos MySQL.\n"
    "- No propongas ni generes código para otros frameworks o motores (React, Django, PostgreSQL, etc.).\n"
    "- Prioriza archivos completos y funcionales, listos para ejecutar."
)

CODE_OUTPUT_FORMAT_RULES = (
    "FORMATO OBLIGATORIO DE SALIDA PARA ARCHIVOS DE CÓDIGO:\n"
    "Para CADA archivo, escribe exactamente esta cabecera en una línea independiente justo antes del bloque:\n"
    "### Archivo: ruta/relativa/del/archivo.ext\n\n"
    "Luego agrega el bloque markdown correspondiente:\n"
    "```lenguaje\n"
    "contenido completo del archivo\n"
    "```\n\n"
    "Reglas estrictas:\n"
    "- Debe existir una cabecera `### Archivo:` por cada bloque de código.\n"
    "- Usa rutas que comiencen con `frontend/`, `backend/` o `database/` cuando aplique.\n"
    "- No uses nombres genéricos como `generated_1.py`.\n"
    "- No entregues snippets: cada archivo debe estar completo.\n"
    "- No mezcles varios archivos en un solo bloque."
)

PHASE_SCOPE_HINTS = {
    3: (
        "Genera archivos bajo `database/` (SQL) y `backend/app/models/` (SQLAlchemy) y `backend/app/database.py`.\n"
        "Cada archivo DEBE tener su cabecera `### Archivo: database/...` o `### Archivo: backend/...`."
    ),
    4: (
        "Genera TODOS los archivos del backend bajo `backend/`.\n"
        "OBLIGATORIO incluir: `backend/requirements.txt`, `backend/.env.example`, `backend/main.py`, "
        "`backend/app/config.py`, `backend/app/dependencies.py`, `backend/app/routers/auth.py`, "
        "y por cada entidad: schemas, router y service.\n"
        "Cada archivo DEBE tener su cabecera `### Archivo: backend/...`."
    ),
    5: (
        "Genera TODOS los archivos del frontend bajo `frontend/`.\n"
        "OBLIGATORIO incluir: `frontend/package.json`, `frontend/angular.json`, `frontend/tsconfig.json`, "
        "`frontend/tailwind.config.js`, `frontend/src/main.ts`, `frontend/src/app/app.module.ts`, "
        "`frontend/src/app/app-routing.module.ts`, `frontend/src/environments/environment.ts`, "
        "y por cada entidad: service, list-component (.ts + .html) y form-component (.ts + .html).\n"
        "Cada archivo DEBE tener su cabecera `### Archivo: frontend/...`."
    ),
    7: (
        "Genera la infraestructura de despliegue.\n"
        "OBLIGATORIO incluir: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, "
        "`frontend/nginx.conf`, `.env.example` y `README.md` con instrucciones de ejecución.\n"
        "Cada archivo DEBE tener su cabecera `### Archivo: ...`."
    ),
}

HISTORY_MAX_MESSAGES = 16
HISTORY_MAX_CHARS = 18000
RETRY_HISTORY_MAX_MESSAGES = 6
RETRY_HISTORY_MAX_CHARS = 6000


def get_history_window(
    history: list[dict],
    max_messages: int = HISTORY_MAX_MESSAGES,
    max_chars: int = HISTORY_MAX_CHARS,
) -> list[dict]:
    """Trim conversation history by message count and cumulative size."""
    window = history[-max_messages:]
    while len(window) > 1 and sum(len(item.get("content", "")) for item in window) > max_chars:
        window = window[1:]
    return window

# ─── Phase definitions (mirror frontend) ─────────────────────────

PHASES = [
    {
        "id": 1,
        "name": "Análisis & Clarificación",
        "interactive": True,
        "codeGeneration": False,
        "maxTokens": 2000,
        "temperature": 0.5,
        "docSources": ["contexto"],
        "systemPrompt": (
            "INSTRUCCIÓN DE FORMATO — LEE ESTO PRIMERO:\n"
            "Tu respuesta DEBE terminar con un bloque [PREGUNTAS] con EXACTAMENTE este formato:\n\n"
            "[PREGUNTAS]\n"
            "P: <pregunta concisa>\n"
            "O: <opción A>\n"
            "O: <opción B>\n"
            "O: <opción C>\n"
            "P: <siguiente pregunta>\n"
            "O: <opción A>\n"
            "O: <opción B>\n"
            "[/PREGUNTAS]\n\n"
            "REGLAS del bloque:\n"
            "- Exactamente entre 2 y 4 preguntas (P:). Cada pregunta con 2-4 opciones (O:).\n"
            "- Las opciones son CORTAS (máx 6 palabras). Sin guiones, sin markdown dentro del bloque.\n"
            "- El bloque va AL FINAL de la respuesta, después de todo el análisis.\n"
            "- NO uses listas numeradas ni asteriscos dentro del bloque.\n\n"
            "---\n\n"
            "TAREA: Eres un experto en ingeniería de software. Analiza el contexto del proyecto "
            "y los documentos de requisitos y casos de uso proporcionados. "
            "Identifica brevemente las entidades principales, actores y flujos críticos. "
            "El stack OBLIGATORIO es: Frontend Angular, Backend FastAPI (Python), Base de datos MySQL.\n\n"
            "Luego formula entre 2 y 4 preguntas de DECISIÓN DE NEGOCIO usando el bloque [PREGUNTAS] "
            "descrito arriba. Enfócate en: módulos prioritarios, tipos de usuario y roles, "
            "integraciones externas, o restricciones de rendimiento. "
            "NO preguntes sobre el stack (ya está definido)."
        ),
    },
    {
        "id": 2,
        "name": "Arquitectura del Sistema",
        "interactive": True,
        "codeGeneration": False,
        "maxTokens": 2500,
        "temperature": 0.5,
        "docSources": [],
        "systemPrompt": (
            "TAREA: Basándote en el análisis, propón una arquitectura concisa (Presentación Angular → API FastAPI → Servicios → Repositorios → BD MySQL) "
            "con los patrones de diseño más adecuados. "
            "Al finalizar, añade obligatoriamente este bloque de opciones al final de tu respuesta:\n\n"
            "[PREGUNTAS]\n"
            "P: ¿Qué estrategia de autenticación prefieres?\n"
            "O: JWT con cookie HttpOnly\n"
            "O: JWT en LocalStorage\n"
            "O: Instrucción personalizada (escribir abajo)\n"
            "P: ¿Qué estrategia de paginación usar?\n"
            "O: Offset simple\n"
            "O: Cursor-based (más eficiente)\n"
            "O: Instrucción personalizada (escribir abajo)\n"
            "[/PREGUNTAS]"
        ),
    },
    {
        "id": 3,
        "name": "Esquema BD & Migraciones",
        "interactive": True,
        "codeGeneration": True,
        "maxTokens": 7000,
        "temperature": 0.3,
        "docSources": ["bd"],
        "systemPrompt": (
            "Genera el esquema de base de datos para el proyecto usando MySQL y SQLAlchemy.\n"
            "IMPORTANTE: Para no exceder el límite de tokens, genera los archivos base y SOLO 2-3 modelos principales. "
            "Si faltan modelos, pregunta al usuario si desea continuar en la siguiente iteración.\n\n"
            "ARCHIVOS QUE DEBES GENERAR — usa EXACTAMENTE estas cabeceras `### Archivo:` antes de cada bloque:\n\n"
            "1. ### Archivo: database/init.sql\n"
            "   Script DDL completo: CREATE DATABASE IF NOT EXISTS, USE, CREATE TABLE con tipos MySQL apropiados, "
            "índices (INDEX, UNIQUE), PRIMARY KEY y FOREIGN KEY constraints con ON DELETE/UPDATE.\n\n"
            "2. ### Archivo: database/seed.sql\n"
            "   INSERT statements con datos de prueba representativos.\n\n"
            "3. ### Archivo: backend/app/database.py\n"
            "   Configuración SQLAlchemy: create_engine con URL MySQL (lee de env DATABASE_URL), "
            "SessionLocal = sessionmaker(...), Base = declarative_base(), función get_db() como dependency.\n\n"
            "4. Modelos SQLAlchemy (Máximo 3 en esta iteración):\n"
            "   ### Archivo: backend/app/models/<nombre_entidad>.py\n"
            "   Clase SQLAlchemy que hereda de Base con __tablename__, Column con tipos correctos, "
            "ForeignKey, relationship() y __repr__.\n\n"
            "No dejes placeholders ni pseudocódigo. Todos los archivos deben ser completos y funcionales. "
            "Finaliza con un bloque de opciones:\n\n"
            "[PREGUNTAS]\n"
            "P: ¿Qué hacemos a continuación?\n"
            "O: Continuar generando los modelos restantes\n"
            "O: Avanzar a la siguiente fase\n"
            "O: Instrucción personalizada (escribir abajo)\n"
            "[/PREGUNTAS]"
        ),
    },
    {
        "id": 4,
        "name": "Backend API",
        "interactive": True,
        "codeGeneration": True,
        "maxTokens": 8000,
        "temperature": 0.3,
        "docSources": ["backend"],
        "systemPrompt": (
            "Genera el backend usando FastAPI y Python.\n"
            "IMPORTANTE: Para no exceder el límite de tokens ni perder el contexto, genera SOLO los archivos de configuración base "
            "y la API de UNA o DOS entidades como máximo en esta iteración.\n\n"
            "ARCHIVOS A CONSIDERAR (genera solo los que quepan en la iteración):\n\n"
            "1. ### Archivo: backend/requirements.txt\n\n"
            "2. ### Archivo: backend/.env.example\n\n"
            "3. ### Archivo: backend/main.py — FastAPI app con CORSMiddleware, routers.\n\n"
            "4. ### Archivo: backend/app/config.py — Pydantic BaseSettings.\n\n"
            "5. ### Archivo: backend/app/dependencies.py — OAuth2, get_db, get_current_user.\n\n"
            "6. ### Archivo: backend/app/routers/auth.py — login, register, me.\n\n"
            "7. API de Entidades (Máximo 2 en esta iteración):\n"
            "   ### Archivo: backend/app/schemas/<entidad>.py — Pydantic schemas\n"
            "   ### Archivo: backend/app/routers/<entidad>.py — CRUD completo\n\n"
            "REGLA: Todos los archivos deben ser 100% completos y funcionales. Sin placeholders.\n"
            "Finaliza con el siguiente bloque:\n\n"
            "[PREGUNTAS]\n"
            "P: ¿Qué hacemos a continuación?\n"
            "O: Continuar con los routers y schemas restantes\n"
            "O: Avanzar a la siguiente fase\n"
            "O: Instrucción personalizada (escribir abajo)\n"
            "[/PREGUNTAS]"
        ),
    },
    {
        "id": 5,
        "name": "Frontend Components",
        "interactive": True,
        "codeGeneration": True,
        "maxTokens": 8000,
        "temperature": 0.3,
        "docSources": ["frontend"],
        "systemPrompt": (
            "Genera el frontend en Angular 17+ con TypeScript y TailwindCSS.\n"
            "IMPORTANTE: Para no exceder el límite de tokens, genera la estructura base y los componentes/servicios de "
            "SOLO UNA O DOS entidades como máximo en esta iteración.\n\n"
            "ARCHIVOS A CONSIDERAR (genera solo los que quepan en la iteración):\n\n"
            "1. Archivos de Configuración (Solo en la primera iteración):\n"
            "   ### Archivo: frontend/package.json\n"
            "   ### Archivo: frontend/angular.json\n"
            "   ### Archivo: frontend/tsconfig.json\n"
            "   ### Archivo: frontend/tailwind.config.js\n\n"
            "2. Archivos Base de Angular:\n"
            "   ### Archivo: frontend/src/main.ts\n"
            "   ### Archivo: frontend/src/styles.scss\n"
            "   ### Archivo: frontend/src/app/app.module.ts\n"
            "   ### Archivo: frontend/src/app/app-routing.module.ts\n"
            "   ### Archivo: frontend/src/app/app.component.ts\n"
            "   ### Archivo: frontend/src/app/app.component.html\n"
            "   ### Archivo: frontend/src/environments/environment.ts\n\n"
            "3. Componentes por Entidad (Máximo 2 entidades en esta iteración):\n"
            "    ### Archivo: frontend/src/app/services/<entidad>.service.ts\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-list.component.ts\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-list.component.html\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-form.component.ts\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-form.component.html\n\n"
            "Todos los archivos deben ser completos y funcionales. Sin placeholders ni TODO comments. "
            "Finaliza con el siguiente bloque:\n\n"
            "[PREGUNTAS]\n"
            "P: ¿Qué hacemos a continuación?\n"
            "O: Continuar con los componentes restantes\n"
            "O: Avanzar a la siguiente fase\n"
            "O: Instrucción personalizada (escribir abajo)\n"
            "[/PREGUNTAS]"
        ),
    },
    {
        "id": 6,
        "name": "Testing & Calidad",
        "interactive": True,
        "codeGeneration": False,
        "maxTokens": 2000,
        "temperature": 0.5,
        "docSources": [],
        "systemPrompt": (
            "INSTRUCCIÓN DE FORMATO — LEE ESTO PRIMERO:\n"
            "Tu respuesta DEBE terminar con un bloque [PREGUNTAS] con EXACTAMENTE este formato:\n\n"
            "[PREGUNTAS]\n"
            "P: <pregunta concisa>\n"
            "O: <opción A>\n"
            "O: <opción B>\n"
            "O: Instrucción personalizada (escribir abajo)\n"
            "[/PREGUNTAS]\n\n"
            "---\n\n"
            "TAREA: Diseña brevemente la estrategia de pruebas para este proyecto "
            "(Pytest para FastAPI, Jasmine/Karma para Angular).\n\n"
            "Luego formula entre 2 y 3 preguntas sobre DECISIONES DE CALIDAD usando el bloque "
            "[PREGUNTAS] descrito arriba. Preguntas relevantes: nivel de cobertura (básico/medio/alto), "
            "prioridad entre pruebas unitarias vs. integración vs. e2e, "
            "si se requieren pruebas de carga o seguridad (OWASP). "
            "Solo preguntas que afecten qué pruebas se generan."
        ),
    },
    {
        "id": 7,
        "name": "Integración & Deploy",
        "interactive": True,
        "codeGeneration": True,
        "maxTokens": 5000,
        "temperature": 0.35,
        "docSources": [],
        "systemPrompt": (
            "INSTRUCCIÓN DE FORMATO — LEE ESTO PRIMERO:\n"
            "Al final de tu respuesta (después de todos los archivos), incluye OBLIGATORIAMENTE este bloque:\n\n"
            "[PREGUNTAS]\n"
            "P: ¿En qué plataforma desplegarás el proyecto?\n"
            "O: VPS propio (Ubuntu/Debian)\n"
            "O: Railway / Render (PaaS)\n"
            "O: AWS / GCP / Azure\n"
            "O: Instrucción personalizada (escribir abajo)\n"
            "[/PREGUNTAS]\n\n"
            "---\n\n"
            "TAREA: Genera la configuración completa de despliegue para Angular + FastAPI + MySQL.\n\n"
            "ARCHIVOS QUE DEBES GENERAR — usa EXACTAMENTE estas cabeceras `### Archivo:` antes de cada bloque:\n\n"
            "1. ### Archivo: docker-compose.yml\n"
            "   Servicios: db (mysql:8.0, puerto 3306, volumen mysql_data, healthcheck), "
            "backend (build: ./backend, puerto 8000, depends_on db, variables de entorno desde .env), "
            "frontend (build: ./frontend, puerto 80, depends_on backend). "
            "Con volumes y networks definidos.\n\n"
            "2. ### Archivo: backend/Dockerfile\n"
            "   FROM python:3.11-slim. WORKDIR /app. COPY requirements.txt. "
            "RUN pip install --no-cache-dir -r requirements.txt. COPY . . "
            "CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"].\n\n"
            "3. ### Archivo: frontend/Dockerfile\n"
            "   Stage 1: FROM node:20-alpine AS builder, npm install, ng build --configuration=production. "
            "Stage 2: FROM nginx:alpine, COPY nginx.conf, COPY --from=builder dist al html de nginx.\n\n"
            "4. ### Archivo: frontend/nginx.conf\n"
            "   server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }\n\n"
            "5. ### Archivo: .env.example\n"
            "   Template completo: MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, "
            "DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES.\n\n"
            "6. ### Archivo: README.md\n"
            "   Instrucciones claras de ejecución. Incluye:\n"
            "   - Requisitos: Node.js 20+, Python 3.11+, MySQL 8 (o Docker)\n"
            "   - Sección '## Desarrollo local' con comandos exactos\n"
            "   - Sección '## Con Docker' con docker-compose up --build\n"
            "   - Sección '## Estructura del proyecto' con árbol de carpetas\n\n"
            "Después del último archivo, añade el bloque [PREGUNTAS] indicado al inicio."
        ),
    },
]

# ─── OpenRouter streaming helper ─────────────────────────────────

async def stream_openrouter(
    messages: list[dict],
    websocket: WebSocket,
    max_tokens: int = 2048,
    temperature: float = 0.7,
) -> str:
    """
    Send `messages` to OpenRouter DeepSeek V3 with streaming.
    Yields each token as { "type": "token", "content": "..." } over WS.
    Returns the full accumulated text.
    """
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://soft-evolved.app",
        "X-Title": "Soft-Evolved",
    }
    body = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages,
        "stream": True,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    full_text = ""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=body,
            ) as response:
                if response.status_code != 200:
                    err = await response.aread()
                    await websocket.send_json({"type": "error", "content": f"OpenRouter error {response.status_code}: {err.decode()[:200]}"})
                    return full_text

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[6:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if delta:
                            full_text += delta
                            await websocket.send_json({"type": "token", "content": delta})
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
    except httpx.ReadTimeout:
        await websocket.send_json({"type": "error", "content": "Timeout conectando con OpenRouter."})
    except Exception as exc:
        await websocket.send_json({"type": "error", "content": f"Error inesperado: {str(exc)[:200]}"})

    return full_text


# ─── WebSocket endpoint ───────────────────────────────────────────

@router.websocket("/ws/ai/{project_id}")
async def ai_pipeline_ws(
    websocket: WebSocket,
    project_id: int,
    token: str = Query(...),
):
    # ── Auth ──
    user_id = decode_token(token)
    if user_id is None:
        await websocket.close(code=4001)
        return

    db: Session = SessionLocal()
    try:
        user = get_user_by_id(db, user_id)
        if user is None:
            await websocket.close(code=4001)
            return

        await websocket.accept()

        # ── Load project docs for context ──
        docs = db.query(GeneratedDoc).filter(GeneratedDoc.project_id == project_id).all()
        docs_by_layer: dict[str, str] = {}
        for doc in docs:
            docs_by_layer[doc.layer] = docs_by_layer.get(doc.layer, "") + f"\n\n# {doc.filename}\n{doc.content}"

        # ── Create or resume AI session ──
        session = (
            db.query(AISession)
            .filter(AISession.project_id == project_id, AISession.user_id == user_id)
            .order_by(AISession.created_at.desc())
            .first()
        )

        # Wait for "start" message from client
        try:
            raw = await asyncio.wait_for(websocket.receive_json(), timeout=30.0)
        except asyncio.TimeoutError:
            await websocket.close(code=4000)
            return

        if raw.get("type") != "start":
            await websocket.send_json({"type": "error", "content": "Expected {type: 'start'}"})
            await websocket.close()
            return

        # Fresh session
        session = AISession(
            project_id=project_id,
            user_id=user_id,
            status="running",
            current_phase=1,
            context={},
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # Accumulated context across phases
        conversation_history: list[dict] = []

        await websocket.send_json({"type": "system", "content": "Pipeline iniciado. Comenzando Fase 1..."})

        for phase in PHASES:
            phase_id = phase["id"]
            await websocket.send_json({"type": "phase_start", "phase": phase_id, "name": phase["name"]})

            # Build context docs for this phase
            phase_context = ""
            for src in phase["docSources"]:
                if src in docs_by_layer:
                    phase_context += docs_by_layer[src]

            # Build messages for this phase
            system_sections = [STACK_GUARDRAILS, phase["systemPrompt"]]

            if phase.get("codeGeneration"):
                system_sections.append(CODE_OUTPUT_FORMAT_RULES)
                scope_hint = PHASE_SCOPE_HINTS.get(phase_id)
                if scope_hint:
                    system_sections.append(f"ALCANCE DE ESTA FASE:\n{scope_hint}")

            if phase_context:
                system_sections.append(f"DOCUMENTOS DEL PROYECTO:\n{phase_context[:6000]}")

            system_content = "\n\n".join(system_sections)

            history_window = get_history_window(conversation_history)
            messages: list[dict] = [{"role": "system", "content": system_content}]

            # To avoid exceeding context window (causing "No se recibió respuesta" errors in later phases),
            # we limit and trim conversation history in a controlled way.
            messages.extend(history_window)

            # Stream AI response
            ai_response = await stream_openrouter(
                messages,
                websocket,
                max_tokens=phase.get("maxTokens", 2048),
                temperature=phase.get("temperature", 0.7),
            )

            if not ai_response:
                reduced_history = get_history_window(
                    conversation_history,
                    max_messages=RETRY_HISTORY_MAX_MESSAGES,
                    max_chars=RETRY_HISTORY_MAX_CHARS,
                )
                if reduced_history:
                    logger.warning(
                        "Retrying Phase %s with reduced history (prev_len=%s, reduced_len=%s)",
                        phase_id,
                        len(history_window),
                        len(reduced_history),
                    )
                    await websocket.send_json(
                        {
                            "type": "system",
                            "content": f"Reintentando Fase {phase_id} con contexto reducido para evitar límite de tokens...",
                        }
                    )
                    retry_messages: list[dict] = [{"role": "system", "content": system_content}]
                    retry_messages.extend(reduced_history)
                    ai_response = await stream_openrouter(
                        retry_messages,
                        websocket,
                        max_tokens=phase.get("maxTokens", 2048),
                        temperature=phase.get("temperature", 0.7),
                    )

            if not ai_response:
                # Log this error explicitly to debug
                logger.error(f"Empty response from OpenRouter in Phase {phase_id}. History length: {len(conversation_history)}")
                await websocket.send_json({"type": "error", "content": f"No se recibió respuesta en Fase {phase_id}."})
                continue

            # Persist AI message
            ai_msg = AIMessage(session_id=session.id, phase=phase_id, role="ai", content=ai_response)
            db.add(ai_msg)
            db.commit()

            conversation_history.append({"role": "assistant", "content": ai_response})

            # Interactive phase: wait for user input
            if phase["interactive"]:
                await websocket.send_json({"type": "waiting_input", "phase": phase_id})
                try:
                    user_raw = await asyncio.wait_for(websocket.receive_json(), timeout=300.0)
                    user_content = user_raw.get("content", "").strip() or "ok"
                except asyncio.TimeoutError:
                    user_content = "ok (timeout)"

                # Persist user message
                user_msg = AIMessage(session_id=session.id, phase=phase_id, role="user", content=user_content)
                db.add(user_msg)
                db.commit()

                conversation_history.append({"role": "user", "content": user_content})
                await websocket.send_json({"type": "user_received", "phase": phase_id, "content": user_content})

            await websocket.send_json({"type": "phase_end", "phase": phase_id})

            # Update session phase
            session.current_phase = phase_id + 1
            db.commit()

        # Pipeline complete
        session.status = "completed"
        db.commit()

        await websocket.send_json({"type": "done", "content": "Pipeline completado. El proyecto está listo para implementación."})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for project {project_id}")
    except Exception as exc:
        logger.error(f"AI pipeline error: {exc}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "content": str(exc)[:300]})
        except Exception:
            pass
    finally:
        db.close()
        try:
            await websocket.close()
        except Exception:
            pass


# ─── Specs-to-Code Pipeline ──────────────────────────────────────

SPECS_TO_CODE_PHASES = [
    {
        "id": 1,
        "name": "Base de Datos",
        "layers": ["bd"],
        "promptFile": "PROMPT_BD.md",
        "supportFiles": ["schema.prisma", "ddl-migrations.sql", "seed-data.md"],
        "maxTokens": 8000,
        "systemPrompt": (
            "Genera el código COMPLETO de base de datos para este proyecto.\n\n"
            "ARCHIVOS QUE DEBES GENERAR — usa EXACTAMENTE estas cabeceras `### Archivo:` antes de cada bloque:\n\n"
            "1. ### Archivo: database/init.sql\n"
            "   Script DDL completo: CREATE DATABASE IF NOT EXISTS, USE, CREATE TABLE con tipos apropiados, "
            "índices, PRIMARY KEY y FOREIGN KEY constraints.\n\n"
            "2. ### Archivo: database/seed.sql\n"
            "   INSERT statements con datos de prueba representativos (mínimo 3 registros por tabla principal).\n\n"
            "3. ### Archivo: backend/app/database.py\n"
            "   Configuración SQLAlchemy: create_engine, SessionLocal, Base, get_db().\n\n"
            "4. Un archivo por cada entidad principal:\n"
            "   ### Archivo: backend/app/models/<nombre_entidad>.py\n"
            "   Clase SQLAlchemy completa con Column, ForeignKey, relationship().\n\n"
            "REGLA: Todos los archivos deben ser 100% completos y funcionales. Sin placeholders ni TODO."
        ),
    },
    {
        "id": 2,
        "name": "Backend API",
        "layers": ["backend"],
        "promptFile": "PROMPT_BACKEND.md",
        "supportFiles": ["endpoints.md", "dtos-validations.md", "business-rules.md"],
        "maxTokens": 8000,
        "systemPrompt": (
            "Genera el backend COMPLETO usando FastAPI y Python.\n\n"
            "ARCHIVOS QUE DEBES GENERAR:\n\n"
            "1. ### Archivo: backend/requirements.txt\n"
            "2. ### Archivo: backend/.env.example\n"
            "3. ### Archivo: backend/main.py — con CORSMiddleware y todos los routers\n"
            "4. ### Archivo: backend/app/config.py — BaseSettings con pydantic-settings\n"
            "5. ### Archivo: backend/app/dependencies.py — OAuth2, get_db, get_current_user\n"
            "6. ### Archivo: backend/app/routers/auth.py — login, register, me\n"
            "7. Por cada entidad:\n"
            "   ### Archivo: backend/app/schemas/<entidad>.py — Pydantic schemas\n"
            "   ### Archivo: backend/app/routers/<entidad>.py — CRUD completo\n\n"
            "IMPORTANTE: Usa EXACTAMENTE los modelos SQLAlchemy ya generados en la fase anterior "
            "(que se incluyen en el CONTEXTO ACUMULATIVO). Importa los modelos correctamente.\n\n"
            "REGLA: Todos los archivos deben ser 100% completos y funcionales. Sin placeholders ni TODO."
        ),
    },
    {
        "id": 3,
        "name": "Frontend",
        "layers": ["frontend"],
        "promptFile": "PROMPT_FRONTEND.md",
        "supportFiles": ["components.md", "routes.md", "hooks-services.md"],
        "maxTokens": 8000,
        "systemPrompt": (
            "Genera el frontend COMPLETO en Angular 17+ con TypeScript y TailwindCSS.\n\n"
            "ARCHIVOS QUE DEBES GENERAR:\n\n"
            "1. ### Archivo: frontend/package.json\n"
            "2. ### Archivo: frontend/angular.json\n"
            "3. ### Archivo: frontend/tsconfig.json\n"
            "4. ### Archivo: frontend/tailwind.config.js\n"
            "5. ### Archivo: frontend/src/main.ts\n"
            "6. ### Archivo: frontend/src/styles.scss — @tailwind directives\n"
            "7. ### Archivo: frontend/src/app/app.module.ts\n"
            "8. ### Archivo: frontend/src/app/app-routing.module.ts\n"
            "9. ### Archivo: frontend/src/app/app.component.ts\n"
            "10. ### Archivo: frontend/src/app/app.component.html — Navbar + router-outlet\n"
            "11. ### Archivo: frontend/src/environments/environment.ts\n"
            "12. Por cada entidad:\n"
            "    ### Archivo: frontend/src/app/services/<entidad>.service.ts\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-list.component.ts\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-list.component.html\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-form.component.ts\n"
            "    ### Archivo: frontend/src/app/components/<entidad>/<entidad>-form.component.html\n\n"
            "IMPORTANTE: Los endpoints del servicio deben coincidir EXACTAMENTE con los routers "
            "FastAPI generados (ver CONTEXTO ACUMULATIVO).\n\n"
            "REGLA: Todos los archivos deben ser 100% completos y funcionales."
        ),
    },
    {
        "id": 4,
        "name": "Integración & Deploy",
        "layers": [],
        "promptFile": None,
        "supportFiles": [],
        "maxTokens": 5000,
        "systemPrompt": (
            "Genera la infraestructura de despliegue para el proyecto completo.\n\n"
            "Revisa el CONTEXTO ACUMULATIVO para ver exactamente qué archivos se generaron "
            "en las fases anteriores y genera:\n\n"
            "1. ### Archivo: docker-compose.yml\n"
            "   Servicios: db (mysql:8.0), backend (FastAPI), frontend (Angular + nginx).\n\n"
            "2. ### Archivo: backend/Dockerfile\n"
            "3. ### Archivo: frontend/Dockerfile — multi-stage con nginx\n"
            "4. ### Archivo: frontend/nginx.conf\n"
            "5. ### Archivo: .env.example — todas las variables necesarias\n"
            "6. ### Archivo: README.md\n"
            "   Instrucciones completas: requisitos, desarrollo local (BD, backend, frontend), "
            "Docker, y estructura del proyecto.\n\n"
            "REGLA: Todos los archivos deben ser 100% completos."
        ),
    },
]


def _collect_docs_by_filename(docs_from_db) -> dict[str, str]:
    """Index docs by filename for quick lookup."""
    result = {}
    for doc in docs_from_db:
        result[doc.filename] = doc.content
        # Also index without extension for flexible matching
        base = doc.filename.rsplit(".", 1)[0] if "." in doc.filename else doc.filename
        result[base] = doc.content
    return result


def _build_cumulative_context(generated_phases: list[dict]) -> str:
    """Build a summary of what was generated in previous phases."""
    if not generated_phases:
        return ""

    ctx = "CONTEXTO ACUMULATIVO — Código ya generado en fases anteriores:\n\n"
    for phase in generated_phases:
        ctx += f"═══ Fase {phase['id']}: {phase['name']} ═══\n"
        # Extract file paths from the generated code
        import re
        file_headers = re.findall(r"### Archivo:\s*(.+)", phase["code"])
        if file_headers:
            ctx += f"Archivos generados ({len(file_headers)}):\n"
            for fh in file_headers:
                ctx += f"  • {fh.strip()}\n"
        # Include a trimmed version of the actual code for context
        code_trimmed = phase["code"][:6000]
        if len(phase["code"]) > 6000:
            code_trimmed += "\n... [código truncado para contexto] ..."
        ctx += f"\nCódigo generado:\n{code_trimmed}\n\n"

    return ctx


@router.websocket("/ws/ai/{project_id}/specs-to-code")
async def specs_to_code_ws(
    websocket: WebSocket,
    project_id: int,
    token: str = Query(...),
):
    """
    Automated pipeline: reads uploaded spec docs, generates full project code
    iteratively with cumulative context. No user interaction required.
    """
    # ── Auth ──
    user_id = decode_token(token)
    if user_id is None:
        await websocket.close(code=4001)
        return

    db: Session = SessionLocal()
    try:
        user = get_user_by_id(db, user_id)
        if user is None:
            await websocket.close(code=4001)
            return

        await websocket.accept()

        # ── Load spec docs from DB ──
        docs = db.query(GeneratedDoc).filter(GeneratedDoc.project_id == project_id).all()
        if not docs:
            await websocket.send_json({"type": "error", "content": "No hay documentos de specs en el proyecto. Sube un ZIP primero."})
            await websocket.close()
            return

        docs_index = _collect_docs_by_filename(docs)

        # Also collect full context docs (specs/)
        context_docs_text = ""
        for doc in docs:
            if doc.layer == "contexto":
                context_docs_text += f"\n\n# {doc.filename}\n{doc.content}"
        context_docs_text = context_docs_text[:8000]  # cap context size

        # ── Wait for "start" ──
        try:
            raw = await asyncio.wait_for(websocket.receive_json(), timeout=30.0)
        except asyncio.TimeoutError:
            await websocket.close(code=4000)
            return

        if raw.get("type") != "start":
            await websocket.send_json({"type": "error", "content": "Expected {type: 'start'}"})
            await websocket.close()
            return

        # ── Create session ──
        session = AISession(
            project_id=project_id,
            user_id=user_id,
            status="running",
            current_phase=1,
            context={"mode": "specs_to_code"},
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        await websocket.send_json({
            "type": "system",
            "content": f"Pipeline Specs→Code iniciado. {len(docs)} documentos de specs cargados. Generando código en 4 fases..."
        })

        generated_phases: list[dict] = []

        for phase in SPECS_TO_CODE_PHASES:
            phase_id = phase["id"]
            await websocket.send_json({
                "type": "phase_start",
                "phase": phase_id,
                "name": phase["name"],
            })

            # ── Build the prompt for this phase ──
            # 1. Base system prompt
            system_sections = [
                STACK_GUARDRAILS,
                CODE_OUTPUT_FORMAT_RULES,
                phase["systemPrompt"],
            ]

            # 2. Add the specific PROMPT file from the ZIP (if exists)
            prompt_file = phase.get("promptFile")
            if prompt_file and prompt_file in docs_index:
                system_sections.append(
                    f"PROMPT DEL USUARIO PARA ESTA FASE:\n{docs_index[prompt_file][:4000]}"
                )

            # 3. Add support files from the ZIP
            support_content = ""
            for sf in phase.get("supportFiles", []):
                if sf in docs_index:
                    support_content += f"\n\n--- {sf} ---\n{docs_index[sf][:3000]}"
            if support_content:
                system_sections.append(
                    f"ARCHIVOS DE REFERENCIA:{support_content}"
                )

            # 4. Add project context docs
            if context_docs_text:
                system_sections.append(
                    f"ESPECIFICACIONES DEL PROYECTO:{context_docs_text}"
                )

            # 5. Add cumulative context from previous phases
            cumulative = _build_cumulative_context(generated_phases)
            if cumulative:
                system_sections.append(cumulative)

            system_content = "\n\n".join(system_sections)

            messages: list[dict] = [{"role": "system", "content": system_content}]

            # ── Stream AI response ──
            await websocket.send_json({
                "type": "system",
                "content": f"Generando código para: {phase['name']}..."
            })

            ai_response = await stream_openrouter(
                messages,
                websocket,
                max_tokens=phase.get("maxTokens", 8000),
                temperature=0.3,
            )

            if not ai_response:
                # Retry with minimal context
                logger.warning(f"Empty response in specs-to-code phase {phase_id}, retrying with reduced context...")
                await websocket.send_json({
                    "type": "system",
                    "content": f"Reintentando fase {phase_id} con contexto reducido..."
                })
                # Trim cumulative context for retry
                reduced_system = "\n\n".join([
                    STACK_GUARDRAILS,
                    CODE_OUTPUT_FORMAT_RULES,
                    phase["systemPrompt"],
                    _build_cumulative_context(generated_phases)[:3000] if generated_phases else "",
                ])
                retry_messages = [{"role": "system", "content": reduced_system}]
                ai_response = await stream_openrouter(
                    retry_messages,
                    websocket,
                    max_tokens=phase.get("maxTokens", 8000),
                    temperature=0.3,
                )

            if not ai_response:
                await websocket.send_json({
                    "type": "error",
                    "content": f"No se pudo generar código para la fase: {phase['name']}"
                })
                continue

            # ── Store result ──
            generated_phases.append({
                "id": phase_id,
                "name": phase["name"],
                "code": ai_response,
            })

            # Persist AI message
            ai_msg = AIMessage(
                session_id=session.id,
                phase=phase_id,
                role="ai",
                content=ai_response,
            )
            db.add(ai_msg)
            db.commit()

            await websocket.send_json({"type": "phase_end", "phase": phase_id})

            # Update session
            session.current_phase = phase_id + 1
            db.commit()

        # ── Pipeline complete ──
        session.status = "completed"
        db.commit()

        # Count total files generated
        import re
        total_files = 0
        for gp in generated_phases:
            total_files += len(re.findall(r"### Archivo:\s*(.+)", gp["code"]))

        await websocket.send_json({
            "type": "done",
            "content": (
                f"¡Proyecto generado! Se completaron {len(generated_phases)} fases "
                f"con {total_files} archivos de código. "
                f"Descarga el ZIP para obtener el proyecto completo."
            ),
        })

    except WebSocketDisconnect:
        logger.info(f"Specs-to-code WS disconnected for project {project_id}")
    except Exception as exc:
        logger.error(f"Specs-to-code pipeline error: {exc}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "content": str(exc)[:300]})
        except Exception:
            pass
    finally:
        db.close()
        try:
            await websocket.close()
        except Exception:
            pass


# ─── Spec Generator Pipeline ──────────────────────────────────────────────────
#
# WebSocket endpoint that reads raw ZIP docs from generated_docs, runs a
# 7-phase AI pipeline to produce enriched spec documents, accumulates a
# context sheet across phases, saves results back to generated_docs, and
# streams all output to the frontend.
#
# Protocol:
#   Client → Server:  { "type": "start" }
#   Server → Client:  { "type": "phase_start", "phase": int, "name": str }
#                     { "type": "token",        "content": str }
#                     { "type": "phase_end",    "phase": int }
#                     { "type": "done",         "content": str }
#                     { "type": "system",       "content": str }
#                     { "type": "error",        "content": str }

SPEC_GEN_PHASES = [
    {
        "id": 1,
        "filename": "01-contexto-proyecto.md",
        "title": "Contexto del Proyecto",
        "layer": "contexto",
        "maxTokens": 3000,
        "systemPrompt": (
            "Eres un arquitecto de software senior. Analiza los documentos del proyecto "
            "proporcionados (puede ser un levantamiento de requisitos, notas de cliente, "
            "historias de usuario u otros artefactos) y genera el documento "
            "**01-contexto-proyecto.md** en Markdown.\n\n"
            "El documento DEBE contener estas secciones con este orden exacto:\n\n"
            "# Contexto del Proyecto\n\n"
            "## 1. Nombre y descripción general\n"
            "Nombre del sistema, propósito principal (2-3 oraciones).\n\n"
            "## 2. Objetivos del proyecto\n"
            "Lista de 3-6 objetivos concretos y medibles.\n\n"
            "## 3. Stakeholders y actores principales\n"
            "Tabla con columnas: Actor | Rol | Necesidad principal.\n\n"
            "## 4. Stack tecnológico obligatorio\n"
            "- Frontend: Angular (TypeScript)\n"
            "- Backend: FastAPI (Python)\n"
            "- Base de datos: MySQL\n\n"
            "## 5. Alcance del sistema\n"
            "Lo que SÍ incluye y lo que NO incluye (dos sublistas).\n\n"
            "## 6. Restricciones y supuestos\n"
            "Lista de restricciones técnicas, de negocio o de tiempo relevantes.\n\n"
            "Escribe SOLO el contenido Markdown del documento, sin explicaciones previas."
        ),
    },
    {
        "id": 2,
        "filename": "02-especificaciones-funcionales.md",
        "title": "Especificaciones Funcionales",
        "layer": "contexto",
        "maxTokens": 4000,
        "systemPrompt": (
            "Eres un analista funcional senior. Basándote en los documentos del proyecto "
            "y el contexto acumulado, genera el documento "
            "**02-especificaciones-funcionales.md** en Markdown.\n\n"
            "El documento DEBE contener:\n\n"
            "# Especificaciones Funcionales\n\n"
            "## 1. Módulos del sistema\n"
            "Lista de módulos principales con descripción breve de cada uno.\n\n"
            "## 2. Requerimientos funcionales\n"
            "Por cada módulo, lista los RF en formato:\n"
            "### Módulo: <nombre>\n"
            "- RF-XX: <descripción del requerimiento>\n\n"
            "## 3. Requerimientos no funcionales\n"
            "Lista de RNF: rendimiento, seguridad, usabilidad, disponibilidad.\n\n"
            "## 4. Entidades de datos principales\n"
            "Por cada entidad: nombre, descripción, atributos clave y relaciones.\n\n"
            "## 5. Reglas de negocio\n"
            "Lista numerada de reglas de negocio críticas.\n\n"
            "Escribe SOLO el contenido Markdown del documento, sin explicaciones previas."
        ),
    },
    {
        "id": 3,
        "filename": "03-casos-de-uso.md",
        "title": "Casos de Uso",
        "layer": "contexto",
        "maxTokens": 4000,
        "systemPrompt": (
            "Eres un analista de sistemas. Basándote en los documentos del proyecto "
            "y el contexto acumulado, genera el documento "
            "**03-casos-de-uso.md** en Markdown.\n\n"
            "El documento DEBE contener:\n\n"
            "# Casos de Uso\n\n"
            "## Diagrama de actores\n"
            "Lista de actores y sus relaciones con los casos de uso.\n\n"
            "## Casos de uso principales\n"
            "Para cada caso de uso usa EXACTAMENTE este formato:\n\n"
            "### CU-XX: <Nombre del caso de uso>\n"
            "**Actor principal:** <actor>\n"
            "**Precondiciones:** <condiciones>\n"
            "**Flujo principal:**\n"
            "1. <paso 1>\n"
            "2. <paso 2>\n"
            "**Flujos alternativos:** <descripción o N/A>\n"
            "**Postcondiciones:** <resultado>\n\n"
            "Documenta al menos 6 casos de uso cubriendo los módulos identificados.\n"
            "Escribe SOLO el contenido Markdown del documento, sin explicaciones previas."
        ),
    },
    {
        "id": 4,
        "filename": "bd-schema-prompt.md",
        "title": "Prompt Esquema BD",
        "layer": "bd",
        "maxTokens": 3000,
        "systemPrompt": (
            "Eres un DBA experto en MySQL. Basándote en los documentos del proyecto "
            "y el contexto acumulado (entidades, módulos y casos de uso ya identificados), "
            "genera el documento **bd-schema-prompt.md** en Markdown.\n\n"
            "Este documento es un PROMPT DETALLADO para guiar la generación del esquema de BD.\n"
            "DEBE contener:\n\n"
            "# Prompt: Esquema de Base de Datos\n\n"
            "## Tablas requeridas\n"
            "Lista de todas las tablas con sus columnas, tipos MySQL, constraints (PK, FK, UNIQUE, NOT NULL) "
            "y valores por defecto.\n\n"
            "## Relaciones entre tablas\n"
            "Describe cada relación (1:1, 1:N, N:M) con las tablas involucradas y las FK.\n\n"
            "## Índices recomendados\n"
            "Lista de índices para optimizar las consultas más frecuentes.\n\n"
            "## Datos de seed (ejemplos)\n"
            "Para cada tabla principal, muestra 2-3 registros de ejemplo representativos.\n\n"
            "## Instrucción final para el generador\n"
            "Párrafo de instrucción directa al modelo de IA que generará el SQL "
            "(qué debe incluir, qué debe evitar, convenciones de nombres).\n\n"
            "Escribe SOLO el contenido Markdown del documento, sin explicaciones previas."
        ),
    },
    {
        "id": 5,
        "filename": "backend-api-prompt.md",
        "title": "Prompt API Backend",
        "layer": "backend",
        "maxTokens": 3000,
        "systemPrompt": (
            "Eres un ingeniero backend senior especializado en FastAPI y Python. "
            "Basándote en los documentos del proyecto y el contexto acumulado, "
            "genera el documento **backend-api-prompt.md** en Markdown.\n\n"
            "Este documento es un PROMPT DETALLADO para guiar la generación del backend.\n"
            "DEBE contener:\n\n"
            "# Prompt: API Backend con FastAPI\n\n"
            "## Estructura de carpetas\n"
            "Árbol de directorios del proyecto backend con descripción de cada archivo.\n\n"
            "## Endpoints requeridos\n"
            "Por cada entidad/módulo, lista los endpoints en formato:\n"
            "### <Entidad>\n"
            "| Método | Ruta | Descripción | Auth requerida |\n"
            "|--------|------|-------------|----------------|\n\n"
            "## Modelos Pydantic (schemas)\n"
            "Para cada entidad: campos de Create, Update y Response schemas.\n\n"
            "## Lógica de autenticación\n"
            "Describe el sistema de auth: JWT, roles, permisos necesarios.\n\n"
            "## Dependencias y librerías\n"
            "Lista de requirements.txt con versiones exactas.\n\n"
            "## Instrucción final para el generador\n"
            "Párrafo de instrucción directa al modelo que generará el código backend.\n\n"
            "Escribe SOLO el contenido Markdown del documento, sin explicaciones previas."
        ),
    },
    {
        "id": 6,
        "filename": "frontend-components-prompt.md",
        "title": "Prompt Componentes Frontend",
        "layer": "frontend",
        "maxTokens": 3000,
        "systemPrompt": (
            "Eres un ingeniero frontend senior especializado en Angular y TypeScript. "
            "Basándote en los documentos del proyecto y el contexto acumulado, "
            "genera el documento **frontend-components-prompt.md** en Markdown.\n\n"
            "Este documento es un PROMPT DETALLADO para guiar la generación del frontend Angular.\n"
            "DEBE contener:\n\n"
            "# Prompt: Frontend Angular\n\n"
            "## Estructura de módulos y componentes\n"
            "Árbol de componentes Angular agrupados por módulo/feature.\n\n"
            "## Componentes requeridos\n"
            "Por cada componente:\n"
            "### <NombreComponent>\n"
            "- **Tipo:** list / form / detail / layout / shared\n"
            "- **Ruta Angular:** /ruta\n"
            "- **Responsabilidades:** qué hace\n"
            "- **Inputs/Outputs:** @Input y @Output relevantes\n"
            "- **Servicios que consume:** lista de servicios Angular\n\n"
            "## Servicios Angular requeridos\n"
            "Lista de servicios con sus métodos HTTP y URLs de API.\n\n"
            "## Rutas (app-routing)\n"
            "Tabla de rutas con path, componente y guards.\n\n"
            "## Estilos y UI\n"
            "Directivas de TailwindCSS, paleta de colores, patrones de layout.\n\n"
            "## Instrucción final para el generador\n"
            "Párrafo de instrucción directa al modelo que generará el código Angular.\n\n"
            "Escribe SOLO el contenido Markdown del documento, sin explicaciones previas."
        ),
    },
    {
        "id": 7,
        "filename": "04-guia-implementacion.md",
        "title": "Guía de Implementación",
        "layer": "contexto",
        "maxTokens": 3000,
        "systemPrompt": (
            "Eres un arquitecto de software. Basándote en todos los documentos del proyecto "
            "y el contexto acumulado (toda la arquitectura ya definida), "
            "genera el documento **04-guia-implementacion.md** en Markdown.\n\n"
            "El documento DEBE contener:\n\n"
            "# Guía de Implementación\n\n"
            "## 1. Orden de implementación recomendado\n"
            "Lista ordenada de fases: BD → Models → Auth → CRUD → Frontend → Tests → Deploy.\n\n"
            "## 2. Configuración del entorno de desarrollo\n"
            "Pasos exactos para levantar el proyecto localmente (comandos reales).\n\n"
            "## 3. Variables de entorno\n"
            "Tabla con todas las variables .env requeridas, su descripción y valor de ejemplo.\n\n"
            "## 4. Convenciones de código\n"
            "Naming conventions para Python (snake_case), TypeScript (camelCase/PascalCase), "
            "rutas de archivos y nombres de tablas MySQL.\n\n"
            "## 5. Flujo de autenticación\n"
            "Descripción paso a paso del flujo login → JWT → llamadas autenticadas.\n\n"
            "## 6. Estrategia de despliegue\n"
            "Pasos para Docker Compose o despliegue manual en producción.\n\n"
            "## 7. Checklist de validación\n"
            "Lista de verificación antes de entregar el proyecto (tests, lint, build, etc.).\n\n"
            "Escribe SOLO el contenido Markdown del documento, sin explicaciones previas."
        ),
    },
]


@router.websocket("/ws/ai/{project_id}/spec-generator")
async def spec_generator_ws(
    websocket: WebSocket,
    project_id: int,
    token: str = Query(...),
):
    """
    AI Spec Generator Pipeline.

    Reads raw uploaded docs from generated_docs (ZIP upload), runs a 7-phase
    sequential AI pipeline to produce enriched spec documents, accumulates a
    context sheet across phases, saves results back to generated_docs, and
    streams all output to the frontend.
    """
    # ── Auth ──
    user_id = decode_token(token)
    if user_id is None:
        await websocket.close(code=4001)
        return

    db: Session = SessionLocal()
    try:
        user = get_user_by_id(db, user_id)
        if user is None:
            await websocket.close(code=4001)
            return

        await websocket.accept()

        # ── Load raw ZIP docs from DB ──
        raw_docs = db.query(GeneratedDoc).filter(GeneratedDoc.project_id == project_id).all()
        if not raw_docs:
            await websocket.send_json({
                "type": "error",
                "content": "No hay documentos en el proyecto. Sube un ZIP de especificaciones primero.",
            })
            await websocket.close()
            return

        # Build a single text block of all raw docs to provide as input context
        raw_docs_text = ""
        for doc in raw_docs:
            raw_docs_text += f"\n\n---\n## {doc.filename}\n{doc.content}"
        # Cap to avoid token limit issues; each phase prompt adds its own system text
        raw_docs_text = raw_docs_text[:12000]

        # ── Wait for "start" ──
        try:
            raw_msg = await asyncio.wait_for(websocket.receive_json(), timeout=30.0)
        except asyncio.TimeoutError:
            await websocket.close(code=4000)
            return

        if raw_msg.get("type") != "start":
            await websocket.send_json({"type": "error", "content": "Expected {type: 'start'}"})
            await websocket.close()
            return

        await websocket.send_json({
            "type": "system",
            "content": f"Generador de Specs iniciado. {len(raw_docs)} documentos cargados. Comenzando pipeline de 7 fases...",
        })

        # ── Run 7-phase pipeline ──
        context_so_far = ""   # accumulates each phase's output
        generated_docs_output: list[dict] = []

        for phase in SPEC_GEN_PHASES:
            phase_id = phase["id"]

            await websocket.send_json({
                "type": "phase_start",
                "phase": phase_id,
                "name": phase["title"],
            })

            # Build messages for this phase
            system_sections = [
                STACK_GUARDRAILS,
                phase["systemPrompt"],
            ]

            # Add raw input docs
            system_sections.append(
                f"DOCUMENTOS RAW DEL PROYECTO (input del usuario):\n{raw_docs_text}"
            )

            # Add accumulated context from previous phases
            if context_so_far:
                system_sections.append(
                    f"CONTEXTO ACUMULADO DE FASES ANTERIORES "
                    f"(usa esto como base para mantener consistencia):\n{context_so_far[:6000]}"
                )

            system_content = "\n\n".join(system_sections)
            messages: list[dict] = [{"role": "system", "content": system_content}]

            await websocket.send_json({
                "type": "system",
                "content": f"Generando {phase['filename']}...",
            })

            ai_response = await stream_openrouter(
                messages,
                websocket,
                max_tokens=phase.get("maxTokens", 3000),
                temperature=0.4,
            )

            # Retry with reduced context if no response
            if not ai_response:
                await websocket.send_json({
                    "type": "system",
                    "content": f"Reintentando fase {phase_id} con contexto reducido...",
                })
                reduced_system = "\n\n".join([
                    STACK_GUARDRAILS,
                    phase["systemPrompt"],
                    f"DOCUMENTOS RAW DEL PROYECTO:\n{raw_docs_text[:4000]}",
                ])
                retry_messages = [{"role": "system", "content": reduced_system}]
                ai_response = await stream_openrouter(
                    retry_messages,
                    websocket,
                    max_tokens=phase.get("maxTokens", 3000),
                    temperature=0.4,
                )

            if not ai_response:
                await websocket.send_json({
                    "type": "error",
                    "content": f"No se pudo generar {phase['filename']}. Continuando con la siguiente fase...",
                })
                await websocket.send_json({"type": "phase_end", "phase": phase_id})
                continue

            # Accumulate context sheet
            context_so_far += f"\n\n=== {phase['filename']} ===\n{ai_response[:2000]}"

            generated_docs_output.append({
                "filename": phase["filename"],
                "title": phase["title"],
                "layer": phase["layer"],
                "content": ai_response,
            })

            await websocket.send_json({"type": "phase_end", "phase": phase_id})

        # ── Save all generated docs to DB (bulk replace) ──
        if generated_docs_output:
            await websocket.send_json({
                "type": "system",
                "content": "Guardando documentos generados en la base de datos...",
            })
            try:
                # Delete existing generated docs for this project and replace with new ones
                db.query(GeneratedDoc).filter(GeneratedDoc.project_id == project_id).delete()
                db.commit()

                for doc_data in generated_docs_output:
                    new_doc = GeneratedDoc(
                        project_id=project_id,
                        filename=doc_data["filename"],
                        title=doc_data["title"],
                        layer=doc_data["layer"],
                        content=doc_data["content"],
                        generated_at=datetime.utcnow(),
                    )
                    db.add(new_doc)

                db.commit()
                await websocket.send_json({
                    "type": "system",
                    "content": f"{len(generated_docs_output)} documentos guardados correctamente.",
                })
            except Exception as db_exc:
                logger.error(f"Error saving spec docs to DB: {db_exc}", exc_info=True)
                await websocket.send_json({
                    "type": "system",
                    "content": f"Advertencia: no se pudieron guardar en BD ({str(db_exc)[:100]}). Los docs están disponibles en el frontend.",
                })

        await websocket.send_json({
            "type": "done",
            "content": (
                f"¡Specs generadas con IA! {len(generated_docs_output)} de 7 documentos completados. "
                f"Descarga el ZIP de specs o continúa con 'Generar Proyecto' para producir el código."
            ),
        })

    except WebSocketDisconnect:
        logger.info(f"Spec-generator WS disconnected for project {project_id}")
    except Exception as exc:
        logger.error(f"Spec-generator pipeline error: {exc}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "content": str(exc)[:300]})
        except Exception:
            pass
    finally:
        db.close()
        try:
            await websocket.close()
        except Exception:
            pass
