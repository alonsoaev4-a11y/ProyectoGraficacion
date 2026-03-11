# PROJECT_STATUS.md — Herman Platform

> Generado el: 28/02/2026  
> Actualizado el: 08/03/2026 (Integración Pipeline IA, Backend Real, Generación Angular/FastAPI/MySQL)  
> Basado en: análisis exhaustivo del proyecto y cambios recientes  
> Propósito: guía completa de estado del proyecto para cualquier desarrollador que se una al equipo

---

## 1. ¿Qué es el proyecto?

### Descripción general

**Herman** es una plataforma **Meta-CASE / Low-Code / No-Code** para automatización de ingeniería de software asistida por IA. Su objetivo principal es guiar a equipos de desarrollo a través de un pipeline estructurado que va desde la captura de requisitos hasta la **generación automática de documentación técnica** lista para usar como base de implementación.

El nombre del paquete en `package.json` es `@figma/my-make-file` — un nombre residual del template de Figma Plugin con el que se inició el proyecto. No refleja la identidad real de la aplicación.

### Propósito principal

Permitir que un equipo de software (o un desarrollador individual) construya una aplicación completa siguiendo estos pasos guiados dentro de la plataforma:

1. **Metadatos** — Recolección de contexto del proyecto mediante entrevistas, encuestas (estructuradas con preguntas tipadas), historias de usuario, observación y análisis documental (con vista consolidada editable).
2. **Requisitos** — Captura y gestión de requisitos funcionales y no funcionales.
3. **Casos de Uso** — Modelado de casos de uso con flujos principales, flujos alternativos, actores, precondiciones, postcondiciones, reglas de negocio y excepciones.
4. **Diagrama de Flujo** — Editor visual de flujos con nodos semánticos (decisión, proceso, DB, usuario, inicio/fin). Se auto-genera desde el primer caso de uso disponible.
5. **Modelado de Datos** — Diseño visual de tablas relacionales con generación de schema Prisma y preview DDL SQL.
6. **Generación de Documentación** — Compilación de toda la información capturada en 6 documentos Markdown descargables.
7. **Auditoría** — Registro de cambios y trazabilidad del proyecto.
8. **Configuración** — Gestión de equipo, integraciones, seguridad y preferencias.

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework UI | React 18 |
| Build tool | Vite 6.3.5 |
| Lenguaje | TypeScript 5 (modo strict) |
| Estilos | Tailwind CSS v4 (plugin Vite-nativo) + CSS custom properties |
| Routing | React Router DOM v7.13 |
| Animaciones | Framer Motion |
| Componentes primitivos | Radix UI (28+ paquetes) |
| UI Material | MUI v7 + Emotion (instalado, uso mínimo) |
| Iconos | Lucide React |
| Notificaciones | Sonner (toasts) |
| Gráficas | Recharts |
| Drag & Drop | React DnD |
| Parsing documentos | Mammoth (.docx), pdfjs-dist (PDF), papaparse (CSV), xlsx (Excel) |
| IA / Audio | Groq API (Whisper — transcripción de audio) |
| ORM (generado) | Prisma (el código generado apunta a Prisma) |

### Tipo de aplicación

- **SPA (Single Page Application)** — sin backend real
- **Frontend-only** — toda la lógica vive en el cliente
- **No hay base de datos real** — los datos son mock/hardcodeados o guardados en `localStorage`
- **No hay autenticación real** — la auth es simulada con `localStorage`

### Arquitectura general

```
src/
├── core/          # Motor TypeScript puro (compilador, BD, generación, conversión)
├── app/           # Capa de aplicación (componentes, layout, vistas de acciones)
├── components/    # Componentes reutilizables (landing, UI, wizard)
├── pages/         # Páginas por ruta (incluyendo metadatos como módulo propio)
├── hooks/         # Hooks personalizados
├── config/        # Configuración del sistema wizard
├── styles/        # Archivos CSS globales
├── utils/         # Utilidades (analizador, extractores, transcriptor)
└── lib/           # Helpers de librerías (cn utility)
```

---

## 2. ¿Qué llevamos implementado?

### Autenticación y sesión (simulada)

- [x] Hook `useSimulatedAuth` — login/logout con `localStorage` (clave `herman_auth`)
- [x] `ProtectedRoute` — redirige a `/login` si no hay sesión activa
- [x] `AuthLayout` — layout compartido para Login y Register
- [x] `LoginPage` — formulario con validación (email + contraseña mínimo 6 chars), simula delay de red
- [x] `RegisterPage` — formulario de registro (aceptar cualquier dato — no hay backend)

### Landing page

- [x] `LandingPage` — página de presentación con secciones completas
- [x] `Header` — navbar con scroll-aware styling y menú mobile
- [x] `Hero` — sección hero con animaciones Framer Motion y CTA
- [x] `Features` — grid de características de la plataforma
- [x] `HowItWorks` — sección de 3 pasos (contenido placeholder visual)
- [x] `MiniDemo` — demo interactiva de drag-and-drop con React DnD
- [x] `Testimonials` — testimonios (datos ficticios/placeholder)
- [x] `Footer` — footer con links (todos apuntan a `#` — stubs)

### Sistema de layout del dashboard

- [x] `DashboardLayout` — layout principal con sidebar, topbar y área de contenido
- [x] `Sidebar` / `BarraLateral` — sidebar oscuro con navegación, colapso mobile
- [x] `TopBar` / `BarraSuperior` — barra superior con breadcrumb y notificaciones
- [x] `ProjectModuleLayout` — layout específico para módulos dentro de un proyecto

### Dashboard principal

- [x] `DashboardPage` — listado de proyectos con búsqueda, filtros por estado, grid/lista
- [x] `TarjetaProyecto` — card de proyecto con barra de progreso y acciones hover
- [x] `ModalCrearProyecto` — modal de creación con: nombre, descripción, tipo, template (CRUD/Ecommerce/Blog), stack multi-select, lenguaje
- [x] `DetalleProyecto` — **componente central hub** — portal full-screen con sidebar de 9 tabs y estado levantado (lifted state) de todos los módulos
- [x] `EstadosVacios` — estados vacíos para 5 tipos de entidades (proyectos, requisitos, casos de uso, tablas, auditoría)
- [x] `StatsCards` — tarjetas de estadísticas animadas (datos mock)

### Módulo: Metadatos (`/metadatos`)

- [x] `MetadatosPage` — módulo completo con `useReducer` (`metadatosReducer.ts`)
- [x] **Cascade sync automático**: `onDataChange` prop emite `buildOutputJson(state)` en cada cambio de estado → `DetalleProyecto` recibe los metadatos y los pasa a `GeneradorCodigo` y `EditorDiagramaFlujo` automáticamente, sin botón de sincronización manual.
- [x] 8 secciones implementadas:
  - `SeccionInfoGeneral` — nombre, descripción, tipo de app, industria, plataforma
  - `SeccionMetodos` — selección de métodos de recolección (5 opciones)
  - `SeccionEntrevista` — ✅ **Reescrita (Sesión 7)**: eliminada sección de configuración completa (tipo de entrevista, roles TagInput, num entrevistados, duración, temas clave, toggle "¿grabada?"). Las entrevistas realizadas son ahora el contenido top-level. Campo `rol` cambiado de `<select>` a `<input>` libre. Botón "Guardar hallazgos" con toast en sección de hallazgos generales. Sin upload de archivos/audio.
  - `SeccionEncuesta` — ✅ **Mejorada (Sesión 7)**: modelo `Encuesta > Preguntas` (4 tipos: abierta, opción múltiple, escala, sí/no). Sección de hallazgos **siempre visible** (sin condición `encuestas.length > 0`), layout vertical, textarea más grande (4 rows), contador de caracteres, indicador "✓ Listo para análisis" y botón "Guardar hallazgos" con toast independiente. Sin upload de archivos/audio.
  - `SeccionHistorias` — ✅ **Limpiada (Sesión 7)**: eliminados `SubidorArchivo`, `handleImport` (50+ líneas), estado `importOpen`, botón "Importar historias". Conservado botón "Exportar CSV". Añadido botón "Guardar criterios" con toast en criterios generales de aceptación. Sin upload de archivos.
  - `SeccionObservacion` — ✅ **Limpiada (Sesión 7)**: eliminado toggle "¿Se grabará la sesión? Sí/No" completo y su grid de 2 columnas. Duración estimada queda como campo individual. Botón "Guardar hallazgos" con toast en contenedor destacado. Sin upload de archivos/audio.
  - `SeccionAnalisisDocumental` — ✅ **Reescrita (Sesión anterior)**: solo **sección A** (Resumen consolidado del levantamiento) — vista consolidada editable que fusiona datos de las 4 secciones de levantamiento (entrevista, encuesta, historias, observación) antes de generar el análisis. Eliminadas secciones B y C con SubidorArchivo, checkboxes, tipos de documento, etc.
  - `SeccionResumen` — resumen generado + JSON de metadatos completo
- [x] `metadatosReducer.ts` — extendido con `PreguntaEntrevista` interface, campo `preguntas[]` en `EntrevistaItem`, acciones `ADD/UPDATE/REMOVE_PREGUNTA_ENTREVISTA`
- [x] `ListaDinamica` — componente de lista con add/remove
- [x] `SeccionMetodo` — componente wrapper de sección con collapse
- [x] `JsonPreview` — preview colapsable del JSON generado con copy-to-clipboard
- [x] `TagInput` — componente **compartido** con prop opcional `color` para theming por acento; importado por todas las secciones (eliminadas 5 copias inline)
- [x] `useToast` — soporta mensaje personalizado como primer argumento: `useToast('Hallazgos guardados')` — permite múltiples instancias con mensajes distintos en el mismo componente
- [x] Exportación del JSON de metadatos

### Módulo: Requisitos

- [x] `EditorRequisitos` — editor CRUD completo con:
  - Filtros por estado, prioridad y búsqueda
  - Modal de creación/edición con todos los campos
  - Exportación a CSV
  - Bulk delete
  - Wizard integration (`data-wizard-target` attrs)
- [x] `CapturaRequisitos` — versión simplificada legacy (sin filtros ni CSV)

### Módulo: Casos de Uso

- [x] `EditorCasosUso` — orquestador que navega entre lista y detalle
- [x] `UseCaseList` — grid de tarjetas de casos de uso
- [x] `UseCaseDetail` — editor completo con:
  - Flujo principal (steps con tipo semántico, actor, descripción, semantics del compilador)
  - Flujos alternativos
  - Actores (nombre, tipo, descripción)
  - Precondiciones y postcondiciones
  - Reglas de negocio con nivel de enforcement
  - Excepciones globales con HTTP status y recovery action
- [x] `StepItem` — fila de paso con edición inline y selector de tipo AST
- [x] `SectionList` — lista reutilizable con add/remove
- [x] `HelpTooltip` — tooltip de ayuda con hover
- [x] `types.ts` — sistema de tipos orientado al compilador: `StepType`, `ActionSemantics`, `BusinessRule`, `GlobalException`, `Actor`, `Step`, `AlternativeFlow`, `UseCase`, `Catalogs`, `SystemRole`, `CRUDImpact`

### Módulo: Diagrama de Flujo

- [x] `EditorDiagramaFlujo` — editor de canvas SVG con:
  - Paleta de nodos arrastrables (inicio, fin, proceso, decisión, DB, usuario, conector)
  - Conexiones SVG entre nodos
  - Panel de controles (zoom, fit, limpiar)
  - Gestión de selección de nodos
  - **Auto-generación desde casos de uso**: acepta prop `useCases?: UseCase[]`; cuando el canvas está en su estado por defecto, genera automáticamente los nodos y conexiones a partir del primer caso de uso disponible (`useCases[0].steps`)
- [x] `FlowPropertyPanel` — panel derecho de propiedades del nodo seleccionado

### Módulo: Modelado de Datos

- [x] `ModeladorDatos` — modelador visual con:
  - Tablas arrastrables en canvas
  - Líneas SVG de relaciones (one-to-one, one-to-many, many-to-many)
  - Panel de propiedades de campo
  - Preview de DDL SQL con syntax highlighting
  - Botón de copy del DDL
- [x] `ModeladoPage` — página del módulo con integración a `PrismaGenerator`
- [x] Preview de schema generado con `dangerouslySetInnerHTML` (syntax highlight manual)

### Módulo: Generación de Documentación y Código (Pipeline IA)

- [x] `GeneradorCodigo` — *(Actualizado)* UI completa con:
  - Generación de artefactos para el stack objetivo: **Angular, FastAPI y MySQL** (Pydantic schemas, SQLAlchemy models, Angular components/routes).
  - Generación de 6 archivos Markdown detallados.
  - Generación de código fuente a través de descargas.
  - UI de tabs para previsualizar cada documento generado.
  - Botón "Descargar Proyecto (ZIP)" que empaqueta todo el código autogenerado en carpetas (`backend`, `frontend`, `database`, `specs`) junto con un archivo `LEEME_PASOS_A_SEGUIR.md`.
- [x] `PanelIA` — Pipeline de IA en tiempo real (WebSocket) con 7 fases:
  - Fases interactivas para Análisis, Arquitectura, Testing e Integración.
  - Botones de acción rápida ("Proceder sin cambios", "Aprobar") para acelerar la interacción.
  - Backend real en Python (FastAPI) usando OpenRouter (qwen/qwen3.5-35b-a3b).
  - Gestión robusta de historiales para evitar el límite de tokens (context window) de la IA.
- [x] `GeneracionPage` — página del módulo

### Módulo: Auditoría

- [x] `RegistroAuditoria` — tabla de logs con:
  - Filtros por tipo de acción y búsqueda
  - Badges de estado
  - Paginación (UI solamente — sin funcionalidad real)
- [x] `AuditoriaPage` — página del módulo

### Módulo: Configuración

- [x] `PanelConfiguracion` — panel de 5 tabs:
  - Info del proyecto
  - Usuarios y equipo (con modal de invitación)
  - Integraciones (GitHub, GitLab, Webhooks)
  - Seguridad (RBAC con 3 roles predefinidos)
  - Idioma y notificaciones
- [x] `ConfiguracionPage` — página del módulo
- [x] `ConfiguracionAPIKeys` — modal para guardar/verificar Groq API key en `localStorage`

### Módulo: Equipos (`/equipos`)

- [x] `EquiposPage` — página de equipos con creación de equipos
- [x] `TeamCard` — tarjeta de equipo

### Motor central (`src/core/`)

#### Compilador (`src/core/compiler/`)
- [x] `types.ts` — tipos del compilador: `Token`, `ASTNode` (8 tipos), `IRInstruction`, `IRFunction`, `CompiledModule`, `CompilerError`
- [x] `lexer/lexer.ts` — lexer completo con tokenización de FlowNode → Token stream
- [x] `parser/parser.ts` — parser recursivo descendente que genera AST desde tokens
- [x] `semantics/analyzer.ts` — análisis semántico: resolución de símbolos, validación de tipos, inferencia, tabla de símbolos
- [x] `ir/builder.ts` — IR Builder: convierte AST → Map<string, IRInstruction[]> (formato v2 moderno)
- [x] `ir/types.ts` — tipos del IR: `IRInstructionType` (enum de 13 tipos), `IRInstruction`, `IRFunction` para el sistema v2
- [x] `codegen/generator.ts` — generador de código: convierte IR → TypeScript/Next.js API routes
- [x] `pipeline.ts` — pipeline completo: orquesta todas las etapas, maneja errores, expone `compile()`

#### Base de datos (`src/core/database/`)
- [x] `types.ts` — tipos: `Column`, `Table`, `Relationship`, `DatabaseSchema`, `SchemaDiff`, `Migration`, `MigrationVersion`
- [x] `prisma-generator.ts` — generador de `schema.prisma` a partir del modelo visual
- [x] `model-diff.ts` — `ModelDiffer`: comparación de schemas para detectar cambios
- [x] `versioning.ts` — `SchemaVersioning`: historial de versiones del schema
- [x] `migration-service.ts` — **stub** — interfaz completa pero implementación mock
- [x] `migrations.md` — documentación de arquitectura del sistema de migraciones

#### Conversión (`src/core/conversion/`)
- [x] `types.ts` — tipos de conversión: `FlowNode`, `FlowEdge`, `FlowDiagram`, `ConversionResult`
- [x] `flow-validator.ts` — `FlowValidator`: valida integridad estructural de un diagrama de flujo
- [x] `flow-to-ast.ts` — `FlowToAstConverter`: convierte diagrama visual → `Step[]` + `AlternativeFlow[]`

#### Generación (`src/core/generation/`)
- [x] `type-inference.ts` — `inferType()` / `inferTsType()`: heurísticas para inferir tipos Zod/TS de nombres de campos (español + inglés)
- [x] `usecase-transpiler.ts` — `UseCaseTranspiler`: genera handlers Next.js API desde `UseCase`
- [x] `orchestrator.ts` — `Orchestrator`: valida casos de uso contra el modelo de datos

#### Trazabilidad (`src/core/traceability/`)
- [x] `types.ts` — tipos de trazabilidad: `TraceLink`, `TraceMatrix`, `TraceReport` (solo tipos, sin implementación)

### Sistema Wizard / Onboarding

- [x] `WizardProvider` / `WizardContext` — contexto global del wizard con estado persistido en `localStorage` (`herman_wizard_progress`)
- [x] `WizardButton` — botón flotante para activar/desactivar el wizard
- [x] `WizardOverlay` — overlay completo con tooltip + spotlight + navegación
- [x] `WizardTooltip` — tooltip posicionado del wizard
- [x] `WizardSpotlight` — spotlight circular sobre el elemento target
- [x] `wizardSteps.ts` — 720 líneas de configuración de pasos para 8 módulos: `dashboard`, `requisitos`, `casosUso`, `diagramaFlujo`, `modelado`, `generacion`, `auditoria`, `configuracion`

### Utilidades

- [x] `analizadorHerman.ts` — analizador de texto en español con regex: extrae requisitos, casos de uso, actores, entidades desde texto libre
- [x] `extractores.ts` — extracción de contenido de archivos: Word (mammoth), PDF (pdfjs-dist con progress), CSV (papaparse), Excel (xlsx), TXT
- [x] `transcriptorAudio.ts` — transcripción de audio vía Groq Whisper API (key en `localStorage`)
- [x] `SubidorArchivo.tsx` — componente de upload de archivos con drag-and-drop, preview CSV/Excel, límite 25MB
- [x] `SubidorAudio.tsx` — componente de upload de audio + grabación en vivo con `MediaRecorder`

### Componentes UI

- [x] `src/components/ui/` — Button (5 variantes + framer-motion), Card, GlassCard, Input
- [x] `src/app/components/ui/` — 48 componentes shadcn/ui style (Radix UI primitives): accordion, alert, avatar, badge, calendar, checkbox, dialog, dropdown, form, popover, select, sheet, table, tabs, tooltip, etc.
- [x] `src/lib/utils.ts` — función `cn()` (clsx + tailwind-merge)

### CSS / Diseño

- [x] `styles/index.css` — punto de entrada de todos los estilos
- [x] `styles/theme.css` — tokens CSS: `--accent-cyan` (#00abbf), `--accent-purple` (#9d22e6), dark theme vars
- [x] `styles/cyberpunk.css` — sistema de componentes "Cyberpunk White": `.cyber-card`, `.cyber-btn-*`, `.cyber-input`, `.cyber-sidebar-*`, etc.
- [x] `styles/dashboard.css` — estilos del layout dashboard
- [x] `styles/wizard.css` — estilos del sistema wizard/tour
- [x] `styles/tailwind.css` — config Tailwind v4
- [x] `pages/metadatos/metadatos.css` — 790 líneas de estilos propios del módulo Metadatos

---

## 3. ¿Qué puede faltar?

Basado en el contexto del proyecto y la arquitectura detectada, se identifican las siguientes funcionalidades que probablemente deberían existir pero no están presentes o están incompletas:

### Backend / Persistencia real
- ✅ **Backend base implementado**: Se creó el servidor FastAPI (`/backend`) con SQLite/MySQL para soportar la ejecución del pipeline de IA vía WebSockets y el registro de sesiones.
- **Guardado de proyectos integral**: Todavía es necesario conectar todo el estado frontend a este backend para que los proyectos persistan completamente entre sesiones.
- **No hay autenticación real completa**: Hay una validación básica por token para el pipeline, pero falta integración con un proveedor robusto (NextAuth, Supabase, Clerk, Auth0) o flujo completo en backend.

### Integraciones externas y de Correo
- ⚠️ **APIs de Correo (Gmail / Google Workspace)**: Pendientes. Falta implementar el envío de correos, notificaciones de proyecto, o exportaciones directas hacia herramientas de Google, según los requerimientos solicitados.
- **GitHub/GitLab**: botones presentes en `PanelConfiguracion.tsx` pero sin handlers — la integración para push del código generado a repositorios remotos no está implementada.
- **Webhooks**: sección presente pero sin funcionalidad.

### Exportación
- **Exportación SVG/PNG** del diagrama de flujo: stub con `alert()`.
- **Exportación ZIP del proyecto** desde `DetalleProyecto.tsx`: stub con `alert()`.
- ✅ **ZIP de código generado**: **Completado** — `GeneradorCodigo` empaqueta el código generado por las capas (frontend, backend, base de datos) junto con el manual de instrucciones.

### Flujo de datos
- ✅ **Propagación entre módulos**: `cascade sync` automático implementado: `MetadatosPage` emite `buildOutputJson(state)` en cada cambio de estado, y `DetalleProyecto` lo propaga a `GeneradorCodigo` y `EditorDiagramaFlujo` sin interacción manual. Sigue pendiente la persistencia unificada en base de datos real.

---

## 4. Funcionalidades faltantes o incompletas

### Stubs con `alert()` (funcionalidad vacía)

| Archivo | Función | Descripción |
|---------|---------|-------------|
| `EditorDiagramaFlujo.tsx` | `handleExportSVG()` | Solo llama a `alert('Exportando SVG...')` |
| `EditorDiagramaFlujo.tsx` | `handleExportPNG()` | Solo llama a `alert('Exportando PNG...')` |
| `DetalleProyecto.tsx` | `handleExportZip()` | Solo llama a `alert('Exportando proyecto como ZIP...')` |
| ✅ `GeneradorCodigo.tsx` | Botón "Descargar Proyecto (ZIP)" | Completamente funcional, empaqueta el código IA y un LEEME. |

### APIs y Servicios Externos (Pendientes)

| Servicio | Estado | Descripción |
|----------|--------|-------------|
| **Google Gmail API** | Pendiente | Integración para envío de emails transaccionales, invitaciones a usuarios o alertas. Mencionada como requerimiento clave próximo. |
| **Google Workspace** | Pendiente | Integración con Drive/Docs si se requiere exportación directa en lugar de ZIP. |
| **GitHub / GitLab** | Pendiente | Push de código generado directo a repositorio en lugar de descargar local. |

### Imports rotos (errores TypeScript críticos)

| Archivo | Import roto | Causa |
|---------|-------------|-------|
| `src/core/compiler/ir/generator.ts` | `IRProgram`, `IRBlock`, `IRInstruction` from `'../types'` | Estos tipos fueron movidos a `./types` (IR v2), el archivo quedó obsoleto |
| `src/core/compiler/optimizer/optimizer.ts` | `IRProgram` from `'../types'` | Mismo problema — `IRProgram` ya no existe en `../types` |
| ~~`src/pages/metadatos/secciones/SeccionEntrevista.tsx`~~ | ~~`Info` from `'lucide-react'`~~ | ✅ **Resuelto en Fase 1** — `Info` añadido al import |

> Nota: `ir/generator.ts` es código **muerto** — fue reemplazado por `ir/builder.ts` y nunca es importado por `pipeline.ts`. Puede eliminarse con seguridad.

### Implementaciones mock / stub

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `src/core/database/migration-service.ts` | **Stub completo** | Toda la implementación retorna SQL placeholder: `"-- Migration generated at [timestamp]"`. Nunca genera SQL real. |
| `src/core/compiler/optimizer/optimizer.ts` | **Bypaseado** | El pipeline lo omite con un comentario TODO. La optimización (dead code elimination, instruction fusion) no está implementada. |
| `RegistroAuditoria.tsx` | **Mock** | Los logs de auditoría son 100% datos hardcodeados estáticos. |
| `PanelConfiguracion.tsx` | **Mock** | Los usuarios del equipo son datos hardcodeados. Los botones de GitHub/GitLab/SSO no tienen handlers. |
| `StatsCards.tsx` | **Mock** | Las 4 estadísticas (12 proyectos, 124h ahorradas, 45 modelos, 89 APIs) son hardcodeadas. |

### Código incompleto en el generador de código (`codegen/generator.ts`)

| Instrucción IR | Estado |
|----------------|--------|
| `DB_UPDATE` | Genera `where: { ... }` como placeholder literal |
| `DB_FIND` | No tiene handler — no genera código |
| `DB_DELETE` | No tiene handler — no genera código |
| `VALIDATE` | No tiene handler — no genera código |
| `JUMP_IF` | Solo genera un comentario `// Branch: condition` |

### Código incompleto en `usecase-transpiler.ts`

| Caso | Estado |
|------|--------|
| `SYSTEM_PROCESS` step type | Genera `// TODO: implement system process logic` |
| Operaciones `delete`, `find`, `list` | No hay generación de código para estas operaciones CRUD |

### WIZARD_CONFIGS faltantes (error de runtime)

`EquiposPage.tsx` referencia:
- `WIZARD_CONFIGS.gestionEquipos`
- `WIZARD_CONFIGS.crearEquipo`

Ninguno de los dos existe en `src/config/wizardSteps.ts`. Esto lanza un error de runtime al navegar a `/equipos`.

### Paginación sin funcionalidad

`RegistroAuditoria.tsx` — los botones "Anterior" y "Siguiente" están renderizados pero no tienen handlers conectados. La paginación es solo visual.

### Drag-and-drop de nodos en el diagrama de flujo

`EditorDiagramaFlujo.tsx` — los nodos tienen el atributo `draggable` configurado, pero no hay `onDragEnd` que actualice las coordenadas en el estado. Los nodos no se pueden reposicionar en el canvas.

### Posición de tablas en el modelador de datos

`ModeladorDatos.tsx` — similar al diagrama, las tablas son "arrastrables" en concepto pero el manejo de posición necesita verificación de si persiste correctamente al soltar.

### `fonts.css` vacío

`src/styles/fonts.css` — el archivo existe y es importado por `index.css` pero está completamente vacío (0 bytes). No se están cargando fuentes personalizadas.

### Avatar de usuario hardcodeado

`BarraSuperior.tsx` — el avatar del usuario siempre muestra "JD" / "John Doe" / "Admin" independientemente del usuario que haya iniciado sesión.

---

## 5. Cosas por mejorar

### Calidad de código

#### Código duplicado
- ~~**`TagInput`**: el componente `src/pages/metadatos/components/TagInput.tsx` existe como componente compartido, pero está **duplicado inline** en 5 archivos de secciones.~~ ✅ **Resuelto en Fase 6** — Las 5 copias inline fueron eliminadas de `SeccionEntrevista.tsx`, `SeccionEncuesta.tsx`, `SeccionHistorias.tsx`, `SeccionObservacion.tsx` y `SeccionAnalisisDocumental.tsx`. Todas importan el componente compartido. `TagInput` también fue actualizado con prop `color` opcional para theming por acento.

- **Icono `Plus`**: definido como SVG inline tanto en `DashboardPage.tsx` como en `ConfiguracionPage.tsx` en lugar de importar `Plus` de `lucide-react`.

- **`CapturaRequisitos.tsx`**: es una versión legacy más simple de `EditorRequisitos.tsx`. Parece código obsoleto que puede eliminarse.

#### Tipado débil
- `FlowPropertyPanel.tsx` — usa `node: any` en lugar del tipo `FlowNode` compartido de `src/core/conversion/types.ts`.
- `optimizer/optimizer.ts` — múltiples parámetros tipados como `any` implícito.
- `EditorDiagramaFlujo.tsx` — varios handlers usan `any` en lugar de tipos específicos.

#### Dos sistemas de UI en coexistencia
Hay dos capas de componentes UI que coexisten y generan confusión:
- `src/components/ui/` — componentes custom con tema dark/cyberpunk (Button, Card, GlassCard, Input)
- `src/app/components/ui/` — 48 componentes shadcn/ui style con Radix UI

No hay una guía clara de cuándo usar cada sistema. Esto genera inconsistencias visuales y duplicación.

### Manejo de errores

- Los llamados a la Groq API en `transcriptorAudio.ts` tienen try/catch básicos pero no muestran mensajes de error específicos al usuario.
- ~~`SubidorArchivo.tsx` — errores en extracción~~ ✅ **Resuelto (Sesión 7)** — `SubidorArchivo` fue eliminado de todas las secciones del módulo Metadatos.
- La extracción de PDF con `pdfjs-dist` puede fallar silenciosamente en archivos malformados.
- `analizadorHerman.ts` no tiene manejo de errores — si el texto de entrada está malformado, puede retornar resultados vacíos sin advertencia.
- `compile()` en `pipeline.ts` retorna errores como objetos pero no todos los llamadores validan el campo `errors`.

### Seguridad

- La **Groq API key se almacena en `localStorage`** como texto plano (`herman_groq_key`). Esto es aceptable para un prototipo pero no para producción — debería ir en variables de entorno del servidor.
- `dangerouslySetInnerHTML` se usa en `ModeladoPage.tsx` para renderizar el schema Prisma con syntax highlighting. Si el contenido no está sanitizado podría ser un vector XSS (en este caso es contenido generado internamente, pero es una práctica a revisar).
- `window.confirm()` se usa en `SeccionMetodos.tsx` para confirmación de acciones destructivas. Debería reemplazarse por un modal React propio (rompe el flujo de la UI y no puede ser estilizado).

### Rendimiento

- `DetalleProyecto.tsx` tiene todo el estado levantado y renderiza todos los módulos — esto puede causar re-renders costosos. Considerar memoización con `React.memo` y `useMemo`/`useCallback` para las funciones que se pasan como props.
- Los 48 componentes shadcn en `src/app/components/ui/` probablemente se importan en bundle aunque muchos no se usen. Considerar tree-shaking o lazy loading.
- `analizadorHerman.ts` ejecuta regex pesadas de forma síncrona en el hilo principal — para textos largos podría bloquear la UI. Considerar `Web Worker`.

### Malas prácticas

- El `package.json` tiene nombre `@figma/my-make-file` — debería actualizarse a algo representativo del proyecto.
- `test-compiler.ts` en la raíz del proyecto es un archivo de prueba ad-hoc que no usa ningún framework de testing. Debería moverse a un directorio `tests/` o reemplazarse con tests formales (Vitest).
- No hay ningún test automatizado en todo el proyecto.
- No hay archivo `.env.example` — las variables de entorno no están documentadas.
- `tsc_output.txt` con 71 errores del compilador está commiteado en el repositorio. Debería eliminarse o ignorarse vía `.gitignore`.

### Accesibilidad (a11y)

- Los botones de icono (sin texto visible) en varios componentes no tienen `aria-label`.
- El sistema wizard no gestiona el foco del teclado correctamente al abrir/cerrar.
- Los modales no tienen gestión de focus trap.

---

## 7. Próximos pasos recomendados

1. **Integración de APIs de Google**:
   - Configurar credenciales OAuth2 de Google Cloud.
   - Implementar endpoints en el nuevo Backend FastAPI para conectarse con Gmail (envío de notificaciones e invitaciones).
2. **Conectar Frontend con Backend de manera integral**:
   - Mover la autenticación de `localStorage` al endpoint de FastAPI.
   - Guardar proyectos en la base de datos MySQL en lugar de depender del estado del cliente.
3. **Mejoras en el Pipeline IA**:
   - Refinar los prompts del sistema para casos borde.
   - Permitir al usuario reintentar fases fallidas de manera granular.
4. **Limpieza técnica**:
   - Eliminar código muerto (ej. legacy `CapturaRequisitos.tsx`, stub `migration-service.ts`).
   - Reparar los imports rotos mencionados en el archivo.

---

## 6. Estructura del proyecto

```
C:\Users\Alons\OneDrive\Escritorio\proyecto herman react\
│
├── index.html                    # Punto de entrada HTML — monta <div id="root">
├── package.json                  # Dependencias y scripts (nombre @figma/my-make-file — desactualizado)
├── tsconfig.json                 # Config TypeScript strict, path alias @/ → src/
├── vite.config.ts                # Config Vite: plugin React, Tailwind v4, alias @/
├── project_context.md            # Documento de contexto del proyecto (visión, tecnologías)
├── test-compiler.ts              # Script ad-hoc para probar el compilador (raíz del proyecto)
├── tsc_output.txt                # Output de errores TypeScript (71 errores — no debería estar aquí)
│
└── src/
    │
    ├── main.tsx                  # Entry point React — ReactDOM.createRoot + <App />
    │
    ├── app/
    │   ├── App.tsx               # Definición de todas las rutas con React Router DOM
    │   └── components/
    │       ├── acciones/         # Componentes de acción por módulo
    │       │   ├── auditoria/
    │       │   │   └── RegistroAuditoria.tsx     # Tabla de logs de auditoría
    │       │   ├── casos-uso/
    │       │   │   ├── EditorCasosUso.tsx         # Orquestador lista/detalle
    │       │   │   ├── types.ts                   # Tipos del compilador (UseCase, Step, etc.)
    │       │   │   └── components/
    │       │   │       ├── UseCaseList.tsx         # Grid de tarjetas de UC
    │       │   │       ├── UseCaseDetail.tsx       # Editor completo de UC
    │       │   │       ├── StepItem.tsx            # Fila de paso individual
    │       │   │       ├── SectionList.tsx         # Lista reutilizable
    │       │   │       └── HelpTooltip.tsx         # Tooltip de ayuda
    │       │   ├── configuracion/
    │       │   │   └── PanelConfiguracion.tsx      # Panel config 5 tabs
    │       │   ├── diagramas/
    │       │   │   ├── EditorDiagramaFlujo.tsx     # ✅ Auto-genera desde useCases prop (Fase 4)
    │       │   │   └── FlowPropertyPanel.tsx       # Panel propiedades nodo
    │       │   ├── generacion/
    │       │   │   └── GeneradorCodigo.tsx         # ✅ Reescrito (Fase 5): genera 6 docs Markdown, NO código
    │       │   ├── modelado/
    │       │   │   └── ModeladorDatos.tsx          # Modelador visual BD
    │       │   └── requisitos/
    │       │       └── EditorRequisitos.tsx        # Editor CRUD de requisitos
    │       ├── CapturaRequisitos.tsx               # [LEGACY] Versión simple de requisitos
    │       ├── TourGuia.tsx                        # Modal de onboarding 5 pasos
    │       ├── dashboard/
    │       │   ├── DetalleProyecto.tsx             # ✅ Mock data limpio; cascade sync con MetadatosPage (Fase 4)
    │       │   ├── EstadosVacios.tsx               # Componentes de empty state
    │       │   ├── ModalCrearProyecto.tsx          # Modal creación de proyecto
    │       │   └── TarjetaProyecto.tsx             # Card de proyecto
    │       ├── figma/
    │       │   └── ImageWithFallback.tsx           # Imagen con fallback SVG
    │       ├── layout/
    │       │   ├── sidebar/BarraLateral.tsx        # Sidebar de navegación
    │       │   └── topbar/BarraSuperior.tsx        # Barra superior
    │       └── ui/                                 # 48 componentes shadcn/ui (Radix)
    │           ├── accordion.tsx
    │           ├── alert.tsx
    │           ├── avatar.tsx
    │           ├── badge.tsx
    │           ├── button.tsx
    │           ├── calendar.tsx
    │           ├── card.tsx
    │           ├── checkbox.tsx
    │           ├── dialog.tsx
    │           ├── dropdown-menu.tsx
    │           ├── form.tsx
    │           ├── input.tsx
    │           ├── label.tsx
    │           ├── popover.tsx
    │           ├── progress.tsx
    │           ├── select.tsx
    │           ├── separator.tsx
    │           ├── sheet.tsx
    │           ├── skeleton.tsx
    │           ├── slider.tsx
    │           ├── switch.tsx
    │           ├── table.tsx
    │           ├── tabs.tsx
    │           ├── textarea.tsx
    │           ├── toast.tsx
    │           ├── toaster.tsx
    │           ├── tooltip.tsx
    │           └── ... (más componentes Radix)
    │
    ├── components/
    │   ├── auth/
    │   │   └── AuthLayout.tsx                      # Layout para login/register
    │   ├── ConfiguracionAPIKeys.tsx                # Modal para Groq API key
    │   ├── SubidorArchivo.tsx                      # Upload Word/PDF/CSV/Excel/TXT
    │   ├── SubidorAudio.tsx                        # Upload/grabación de audio
    │   ├── dashboard/
    │   │   └── StatsCards.tsx                      # Tarjetas de estadísticas (mock)
    │   ├── landing/
    │   │   ├── Header.tsx                          # Navbar de la landing
    │   │   ├── Hero.tsx                            # Sección hero
    │   │   ├── Features.tsx                        # Grid de características
    │   │   ├── HowItWorks.tsx                      # Sección de 3 pasos
    │   │   ├── MiniDemo.tsx                        # Demo interactiva DnD
    │   │   ├── Testimonials.tsx                    # Testimonios
    │   │   └── Footer.tsx                          # Footer
    │   ├── layout/
    │   │   ├── DashboardLayout.tsx                 # Layout principal del dashboard
    │   │   ├── ProjectModuleLayout.tsx             # Layout de módulo de proyecto
    │   │   ├── Sidebar.tsx                         # Sidebar (versión alternativa)
    │   │   └── TopBar.tsx                          # TopBar (versión alternativa)
    │   ├── ui/
    │   │   ├── Button.tsx                          # Botón con variantes + framer-motion
    │   │   ├── Card.tsx                            # Card shadcn-style
    │   │   ├── GlassCard.tsx                       # Card con efecto glass
    │   │   └── Input.tsx                           # Input estilizado
    │   └── wizard/
    │       ├── WizardProvider.tsx                  # Context provider del wizard
    │       ├── WizardButton.tsx                    # Botón flotante del wizard
    │       ├── WizardOverlay.tsx                   # Overlay completo del wizard
    │       ├── WizardTooltip.tsx                   # Tooltip posicionado
    │       └── WizardSpotlight.tsx                 # Spotlight circular
    │
    ├── config/
    │   └── wizardSteps.ts                          # Configuración de 8 módulos del wizard
    │
    ├── core/                                       # Motor TypeScript puro
    │   ├── compiler/
    │   │   ├── types.ts                            # Tipos del compilador
    │   │   ├── pipeline.ts                         # Orquestador del pipeline
    │   │   ├── lexer/lexer.ts                      # Tokenizador FlowNode → Token
    │   │   ├── parser/parser.ts                    # Parser → AST
    │   │   ├── semantics/analyzer.ts               # Análisis semántico
    │   │   ├── ir/
    │   │   │   ├── builder.ts                      # AST → IR (v2, activo)
    │   │   │   ├── types.ts                        # Tipos del IR v2
    │   │   │   └── generator.ts                    # [DEAD CODE] IR v1, imports rotos
    │   │   ├── codegen/generator.ts                # IR → TypeScript
    │   │   └── optimizer/optimizer.ts              # [BYPASEADO] Optimizador con imports rotos
    │   ├── conversion/
    │   │   ├── types.ts                            # Tipos de conversión
    │   │   ├── flow-validator.ts                   # Validador de diagramas
    │   │   └── flow-to-ast.ts                      # Flujo → AST
    │   ├── database/
    │   │   ├── types.ts                            # Tipos de BD
    │   │   ├── prisma-generator.ts                 # Genera schema.prisma
    │   │   ├── model-diff.ts                       # Diff de schemas
    │   │   ├── versioning.ts                       # Historial de versiones
    │   │   ├── migration-service.ts                # [STUB] Servicio de migraciones
    │   │   └── migrations.md                       # Docs de arquitectura de migraciones
    │   ├── generation/
    │   │   ├── type-inference.ts                   # Inferencia de tipos por nombre de campo
    │   │   ├── usecase-transpiler.ts               # UseCase → Next.js handler
    │   │   └── orchestrator.ts                     # Validación UC vs modelo de datos
    │   └── traceability/
    │       └── types.ts                            # Tipos de trazabilidad (sin implementación)
    │
    ├── hooks/
    │   └── useSimulatedAuth.ts                     # Hook de autenticación simulada
    │
    ├── lib/
    │   └── utils.ts                                # Función cn() (clsx + tailwind-merge)
    │
    ├── pages/
    │   ├── ConfiguracionPage.tsx                   # Página /configuracion
    │   ├── DashboardPage.tsx                       # Página /dashboard
    │   ├── EquiposPage.tsx                         # Página /equipos
    │   ├── LandingPage.tsx                         # Página /
    │   ├── LoginPage.tsx                           # Página /login
    │   ├── RegisterPage.tsx                        # Página /register
    │   ├── TeamCard.tsx                            # Tarjeta de equipo
    │   └── metadatos/
    │       ├── MetadatosPage.tsx                   # ✅ onDataChange prop + cascade sync; encuestas:[] fix (Fases 3+4)
    │       ├── metadatosReducer.ts                 # ✅ Tipos Encuesta/Pregunta; 6 nuevas acciones; buildOutputJson exportado (Fase 2)
    │       ├── metadatos.css                       # 790 líneas de estilos propios
    │       ├── hooks/
    │       │   └── useToast.ts                     # Hook toast local (retorna {toast, guardado})
    │       ├── components/
    │       │   ├── JsonPreview.tsx                 # Preview colapsable de JSON
    │       │   ├── ListaDinamica.tsx               # Lista add/remove
    │       │   ├── SeccionMetodo.tsx               # Wrapper de sección con collapse
    │       │   └── TagInput.tsx                    # ✅ Componente compartido con prop color opcional (Fase 6)
    │       └── secciones/
     │           ├── SeccionInfoGeneral.tsx
     │           ├── SeccionMetodos.tsx
     │           ├── SeccionEntrevista.tsx           # ✅ Sesión 7: eliminada config completa; rol→input libre; botón "Guardar hallazgos"
     │           ├── SeccionEncuesta.tsx             # ✅ Sesión 7: hallazgos siempre visible; layout mejorado; botón "Guardar hallazgos"
     │           ├── SeccionHistorias.tsx            # ✅ Sesión 7: eliminados SubidorArchivo/handleImport; botón "Guardar criterios"
     │           ├── SeccionObservacion.tsx          # ✅ Sesión 7: eliminado toggle "¿grabada?"; botón "Guardar hallazgos"
     │           ├── SeccionAnalisisDocumental.tsx   # ✅ Sesión anterior: solo sección A consolidada; eliminadas B y C con SubidorArchivo
     │           └── SeccionResumen.tsx
    │
    ├── styles/
    │   ├── index.css                               # Importa todos los demás CSS
    │   ├── tailwind.css                            # Config Tailwind v4
    │   ├── theme.css                               # Tokens de diseño CSS
    │   ├── cyberpunk.css                           # Sistema de componentes cyberpunk
    │   ├── dashboard.css                           # Estilos del layout dashboard
    │   ├── wizard.css                              # Estilos del wizard/tour
    │   └── fonts.css                               # ⚠️ VACÍO — no carga fuentes
    │
    └── utils/
        ├── analizadorHerman.ts                     # Analizador de texto español (regex)
        ├── extractores.ts                          # Extracción de contenido de archivos
        └── transcriptorAudio.ts                    # Transcripción Groq Whisper API
```

---

## 7. Guía de instalación y configuración

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o pnpm/yarn equivalente)
- **Git**

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd "proyecto herman react"

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (puerto por defecto de Vite).

### Variables de entorno

**Actualmente el proyecto no usa ningún archivo `.env`**. No hay referencias a `import.meta.env` en el código fuente para configuración.

La única "variable de configuración" es la **Groq API key**, que se almacena en `localStorage` del navegador bajo la clave `herman_groq_key`. Se configura desde la UI en la sección de Configuración → API Keys.

> Si se migra a un entorno de producción real, se recomienda crear un `.env`:
> ```env
> VITE_GROQ_API_KEY=your_groq_api_key_here
> VITE_APP_NAME=Herman
> ```

### Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo (Vite HMR)
npm run build     # Build de producción (TypeScript + Vite)
npm run preview   # Preview del build de producción
npm run lint      # ESLint (si está configurado)
```

> **Nota**: `npm run build` actualmente fallará con errores TypeScript debido a los 71 errores detectados (principalmente imports rotos en `src/core/compiler/ir/generator.ts` y `src/core/compiler/optimizer/optimizer.ts`). Para hacer un build exitoso hay que resolver esos 3 errores críticos primero.

### Login de desarrollo

Como la autenticación es simulada, cualquier combinación funciona:
- **Email**: cualquier email válido (ej. `dev@herman.com`)
- **Contraseña**: mínimo 6 caracteres (ej. `123456`)

### Build de producción

```bash
npm run build
# Los archivos compilados se generan en dist/
npm run preview   # Para servir el build localmente
```

Para desplegar en producción, el contenido de `dist/` puede servirse con cualquier servidor de archivos estáticos (Nginx, Vercel, Netlify, etc.).

---

## 8. Guía de uso / flujo principal

### Flujo de usuario completo

#### 1. Landing page (`/`)
El usuario llega a la landing page que presenta la plataforma. Puede navegar a Login o Register desde el header o los CTAs del Hero.

#### 2. Autenticación (`/login`, `/register`)
- Ingresar email + contraseña (mínimo 6 chars)
- El sistema simula un delay de red y guarda `herman_auth: "true"` en `localStorage`
- Redirige automáticamente a `/dashboard`

#### 3. Dashboard (`/dashboard`)
- Vista de todos los proyectos del usuario (datos mock)
- Búsqueda y filtro por estado (activo, completado, etc.)
- Botón "Nuevo Proyecto" → `ModalCrearProyecto`
  - Rellenar nombre, descripción, tipo de app, template, stack y lenguaje
  - Confirmar → aparece el proyecto en la lista
- Click en un proyecto → abre `DetalleProyecto` (portal full-screen)

#### 4. DetalleProyecto (hub central)
Una vez dentro de un proyecto, el sidebar izquierdo muestra los 9 módulos:

```
📋 Metadatos
📝 Requisitos
🔄 Casos de Uso
🔀 Diagrama de Flujo
🗃️ Modelado de Datos
⚙️ Generación
🔍 Auditoría
⚙️ Configuración
```

#### 5. Metadatos
- Seleccionar métodos de recolección (entrevista, encuesta, historias de usuario, observación, análisis documental)
- Rellenar cada sección activada
- En "Análisis Documental": subir archivos Word/PDF/CSV/Excel/TXT — se extrae y analiza el contenido automáticamente
- En cualquier sección: subir audio → se transcribe vía Groq Whisper API (requiere API key configurada)
- "Resumen" muestra el JSON completo de metadatos exportable

#### 6. Requisitos
- Crear requisitos funcionales y no funcionales
- Filtrar por estado y prioridad
- Exportar a CSV

#### 7. Casos de Uso
- Crear casos de uso con nombre, descripción y actores
- Definir flujo principal (steps con tipo semántico)
- Añadir flujos alternativos, reglas de negocio y excepciones
- Los tipos de step (`USER_INPUT`, `SYSTEM_PROCESS`, `DB_READ`, `DB_WRITE`, `VALIDATE`, `BRANCH`, `EXTERNAL_API`) alimentarán el compilador

#### 8. Diagrama de Flujo
- Arrastrar nodos desde la paleta al canvas
- Conectar nodos haciendo click en los puntos de conexión
- Seleccionar un nodo para editar propiedades en el panel derecho
- Los nodos tienen tipo semántico que mapea a operaciones del compilador

#### 9. Modelado de Datos
- Crear tablas con columnas y tipos de dato
- Definir relaciones entre tablas
- Ver preview del schema Prisma generado
- Ver DDL SQL y copiarlo al portapapeles

#### 10. Generación de Documentación
- Revisar las 4 tarjetas de validación — muestran en verde los módulos que tienen datos
- Ver la barra de completitud (cuántos de los 4 bloques están listos)
- Hacer click en "Generar Documentación" — genera 6 archivos Markdown basados en todo lo capturado
- Previsualizar cada documento en la pestaña correspondiente
- Descargar archivos individuales o todos juntos con "Descargar todo (.md)"

#### 11. Sistema Wizard / Tour
En cualquier módulo, el botón flotante "?" activa el tour guiado:
- Resalta elementos de la UI con un spotlight
- Muestra tooltips con explicaciones paso a paso
- Progreso guardado en `localStorage` (`herman_wizard_progress`)

---

## 9. Dependencias y servicios externos

### Dependencias principales de producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` | ^18.3.1 | Framework UI |
| `react-dom` | ^18.3.1 | Renderizado DOM |
| `react-router-dom` | ^7.13.0 | Routing SPA |
| `framer-motion` | ^11.18.2 | Animaciones en landing y dashboard |
| `lucide-react` | ^0.511.0 | Iconos SVG |
| `sonner` | ^2.0.3 | Toasts/notificaciones |
| `recharts` | ^2.15.3 | Gráficas del dashboard |
| `react-dnd` | ^16.0.1 | Drag and drop (MiniDemo en landing) |
| `react-dnd-html5-backend` | ^16.0.1 | Backend HTML5 para React DnD |
| `mammoth` | ^1.9.0 | Extracción de texto de archivos .docx |
| `pdfjs-dist` | ^5.2.133 | Extracción de texto de archivos PDF |
| `papaparse` | ^5.5.2 | Parsing de archivos CSV |
| `xlsx` | ^0.18.5 | Parsing de archivos Excel (.xlsx) |
| `clsx` | ^2.1.1 | Construcción condicional de classnames |
| `tailwind-merge` | ^3.3.0 | Merge de clases Tailwind sin conflictos |
| `class-variance-authority` | ^0.7.1 | CVA para variantes de componentes |

### Radix UI (primitivos de UI)

28+ paquetes de `@radix-ui/react-*` instalados: `accordion`, `alert-dialog`, `avatar`, `checkbox`, `collapsible`, `context-menu`, `dialog`, `dropdown-menu`, `hover-card`, `label`, `menubar`, `navigation-menu`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `slider`, `slot`, `switch`, `tabs`, `toast`, `toggle`, `toggle-group`, `tooltip`.

### Material UI

`@mui/material` v7 + `@emotion/react` + `@emotion/styled` instalados. Aparentemente se instalaron pero su uso en el código fuente es mínimo/nulo.

### Dependencias de desarrollo

| Paquete | Uso |
|---------|-----|
| `vite` ^6.3.5 | Build tool y dev server |
| `@vitejs/plugin-react` | Plugin React para Vite (JSX transform) |
| `@tailwindcss/vite` | Plugin Vite-nativo de Tailwind v4 |
| `typescript` ~5.8.3 | Compilador TypeScript |
| `@types/react` | Tipos para React |
| `@types/react-dom` | Tipos para React DOM |
| `@types/papaparse` | Tipos para PapaParse |
| `@types/react-dnd` | Tipos para React DnD |
| `eslint` + plugins | Linting |

### Servicios externos

| Servicio | Uso | Autenticación |
|----------|-----|---------------|
| **Groq API** (Whisper) | Transcripción de audio a texto | API key guardada en `localStorage` bajo `herman_groq_key`. URL base: `https://api.groq.com/openai/v1/audio/transcriptions`. Modelo: `whisper-large-v3`. |

> **Importante**: Groq es el **único servicio externo real** utilizado actualmente. Todo lo demás es simulado/mock.

### Servicios referenciados pero NO integrados

| Servicio | Estado |
|----------|--------|
| GitHub API | Botón de conexión presente en `PanelConfiguracion.tsx` pero sin implementación |
| GitLab API | Mismo caso que GitHub |
| Base de datos real | No hay — toda la data es en memoria |
| Backend / API REST | No existe — la app es completamente frontend |

---

## 10. Notas adicionales

### Deuda técnica prioritaria

En orden de impacto para que el proyecto pueda hacer un build sin errores y funcionar correctamente:

1. **[CRÍTICO] Eliminar o corregir `src/core/compiler/ir/generator.ts`** — es código muerto con imports rotos que causa 2 errores de compilación TypeScript. La solución más simple es eliminarlo (fue reemplazado por `ir/builder.ts`).

2. **[CRÍTICO] Corregir `src/core/compiler/optimizer/optimizer.ts`** — cambiar `import { IRProgram } from '../types'` → `import { IRFunction } from './types'` para que compile. O eliminarlo y dejarlo como stub vacío hasta implementar.

3. ~~**[CRÍTICO] Añadir `Info` al import de `src/pages/metadatos/secciones/SeccionEntrevista.tsx`**~~ ✅ **Resuelto en Fase 1** — import corregido, ya no causa crash.

4. **[IMPORTANTE] Agregar `WIZARD_CONFIGS.gestionEquipos` y `WIZARD_CONFIGS.crearEquipo`** en `src/config/wizardSteps.ts` — causa error de runtime en `/equipos`.

5. ~~**[MEJORA] Deduplicar `TagInput`**~~ ✅ **Resuelto en Fase 6** — las 5 copias inline eliminadas; todas las secciones importan el componente compartido.

6. **[MEJORA] Actualizar el nombre en `package.json`** de `@figma/my-make-file` a `herman-platform` o similar.

### Decisiones técnicas relevantes

- **Sin backend intencional (por ahora)**: el proyecto está diseñado como prototipo funcional de alta fidelidad. Toda la generación de código ocurre en el cliente con lógica TypeScript pura en `src/core/`.

- **Dos sistemas de layout coexistentes**: `src/components/layout/` (DashboardLayout, Sidebar, TopBar) vs `src/app/components/layout/` (BarraLateral, BarraSuperior). Parece que el segundo sistema (`app/components/layout/`) es el activo y el primero es un remanente del desarrollo inicial. Verificar si `Sidebar.tsx` y `TopBar.tsx` en `src/components/layout/` todavía se usan.

- **`DetalleProyecto.tsx` como hub**: la decisión de tener todo el estado del proyecto levantado en un solo componente (`DetalleProyecto.tsx`) con portal rendering es funcional para el prototipo pero no escalaría bien. Para producción se recomendaría Context + reducers por módulo, o Zustand.

- **Compiler pipeline**: el motor de `src/core/compiler/` es una implementación seria de un compilador (Lexer → Parser → Semantic → IR → Codegen). El output son rutas API de Next.js. Sin embargo, la conexión entre el editor visual de diagramas y el compilador no está completamente cerrada — faltaría un paso de conversión `FlowDiagram → FlowNode[]` → `compile()`.

- **Tailwind v4**: el proyecto usa la versión 4 de Tailwind con el plugin nativo de Vite (`@tailwindcss/vite`). Esto significa que **no hay `tailwind.config.js`** — la configuración se hace directamente en los archivos CSS con directivas `@theme`. Es la configuración más reciente y puede no ser familiar a todos los desarrolladores.

- **`project_context.md`**: existe un documento de contexto en la raíz del proyecto que describe la visión completa de la plataforma, tecnologías previstas y roadmap. **Recomendado leerlo** como primer paso para entender la dirección del proyecto.

- **No hay tests**: el proyecto no tiene ningún framework de testing configurado (ni Vitest, ni Jest, ni Playwright). `test-compiler.ts` en la raíz es un script manual standalone.

- **Groq key en localStorage**: es una decisión de diseño deliberada para el prototipo — facilita el onboarding sin necesidad de configurar variables de entorno. En producción debe migrarse a un proxy de servidor que maneje la key de forma segura.

### Para el desarrollador nuevo

1. Lee `project_context.md` en la raíz del proyecto.
2. Corre `npm install && npm run dev`.
3. Navega a `http://localhost:5173` y haz login con cualquier email + contraseña de 6+ chars.
4. El flujo principal pasa por: Dashboard → Crear Proyecto → DetalleProyecto → 9 módulos.
5. Para explorar el motor de generación, revisa `src/core/` en este orden: `compiler/types.ts` → `compiler/pipeline.ts` → `core/generation/usecase-transpiler.ts`.
6. Para entender el sistema de UI, los componentes activos son los de `src/app/components/ui/` (shadcn/Radix) y el sistema de diseño está en `src/styles/cyberpunk.css`.
7. La única integración real que necesita configuración externa es la Groq API — se puede saltar si no se necesita transcripción de audio.

---

---

## 11. Changelog — Refactor completo (28/02/2026)

Se realizó un refactor estructurado en 6 fases que transforma el módulo de Metadatos, el flujo de datos entre módulos y el módulo de Generación.

### Fase 1 — Fix crítico: crash en SeccionEntrevista

**Problema**: `<Info />` se usaba en el JSX de `SeccionEntrevista.tsx` pero no estaba en la lista de imports de `lucide-react`. Causaba una pantalla en blanco al navegar al módulo Metadatos.

**Solución**: Añadido `Info` al import de lucide-react.

**Archivo modificado**: `src/pages/metadatos/secciones/SeccionEntrevista.tsx`

---

### Fase 2 — Nuevo modelo de Encuesta

**Problema**: `SeccionEncuesta.tsx` usaba un modelo plano `ResultadoEncuesta[]` (solo texto + fecha) que no permitía estructurar encuestas con preguntas tipadas.

**Cambios en `metadatosReducer.ts`**:
- Nuevos tipos: `TipoPregunta` (`'abierta' | 'multiple' | 'escala' | 'sino'`), `PreguntaEncuesta`, `Encuesta`
- Estado migrado: `resultadosEncuesta: ResultadoEncuesta[]` → `encuestas: Encuesta[]`
- 6 nuevas acciones reducer: `ADD_ENCUESTA`, `UPDATE_ENCUESTA`, `REMOVE_ENCUESTA`, `ADD_PREGUNTA`, `UPDATE_PREGUNTA`, `REMOVE_PREGUNTA`
- `buildOutputJson()` exportado (antes era solo local)
- `calcularProgresoSecciones()` y `calcularInferenciasGlobales()` actualizados al nuevo modelo

**`SeccionEncuesta.tsx`**: reescritura completa con:
- Componentes internos `EncuestaCard` y `PreguntaCard`
- 4 tipos de pregunta con UI específica por tipo
- TagInput para opciones de preguntas de tipo múltiple
- Badges de resumen por encuesta

**Archivos modificados**: `metadatosReducer.ts`, `SeccionEncuesta.tsx`

---

### Fase 3 — Vista consolidada en Análisis Documental

**Problema**: `SeccionAnalisisDocumental.tsx` trabajaba de forma aislada sin tener acceso a los datos de las otras secciones de levantamiento (entrevista, encuesta, historias, observación).

**Cambios**:
- `SeccionAnalisisDocumental.tsx` reescrita: acepta 4 nuevos props (`entrevistaData`, `encuestaData`, `historiasData`, `observacionData`)
- Nueva función `calcularConsolidadoGlobal()` que fusiona los datos de las 4 secciones en un resumen editable
- Panel editable de consolidado global antes de generar el análisis documental
- `MetadatosPage.tsx` actualizado para pasar las 4 secciones como props

**Archivos modificados**: `SeccionAnalisisDocumental.tsx`, `MetadatosPage.tsx`

---

### Fase 4 — Cascade sync y limpieza de mock data

**Problema**: Los módulos dentro de `DetalleProyecto.tsx` no se comunicaban automáticamente. Los metadatos capturados no llegaban al generador ni al editor de diagramas. Además, `DetalleProyecto.tsx` tenía arrays masivos de datos hardcodeados que pre-populaban todos los módulos.

**Cambios en `DetalleProyecto.tsx`**:
- Eliminados todos los datos mock hardcodeados de `requirements`, `useCases`, `tables`, `relationships`, `catalogs` (todos inician como arrays vacíos)
- Añadido estado `metadatosData` que recibe la emisión de `MetadatosPage`
- `GeneradorCodigo` recibe `metadatosData` como prop
- `EditorDiagramaFlujo` recibe `useCases` como prop
- Botón del header renombrado a "Generar Docs"

**Cambios en `MetadatosPage.tsx`**:
- Añadido prop `onDataChange?: (data: ReturnType<typeof buildOutputJson>) => void`
- `useEffect` que llama a `onDataChange(buildOutputJson(state))` en cada cambio de estado
- Corregido: `encuestas: []` faltaba en el estado inicial del reducer

**Cambios en `EditorDiagramaFlujo.tsx`**:
- Añadida interfaz `Props` con `useCases?: UseCase[]`
- Función `stepTypeToNodeType()` que mapea `StepType` → tipo de nodo del canvas
- Función `buildNodesFromUseCase()` que genera nodos y conexiones desde un `UseCase`
- `useEffect` que auto-genera el diagrama desde `useCases[0].steps` cuando el canvas tiene solo los nodos por defecto (inicio/fin)

**Archivos modificados**: `DetalleProyecto.tsx`, `MetadatosPage.tsx`, `EditorDiagramaFlujo.tsx`

---

### Fase 5 — Generador de documentación (reemplaza generador de código)

**Problema**: `GeneradorCodigo.tsx` (868 líneas) generaba código TypeScript/Next.js simulado con terminal animada y árbol de archivos. Esto no era el objetivo del proyecto — el objetivo es generar **documentación técnica** que sirva como guía de implementación.

**`GeneradorCodigo.tsx`** reescrito (~400 líneas):

Eliminado:
- Configuración de stack (presets T3 / Vite+Express)
- Terminal animada con logs
- File tree preview
- Progress sidebar de pipeline
- `generateZodSchema()` y `generateUseCaseController()` inline

Añadido:
- 4 tarjetas de validación tipo semáforo con popovers de ayuda
- Barra de completitud (0–4)
- Panel "¿Qué genera?" expandible
- 6 funciones builder: `buildContextoProyecto()`, `buildEspecificacionesFuncionales()`, `buildCasosDeUso()`, `buildArquitecturaDatos()`, `buildFlujosDeProceso()`, `buildGuiaImplementacion()`
- UI de tabs para previsualizar cada documento
- Descarga individual y masiva de archivos `.md`

**Documentos generados**:
| Archivo | Contenido |
|---------|-----------|
| `01-contexto-proyecto.md` | Info general, industria, plataforma, métodos de levantamiento |
| `02-especificaciones-funcionales.md` | Requisitos funcionales y no funcionales |
| `03-casos-de-uso.md` | Casos de uso con actores, flujos, precondiciones, reglas de negocio |
| `04-arquitectura-datos.md` | Tablas, columnas, tipos, relaciones, schema Prisma |
| `05-flujos-de-proceso.md` | Flujos de proceso por caso de uso |
| `06-guia-de-implementacion.md` | Stack, estructura de archivos sugerida, pasos de implementación |

**Archivo modificado**: `src/app/components/acciones/generacion/GeneradorCodigo.tsx`

---

### Fase 6 — Deduplicación TagInput + fixes menores

**Problema 1 — TagInput duplicado**: El componente `TagInput.tsx` existía en `components/TagInput.tsx` pero estaba copiado inline en 5 secciones distintas.

**Solución**: Eliminadas todas las copias inline. Todas las secciones ahora importan de `../components/TagInput`. El componente fue actualizado con prop `color?: string` opcional para accent theming.

**Archivos modificados**: `TagInput.tsx`, `SeccionEntrevista.tsx`, `SeccionEncuesta.tsx`, `SeccionHistorias.tsx`, `SeccionObservacion.tsx`, `SeccionAnalisisDocumental.tsx`

**Problema 2 — useToast API incorrecta en SeccionEncuesta**: Se usaba `showToast()` y `<ToastContainer>` que no existen en el hook `useToast` local. El hook retorna `{toast, guardado}`.

**Solución**: Reemplazado por la API correcta (`toast`, `guardado`).

**Problema 3 — Bug de predicción de IDs**: En 4 archivos se usaba `array.length + 1` para generar IDs nuevos, lo que produce IDs duplicados cuando se eliminan elementos intermedios.

**Solución**: Reemplazado por `Date.now().toString().slice(-6)` en todos los archivos afectados.

**Archivos con ID fix**: `SeccionAnalisisDocumental.tsx`, `SeccionEntrevista.tsx`, `SeccionObservacion.tsx`, `SeccionHistorias.tsx`

---

*Documento actualizado el 28/02/2026 tras el refactor de 6 fases.*

---

### Sesión 7 — Limpieza UX del módulo Metadatos (28/02/2026)

Objetivo: limpiar las 4 secciones de levantamiento (entrevista, encuesta, historias, observación) eliminando funcionalidades de subida de archivos/audio y simplificando la UX. Añadir botones "Guardar" con feedback visual en cada sección.

#### SeccionEntrevista.tsx

**Eliminado**:
- Sección A completa de configuración: tipo de entrevista, TagInput de roles/participantes, número de entrevistados, duración estimada, temas clave, toggle "¿Se grabará?"
- `<select>` para el campo `rol` dentro de cada card de entrevista

**Añadido**:
- Las entrevistas realizadas son ahora el contenido top-level del componente (sin sección A)
- Campo `rol` cambiado a `<input>` de texto libre (sin dependencia de lista de roles)
- Contenedor destacado con gradiente para hallazgos generales + botón "Guardar hallazgos" con toast

#### SeccionEncuesta.tsx

**Mejorado**:
- Sección de hallazgos **siempre visible** — eliminada condición `encuestas.length > 0`
- Layout cambiado de 2 columnas a vertical (una columna)
- `<textarea>` con 4 rows (antes 2)
- Contador de caracteres en tiempo real
- Indicador "✓ Listo para análisis" cuando hay contenido
- Botón "Guardar hallazgos" con toast independiente (`useToast('Hallazgos guardados')`)
- Añadido icono `Save` a imports de lucide

#### SeccionHistorias.tsx

**Eliminado**:
- Import de `SubidorArchivo` y `ResultadoExtraccion`
- Función `handleImport()` completa (50+ líneas: lógica CSV/TXT, parsing, creación de historias)
- Estado `importOpen`
- Import `Upload` de lucide
- Botón "Importar historias" y el panel `<SubidorArchivo>` asociado

**Añadido**:
- Contenedor destacado con gradiente para criterios generales de aceptación
- Botón "Guardar criterios" con toast independiente (`useToast('Criterios guardados')`)

#### SeccionObservacion.tsx

**Eliminado**:
- Toggle "¿Se grabará la sesión? Sí/No" completo y su grid de 2 columnas

**Corregido**:
- `useToast` cambiado a `useToast('Hallazgos guardados')` con variable `guardado`
- Eliminado el toast residual del footer en el botón "Agregar observación"
- Duración estimada queda como campo individual con `maxWidth: 160`

**Añadido**:
- Contenedor destacado con gradiente para hallazgos generales
- Botón "Guardar hallazgos" con toast en contenedor destacado

**Archivos modificados**: `SeccionEntrevista.tsx`, `SeccionEncuesta.tsx`, `SeccionHistorias.tsx`, `SeccionObservacion.tsx`

---

*Documento actualizado el 28/02/2026 tras la Sesión 7.*

---

### Sesión 8 — Refinamiento Backend y Carga Masiva de Metadatos E-Commerce (10/03/2026)

Objetivo: Resolver el estado vacío en el módulo de Metadatos dentro del frontend a pesar de existir datos en la Base de Datos, y proveer volumen suficiente de información para el pipeline de Inteligencia Artificial (Qwen 3.5).

**Bugs Resueltos**:
- **Conflicto de Nombres de Proyectos (IDs Duplicados)**: Se descubrió que la base de datos contenía **dos** proyectos distintos llamados "E-Commerce Platform" (IDs 2 y 3). El inyector original truncaba la ejecución al primer hallazgo (`LIMIT 1`), llenando el Proyecto 2, mientras la UI estaba consultando el Proyecto 3.
- **Limpieza de variables fantasma**: Al estar el Proyecto 3 vacío, la UI generaba renderizados en blanco y guardados inútiles con estructuras JSON incorrectas. Se corrigió haciendo que el script inyector (`seed_metadata.py`) recorra e inyecte la carga a **todos** los proyectos que hagan match con nombre "E-commerce".

**Añadido (Carga de Datos Masiva)**:
- Se implementó un payload "Ultra Masivo" en `seed_metadata.py` que inyecta información sumamente profunda y realista:
    - **Entrevistas (Hasta 8 preguntas por rol)**: CTO (Kubernetes, PCI-DSS, Microservicios API-First), COO (Demandas logísticas, Webhooks de FedEx), CMO (Marketing headless CMS, Meta CAPI, retargeting IA) y Customer Success (RMA y reembolsos).
    - **10 Historias de Usuario Detalladas**: Pagos para usuarios internacionales usando conversiones IP automáticas, Guest Checkout rápido, roles multi-usuario B2B, y compras impulsadas por reconocimiento de imágenes.
    - **Encuestas a escala (B2B/B2C)**: Múltiples analíticas simulando abandono de clientes y problemas de rendimiento.
    - **Criterios Generales de Aceptación**: Directrices súper estrictas (FCP < 1.5s, 99.99% Uptime, Arquitectura MACH, CQRS en base de datos).

**Siguientes Pasos (Próxima Sesión)**:
- **Proceder a Generación con IA**: Comenzar la interacción con Qwen (Pipeline WebSockets) consumiendo todos estos metadatos.
- El objetivo será usar la IA para la autogeneración de los Requisitos, Casos de Uso y la Especificación Técnica y Arquitectónica del sistema basada minuciosamente en el volcado E-commerce.
