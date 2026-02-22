# Proyecto Herman - Documentación de Contexto y Estado del Proyecto

## 1. Visión del Proyecto
**Proyecto Herman** es una plataforma de ingeniería de software asistida (Meta-CASE / Low-Code/ No-Code) diseñada para **automatizar el ciclo de vida de desarrollo de software**. A diferencia de los editores de código tradicionales o herramientas no-code simples, este sistema implementa una **arquitectura basada en compiladores**.

**Objetivo Central**: Permitir al usuario definir software mediante abstracciones de alto nivel (Requisitos, Flujos, Datos) y **transpilar** esas definiciones a código fuente real, moderno y mantenible (Full-Stack Next.js + TypeScript).

---

## 2. Arquitectura del Motor (`src/core`)
El "cerebro" del sistema. Separa la representación visual (UI) de la lógica de negocio y generación de código.

### 2.1. Motor de Base de Datos (`src/core/database`)
El sistema no solo "dibuja" tablas, sino que entiende la semántica SQL completa.
*   **Modelado Avanzado**:
    *   **Tipos de Datos**: Soporte real para `INT`, `VARCHAR`, `BOOLEAN`, `JSON`, `ENUM`, `UUID`.
    *   **Constraints**: Implementación de `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `CHECK`.
    *   **Relaciones**: Cardinalidad completa (1:1, 1:N, N:M) con tablas intermedias implícitas y acciones en cascada (`ON DELETE CASCADE`, `ON UPDATE SET NULL`).
*   **Generación de Prisma**:
    *   **Transpilador**: Convierte el modelo interno en archivos `schema.prisma` válidos.
    *   **Formateo**: Aplica reglas de estilo y anotaciones de Prisma automáticamente.
*   **Sistema de Migraciones**:
    *   **Detección de Cambios (Diffing)**: Algoritmo que compara la versión anterior del modelo con la actual para detectar tablas creadas, columnas eliminadas o tipos modificados.
    *   **Generación SQL**: Produce scripts SQL incrementales (Up/Down) compatibles con motores de producción.
    *   **Versionado**: Nombres de archivo estandarizados con timestamp para orden de ejecución determinista.
*   **Patrones de Arquitectura**:
    *   **Auditoría Automática**: Inyección opcional de `created_at`, `updated_at`, `deleted_at` (Soft Deletes).
    *   **Multi-tenancy**: Soporte para `tenant_id` en todas las tablas seleccionadas.

### 2.2. Motor de Generación de Código (`src/core/generation`)
Encargado de transformar la lógica de negocio abstracta en código ejecutable.
*   **Transpilador de Casos de Uso**:
    *   **Entrada**: Pasos lógicos (`USER_INPUT`, `DB_OPERATION`, `VALIDATION`).
    *   **Salida**: Controladores API REST (Next.js API Routes / Server Actions).
*   **Sistema de Inferencia de Tipos**:
    *   **Heurística**: Deduce tipos TypeScript y validaciones Zod basándose en nombres de variables (ej. "email" -> `z.string().email()`, "edad" -> `z.number().min(0)`).
*   **Manejo de Transacciones**:
    *   **Atomicidad**: Agrupa operaciones de base de datos consecutivas en un único bloque `prisma.$transaction` para garantizar integridad de datos.
*   **Orquestador de Coherencia**:
    *   **Validación Semántica**: Verifica que las operaciones del caso de uso (ej. "Crear Usuario") coincidan con el esquema de base de datos actual.

### 2.3. Motor de Conversión Visual (`src/core/conversion`)
El puente entre los diagramas y el código.
*   **Flow-to-AST (Traverser)**:
    *   **Algoritmo**: Recorrido en profundidad (DFS) del grafo visual.
    *   **Conversión**: Transforma nodos (`ReactFlow Node`) y aristas (`Edge`) en un Árbol de Sintaxis Abstracta (AST) lineal con ramas para flujos alternativos.
*   **Validación de Flujos**:
    *   **Reglas**: Detecta ciclos infinitos, nodos inalcanzables, decisiones sin salidas lógicas (Sí/No) y falta de puntos de inicio/fin.
*   **Semántica Configurable (`FlowPropertyPanel`)**:
    *   **Vinculación**: UI para asociar nodos visuales con entidades del modelo de datos y acciones específicas (Verbos).

---

## 3. Estado Actual de los Módulos UI

### 3.1. Dashboard y Gestión (`Dashboard`)
*   **Estado**: ✅ Completado.
*   **Funcionalidades**:
    *   Creación y listado de proyectos.
    *   Métricas de progreso (ficticias por ahora).
    *   Navegación principal entre módulos.

### 3.2. Editor de Casos de Uso (`EditorCasosUso`)
*   **Estado**: ✅ Integrado con Core.
*   **Funcionalidades**:
    *   Edición de título, descripción y actores.
    *   Lista de pasos reordenable.
    *   Integración con el motor de inferencia de tipos.

### 3.3. Editor de Diagramas de Flujo (`EditorDiagramaFlujo`)
*   **Estado**: ✅ Avanzado.
*   **Funcionalidades**:
    *   **Lienzo Infinito**: Basado en React Flow, con zoom, mini-mapa y controles de navegación.
    *   **Paleta de Componentes**: Drag & Drop de nodos (Inicio, Acción, Decisión, Fin).
    *   **Panel de Propiedades Inteligente**: Configuración contextual según el tipo de nodo seleccionado.
    *   **Validación en Tiempo Real**: Feedback visual sobre errores en el flujo.

### 3.4. Modelador de Datos (`ModeladorDatos`)
*   **Estado**: ✅ Avanzado.
*   **Funcionalidades**:
    *   Diseño visual de tablas (Drag & Drop).
    *   Editor de columnas con soporte de tipos avanzados.
    *   Dibujo de relaciones conectando puntos de anclaje (handles).
    *   Generación de SQL/Prisma en tiempo real.

---

## 4. Tecnologías y Stack (`Tech Stack`)
La plataforma "Herman" está construida sobre tecnologías modernas y robustas:
*   **Frontend Core**: React 18, Vite.
*   **Lenguaje**: TypeScript 5 (Tipado estricto en todo el proyecto).
*   **Estilos**: Tailwind CSS (Utilidades), Lucide React (Iconos).
*   **Visualización**:
    *   **Diagramas**: React Flow (Nodos y conexiones).
    *   **Gráficos**: Recharts (Dashboard).
*   **Lógica de Negocio (Core)**:
    *   **Compilador**: Lógica propia en TypeScript puro (sin dependencias externas pesadas).
    *   **Validación**: Zod.

---

## 5. Próximos Pasos (`Roadmap`)
1.  **Persistencia Real**: Conectar con una API de sistema de archivos (Node.js/Electron) para escribir los resultados en disco.
2.  **Previsualización en Vivo**: Ejecutar el código generado en un entorno sandbox local.
3.  **Expansión de Bloques**: Añadir soporte para llamadas API externas y envío de correos.
