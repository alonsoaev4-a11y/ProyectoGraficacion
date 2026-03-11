from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import engine, Base

# Import all models so they register with Base.metadata
from . import models  # noqa: F401

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="Plataforma Meta-CASE / Low-Code para automatización de ingeniería de software",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Events ────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    """Create all tables if they don't exist (dev convenience)."""
    Base.metadata.create_all(bind=engine)


# ── Health ────────────────────────────────────────────────
@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "app": settings.APP_NAME}


# ── Routers ───────────────────────────────────────────────
from .routers import auth as auth_router
from .routers import projects as projects_router
from .routers import metadatos as metadatos_router
from .routers import requirements as requirements_router
from .routers import use_cases as use_cases_router
from .routers import data_model as data_model_router
from .routers import diagrams as diagrams_router
from .routers import generation as generation_router
from .routers import ai as ai_router
from .routers import members as members_router
from .routers import audit as audit_router

app.include_router(auth_router.router)
app.include_router(projects_router.router)
app.include_router(metadatos_router.router)
app.include_router(requirements_router.router)
app.include_router(use_cases_router.router)
app.include_router(data_model_router.router)
app.include_router(diagrams_router.router)
app.include_router(generation_router.router)
app.include_router(ai_router.router)
app.include_router(members_router.router)
app.include_router(audit_router.router)
