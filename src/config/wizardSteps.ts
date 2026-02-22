import { WizardConfig } from '../components/wizard/WizardProvider';

export const WIZARD_CONFIGS: Record<string, WizardConfig> = {

    // =====================================
    // MÓDULO: REQUISITOS
    // =====================================
    requisitos: {
        module: 'requisitos',
        autoStart: false,
        steps: [
            // PASO 1: Introducción general
            {
                id: 'req-intro',
                title: '📋 Bienvenido al Editor de Requisitos',
                description: 'Los requisitos definen QUÉ debe hacer tu sistema. Aquí gestionas funcionalidades (lo que hace) y restricciones (rendimiento, seguridad).',
                targetSelector: '.editor-requisitos, [class*="requisitos-header"], h1',
                position: 'bottom',
                spotlightPadding: 12
            },

            // PASO 2: Buscador
            {
                id: 'req-search',
                title: '🔍 Buscar Requisitos',
                description: 'Filtra la lista escribiendo palabras clave del título o descripción. Útil cuando tienes 20+ requisitos.',
                targetSelector: 'input[placeholder*="Buscar"], input[placeholder*="requisito"]',
                position: 'bottom',
                example: 'Prueba: "registro" o "validación"'
            },

            // PASO 3: Filtros
            {
                id: 'req-filters',
                title: '🎯 Filtros Inteligentes',
                description: 'Combina filtros para encontrar rápido: Tipo (Funcional/No funcional), Prioridad (Alta/Media/Baja) y Estado (Pendiente/Aprobado).',
                targetSelector: 'select:first-of-type, [class*="filter"]',
                position: 'bottom'
            },

            // PASO 4: Lista de requisitos
            {
                id: 'req-list',
                title: '📝 Lista de Requisitos',
                description: 'Cada tarjeta muestra: ID único, Título, Descripción corta y Tags. Haz clic en una para ver el detalle completo en el panel derecho.',
                targetSelector: '.requisito-card:first-child, [class*="requisito"]:first-of-type',
                position: 'right',
                spotlightPadding: 8
            },

            // PASO 5: Tags de tipo
            {
                id: 'req-tags-tipo',
                title: '🏷️ Tags de Tipo',
                description: 'Azul = Funcional (lo que el sistema HACE). Naranja = No funcional (cómo lo hace: rendimiento, seguridad, UX).',
                targetSelector: '.badge:contains("funcional"), [class*="badge"]',
                position: 'top'
            },

            // PASO 6: Tags de prioridad
            {
                id: 'req-tags-prioridad',
                title: '🚨 Prioridad del Requisito',
                description: 'Rojo = ALTA (crítico para MVP). Amarillo = MEDIA (importante). Verde = BAJA (nice to have).',
                targetSelector: '.badge:contains("alta"), [class*="prioridad"]',
                position: 'top'
            },

            // PASO 7: Panel de detalle
            {
                id: 'req-detail',
                title: '👁️ Panel de Detalle',
                description: 'Aquí ves la descripción completa, criterios de aceptación (qué debe cumplir para estar "terminado") y estado de aprobación.',
                targetSelector: '[class*="detalle"], [class*="detail"], .detail-panel',
                position: 'left'
            },

            // PASO 8: Criterios de aceptación
            {
                id: 'req-criterios',
                title: '✅ Criterios de Aceptación',
                description: 'Lista específica de condiciones que el requisito debe cumplir. Ejemplo: "Validar campos obligatorios", "Email único en el sistema".',
                targetSelector: '[class*="criterios"], [class*="acceptance"]',
                position: 'left',
                example: '✓ Validar formato de email\n✓ Mostrar mensaje de error claro\n✓ Limpiar form después de envío'
            },

            // PASO 9: Botón Nuevo Requisito
            {
                id: 'req-btn-nuevo',
                title: '➕ Crear Nuevo Requisito',
                description: 'Abre un formulario para agregar un requisito desde cero. Debes llenar: Título, Descripción, Tipo, Prioridad y al menos 1 criterio de aceptación.',
                targetSelector: 'button[class*="nuevo"], button:contains("Nuevo")',
                position: 'left'
            },

            // PASO 10: Botón Editar
            {
                id: 'req-btn-editar',
                title: '✏️ Editar Requisito',
                description: 'Modifica cualquier campo del requisito seleccionado. Los cambios se guardan automáticamente (o con botón "Guardar" si hay uno).',
                targetSelector: 'button[class*="editar"], button:contains("Editar")',
                position: 'left'
            },

            // PASO 11: Exportar CSV
            {
                id: 'req-export',
                title: '📤 Exportar a CSV',
                description: 'Descarga todos los requisitos en formato CSV para compartir con stakeholders, documentación o importar a otras herramientas.',
                targetSelector: 'button[class*="export"], button:contains("Exportar")',
                position: 'left'
            }
        ]
    },

    // =====================================
    // MÓDULO: CASOS DE USO
    // =====================================
    casosUso: {
        module: 'casosUso',
        autoStart: false,
        steps: [
            {
                id: 'cu-intro',
                title: '🎭 Editor de Casos de Uso',
                description: 'Los casos de uso describen CÓMO los usuarios interactúan con el sistema. Cada caso de uso se transpila a un controlador API.',
                targetSelector: 'h1, [class*="casos-uso-header"]',
                position: 'bottom'
            },
            {
                id: 'cu-list',
                title: '📚 Lista de Casos de Uso',
                description: 'Sidebar con todos tus casos. Usa nombres con verbos infinitivos: "Registrar Usuario", "Actualizar Perfil", "Consultar Historial".',
                targetSelector: '[class*="sidebar"], aside',
                position: 'right',
                example: 'Buenos nombres:\n• Registrar Alumno\n• Validar Credenciales\n• Generar Reporte\n\nMalos nombres:\n✗ Usuario\n✗ Login\n✗ Reportes'
            },
            {
                id: 'cu-name',
                title: '📝 Nombre del Caso de Uso',
                description: 'El título debe ser claro y empezar con verbo de acción. Este nombre se usará para generar la ruta API (ej: /api/registrar-usuario).',
                targetSelector: 'input[value*=""], h2[contenteditable], [class*="name"]',
                position: 'bottom'
            },
            {
                id: 'cu-description',
                title: '📄 Descripción',
                description: 'Explica brevemente QUÉ hace el caso de uso y CUÁNDO se ejecuta. Ejemplo: "Permite al usuario crear una cuenta nueva validando email único".',
                targetSelector: 'textarea, [class*="description"]',
                position: 'right'
            },
            {
                id: 'cu-actors',
                title: '👥 Actores del Sistema',
                description: 'Define QUIÉN puede ejecutar este caso. Cada actor genera permisos diferentes en el código generado.',
                targetSelector: '[class*="actor"], [class*="badge"]',
                position: 'right',
                example: 'Actores comunes:\n• Usuario Final (público)\n• Administrador (permisos totales)\n• Sistema (cron jobs, webhooks)\n• API Externa (integraciones)'
            },
            {
                id: 'cu-steps',
                title: '📋 Pasos del Flujo',
                description: 'Lista ordenada de operaciones. Herman las convertirá en funciones TypeScript. Sé específico en cada paso.',
                targetSelector: '[class*="steps"], [class*="pasos"], ol',
                position: 'left',
                example: 'Ejemplo - Registrar Usuario:\n1. Validar formato de email\n2. Verificar email NO existe en BD\n3. Hash de contraseña con bcrypt\n4. Crear registro en tabla Usuarios\n5. Enviar email de confirmación\n6. Retornar token JWT'
            },
            {
                id: 'cu-tipo-paso',
                title: '🔧 Tipo de Operación',
                description: 'Cada paso tiene un tipo que define qué código se genera: DB_CREATE (INSERT), DB_READ (SELECT), VALIDATION (if/else), API_CALL (fetch), etc.',
                targetSelector: 'select[class*="tipo"], [class*="operation"]',
                position: 'left'
            },
            {
                id: 'cu-entities',
                title: '🗄️ Entidades Vinculadas',
                description: 'Selecciona qué tablas de tu modelo de datos usa este caso. Herman configurará automáticamente las queries Prisma.',
                targetSelector: '[class*="entity"], [class*="entidad"]',
                position: 'left'
            },
            {
                id: 'cu-preview',
                title: '👁️ Vista Previa del Código',
                description: 'Panel derecho muestra el controlador TypeScript generado en tiempo real. Incluye validaciones, try-catch y respuestas HTTP.',
                targetSelector: '[class*="preview"], [class*="code"]',
                position: 'left'
            }
        ]
    },

    // =====================================
    // MÓDULO: FLUJOS/DIAGRAMAS
    // =====================================
    diagramaFlujo: {
        module: 'diagramaFlujo',
        autoStart: false,
        steps: [
            {
                id: 'flow-intro',
                title: '🔄 Editor de Diagramas de Flujo',
                description: 'Diseña la lógica visual de tu aplicación. Cada flujo se transpila automáticamente a código ejecutable.',
                targetSelector: '.react-flow, [class*="canvas"], [class*="flow-container"]',
                position: 'bottom'
            },
            {
                id: 'flow-palette',
                title: '🧩 Paleta de Componentes',
                description: 'Arrastra estos nodos al lienzo para construir tu flujo. Cada tipo tiene un propósito específico.',
                targetSelector: '[class*="palette"], aside',
                position: 'right'
            },
            {
                id: 'flow-node-inicio',
                title: '🟢 Nodo de Inicio',
                description: 'Todo flujo DEBE empezar aquí. Define los inputs que recibe (ej: email, password). Solo puede haber 1 nodo de inicio por flujo.',
                targetSelector: '[data-type="start"], [class*="node-start"]',
                position: 'right',
                example: 'Inputs típicos:\n• email: string\n• password: string\n• token: string\n• userId: number'
            },
            {
                id: 'flow-node-action',
                title: '⚡ Nodo de Acción',
                description: 'Ejecuta operaciones: crear en BD, llamar API, enviar email, transformar datos. Configura la operación en el panel de propiedades.',
                targetSelector: '[data-type="action"], [class*="node-action"]',
                position: 'right'
            },
            {
                id: 'flow-node-decision',
                title: '❓ Nodo de Decisión',
                description: 'Crea bifurcaciones (if/else). DEBE tener 2 salidas: una para "Sí/True" y otra para "No/False". Útil para validaciones.',
                targetSelector: '[data-type="decision"], [class*="node-decision"]',
                position: 'right',
                example: 'Decisiones comunes:\n• ¿Email válido?\n• ¿Usuario existe?\n• ¿Es admin?\n• ¿Saldo suficiente?'
            },
            {
                id: 'flow-node-end',
                title: '🔴 Nodo de Fin',
                description: 'Todo flujo DEBE terminar aquí. Define el output que retorna (ej: usuario creado, error, status). Puede haber múltiples nodos de fin (éxito, error).',
                targetSelector: '[data-type="end"], [class*="node-end"]',
                position: 'right'
            },
            {
                id: 'flow-connect',
                title: '🔗 Conectar Nodos',
                description: 'Arrastra desde el punto de salida (●) de un nodo al punto de entrada de otro. La flecha define el orden de ejecución.',
                targetSelector: '.react-flow__handle, [class*="handle"]',
                position: 'top'
            },
            {
                id: 'flow-properties',
                title: '⚙️ Panel de Propiedades',
                description: 'Haz clic en cualquier nodo para configurarlo: tipo de operación, entidad de BD, condiciones, manejo de errores.',
                targetSelector: '[class*="properties"], [class*="panel-right"]',
                position: 'left'
            },
            {
                id: 'flow-validate',
                title: '✅ Validación Automática',
                description: 'Herman detecta errores en tiempo real: ciclos infinitos, nodos desconectados, decisiones sin ambas salidas, flujos sin inicio/fin.',
                targetSelector: '[class*="validate"], button[class*="check"]',
                position: 'top'
            },
            {
                id: 'flow-minimap',
                title: '🗺️ Mini Mapa',
                description: 'Vista aérea del flujo completo. Útil en diagramas grandes (20+ nodos). Haz clic para navegar rápidamente.',
                targetSelector: '.react-flow__minimap, [class*="minimap"]',
                position: 'left'
            }
        ]
    },

    // =====================================
    // MÓDULO: MODELADO DE DATOS
    // =====================================
    modelado: {
        module: 'modelado',
        autoStart: false,
        steps: [
            {
                id: 'mod-intro',
                title: '🗄️ Modelador de Datos Visual',
                description: 'Diseña tu base de datos arrastrando y conectando tablas. Herman genera código Prisma production-ready en tiempo real.',
                targetSelector: '.react-flow, [class*="canvas"]',
                position: 'bottom'
            },
            {
                id: 'mod-palette',
                title: '📚 Paleta de Tablas',
                description: 'Sidebar con plantillas comunes (Usuario, Producto, Orden) y opción de crear tablas personalizadas.',
                targetSelector: '[class*="palette"], aside',
                position: 'right'
            },
            {
                id: 'mod-new-table',
                title: '➕ Nueva Tabla',
                description: 'Crea una tabla desde cero. IMPORTANTE: Usa nombres en SINGULAR (Usuario, no Usuarios). Prisma pluraliza automáticamente.',
                targetSelector: 'button[class*="nueva"], button:contains("Nueva")',
                position: 'right',
                example: '✓ Usuario (genera tabla users)\n✓ Producto (genera tabla products)\n✗ Usuarios\n✗ Productos'
            },
            {
                id: 'mod-table-node',
                title: '📦 Nodo de Tabla',
                description: 'Cada tabla muestra: Nombre, Campos y Tipos de dato. Haz clic en una para editarla en el panel derecho.',
                targetSelector: '.table-node, [data-type="table"]',
                position: 'top'
            },
            {
                id: 'mod-add-field',
                title: '➕ Agregar Campo',
                description: 'Añade columnas a la tabla. Cada campo necesita: Nombre (camelCase), Tipo de dato y Constraints opcionales.',
                targetSelector: 'button[class*="add-field"], button:contains("Campo")',
                position: 'right'
            },
            {
                id: 'mod-field-name',
                title: '🔤 Nombre del Campo',
                description: 'Usa camelCase (sin espacios): "firstName", "emailAddress", "createdAt". Evita abreviaturas confusas.',
                targetSelector: 'input[placeholder*="nombre"], input[placeholder*="Name"]',
                position: 'right',
                example: '✓ firstName\n✓ emailAddress\n✓ phoneNumber\n✗ name_first\n✗ email_addr\n✗ phone'
            },
            {
                id: 'mod-field-type',
                title: '🎯 Tipo de Dato',
                description: 'Selecciona el tipo SQL correcto. Afecta validaciones y tamaño de almacenamiento.',
                targetSelector: 'select[class*="type"], select:contains("VARCHAR")',
                position: 'right',
                example: 'Tipos comunes:\n• VARCHAR(255) → Textos cortos\n• TEXT → Textos largos\n• INT → Números enteros\n• DECIMAL → Dinero/precios\n• BOOLEAN → True/False\n• TIMESTAMP → Fechas y horas\n• JSON → Datos estructurados'
            },
            {
                id: 'mod-constraints',
                title: '🔒 Constraints',
                description: 'Reglas de validación a nivel de base de datos. Se aplican ANTES de que el backend valide.',
                targetSelector: '[class*="constraint"], [class*="check"]',
                position: 'right',
                example: 'Constraints importantes:\n• NOT NULL → Campo obligatorio\n• UNIQUE → Sin duplicados\n• PRIMARY KEY → Identificador único\n• DEFAULT → Valor por defecto\n• CHECK → Validación custom'
            },
            {
                id: 'mod-relations',
                title: '🔗 Crear Relaciones',
                description: 'Arrastra desde el círculo de una tabla a otra. Herman infiere automáticamente el tipo: 1:1, 1:N o N:M (muchos a muchos).',
                targetSelector: '.react-flow__handle, [class*="handle"]',
                position: 'top'
            },
            {
                id: 'mod-relation-type',
                title: '🔀 Tipos de Relación',
                description: '1:1 (usuario-perfil), 1:N (autor-posts), N:M (estudiantes-cursos, crea tabla intermedia automática).',
                targetSelector: '.react-flow__edge, [class*="edge"]',
                position: 'top',
                example: '1:1 - Un usuario tiene UN perfil\n1:N - Un autor tiene MUCHOS posts\nN:M - UN estudiante tiene MUCHOS cursos, UN curso tiene MUCHOS estudiantes'
            },
            {
                id: 'mod-schema-preview',
                title: '👁️ Vista Previa del Schema',
                description: 'Panel derecho muestra el código Prisma generado en tiempo real. ¡Código listo para copiar y usar en producción!',
                targetSelector: '[class*="schema"], [class*="preview"]',
                position: 'left'
            },
            {
                id: 'mod-copy',
                title: '📋 Copiar Schema',
                description: 'Copia el código Prisma al portapapeles para pegarlo en tu proyecto Next.js.',
                targetSelector: 'button[class*="copy"], button:contains("Copiar")',
                position: 'left'
            }
        ]
    },

    // =====================================
    // MÓDULO: GENERACIÓN
    // =====================================
    generacion: {
        module: 'generacion',
        autoStart: false,
        steps: [
            {
                id: 'gen-intro',
                title: '⚡ Generador de Código',
                description: 'Aquí se compila TODO tu diseño visual en código ejecutable. Proceso toma 10-30 segundos dependiendo de la complejidad.',
                targetSelector: 'h1, [class*="generacion-header"]',
                position: 'bottom'
            },
            {
                id: 'gen-options',
                title: '🎯 Opciones de Generación',
                description: 'Elige qué generar: Solo Backend (API + DB), Full-Stack (API + React), o Completo (con Tests y Docker).',
                targetSelector: '[class*="option-card"], [class*="opciones"]',
                position: 'bottom'
            },
            {
                id: 'gen-backend',
                title: '🖥️ Solo Backend',
                description: 'Genera: API Routes (Next.js), Prisma Schema, Validaciones (Zod), Migraciones SQL. Ideal si ya tienes frontend.',
                targetSelector: '[data-option="backend"], button:contains("Backend")',
                position: 'right'
            },
            {
                id: 'gen-fullstack',
                title: '🌐 Full-Stack',
                description: 'Backend + Páginas React + Componentes UI con Tailwind. Todo integrado y listo para desarrollar.',
                targetSelector: '[data-option="fullstack"], button:contains("Full")',
                position: 'right'
            },
            {
                id: 'gen-complete',
                title: '📦 Completo',
                description: 'Full-Stack + Tests (Jest + Playwright) + Dockerfile + GitHub Actions. Listo para CI/CD y producción.',
                targetSelector: '[data-option="complete"], button:contains("Completo")',
                position: 'right'
            },
            {
                id: 'gen-tech-stack',
                title: '🔧 Tech Stack',
                description: 'Herman genera: Next.js 14 (App Router), TypeScript 5, Prisma (PostgreSQL/MySQL), TailwindCSS, Zod.',
                targetSelector: '[class*="tech-stack"], [class*="stack"]',
                position: 'left'
            },
            {
                id: 'gen-config-adicional',
                title: '⚙️ Configuración Adicional',
                description: 'Opciones extras: Tests, Dockerfile, CI/CD, ESLint, Prettier. Marca las que necesites.',
                targetSelector: '[class*="config"], [class*="checkbox"]',
                position: 'bottom'
            },
            {
                id: 'gen-start-btn',
                title: '🚀 Iniciar Generación',
                description: 'Botón grande morado. Al hacer clic, Herman procesará TODO: requisitos, casos de uso, flujos y modelo de datos.',
                targetSelector: 'button[class*="generar"], button:contains("Iniciar")',
                position: 'top'
            },
            {
                id: 'gen-progress',
                title: '⏳ Proceso de Generación',
                description: 'Verás un loading con logs en tiempo real: Generando schema, Creando APIs, Compilando componentes, etc.',
                targetSelector: '[class*="progress"], [class*="loading"]',
                position: 'bottom'
            },
            {
                id: 'gen-preview',
                title: '👁️ Vista Previa',
                description: 'Antes de exportar, revisa el código. Navega por pestañas: API Routes, Schemas, Components, Tests.',
                targetSelector: '[class*="preview"], [class*="tabs"]',
                position: 'top'
            },
            {
                id: 'gen-export',
                title: '📥 Exportar Proyecto',
                description: 'Descarga un .zip con toda la estructura: src/, package.json, .env.example, README. Listo para npm install.',
                targetSelector: 'button[class*="export"], button:contains("Exportar")',
                position: 'left'
            }
        ]
    },

    // =====================================
    // MÓDULO: AUDITORÍA
    // =====================================
    auditoria: {
        module: 'auditoria',
        autoStart: false,
        steps: [
            {
                id: 'aud-intro',
                title: '📊 Sistema de Auditoría',
                description: 'Registro completo de todos los cambios en el proyecto. Útil para trabajo en equipo, rollbacks y compliance.',
                targetSelector: 'h1, [class*="auditoria-header"]',
                position: 'bottom'
            },
            {
                id: 'aud-timeline',
                title: '📅 Timeline de Eventos',
                description: 'Lista cronológica de cambios. Cada evento muestra: quién, qué módulo, cuándo y tipo de acción (crear/editar/eliminar).',
                targetSelector: '[class*="timeline"], [class*="events"]',
                position: 'right'
            },
            {
                id: 'aud-event-card',
                title: '📌 Tarjeta de Evento',
                description: 'Iconos de color: Verde (crear), Azul (editar), Rojo (eliminar), Morado (restaurar). Haz clic para ver detalles.',
                targetSelector: '[class*="event-card"], [class*="audit-item"]',
                position: 'right'
            },
            {
                id: 'aud-filters',
                title: '🔍 Filtros de Búsqueda',
                description: 'Filtra por: Usuario (quién hizo el cambio), Módulo (Requisitos, Modelado...), Fecha, Tipo de acción.',
                targetSelector: '[class*="filter"], select',
                position: 'bottom'
            },
            {
                id: 'aud-detail',
                title: '🔎 Detalle del Evento',
                description: 'Panel derecho muestra: ID del evento, Usuario completo, IP de origen, Timestamp exacto y Diff de cambios.',
                targetSelector: '[class*="detail"], [class*="panel-right"]',
                position: 'left'
            },
            {
                id: 'aud-diff',
                title: '📝 Ver Diff Completo',
                description: 'Muestra línea por línea qué cambió. Verde (+ agregado), Rojo (- eliminado), Amarillo (~ modificado).',
                targetSelector: 'button[class*="diff"], button:contains("Diff")',
                position: 'left'
            },
            {
                id: 'aud-rollback',
                title: '⏮️ Restaurar Versión',
                description: 'Vuelve a cualquier punto anterior. ⚠️ PRECAUCIÓN: sobrescribe los cambios actuales. Crea backup antes.',
                targetSelector: 'button[class*="rollback"], button:contains("Restaurar")',
                position: 'top'
            },
            {
                id: 'aud-export',
                title: '📤 Exportar Historial',
                description: 'Descarga el log de auditoría en CSV o JSON. Útil para reportes, compliance o análisis externo.',
                targetSelector: 'button[class*="export"], button:contains("Exportar")',
                position: 'left'
            }
        ]
    },

    // =====================================
    // MÓDULO: CONFIGURACIÓN
    // =====================================
    configuracion: {
        module: 'configuracion',
        autoStart: false,
        steps: [
            {
                id: 'conf-intro',
                title: '⚙️ Configuración Personal',
                description: 'Gestiona tu perfil, seguridad, notificaciones y claves de API desde este panel centralizado.',
                targetSelector: 'h1.section-header',
                position: 'bottom'
            },
            {
                id: 'conf-tabs',
                title: '🗂️ Secciones de Configuración',
                description: 'Navega entre las diferentes categorías: Perfil, Cuenta, Apariencia, etc.',
                targetSelector: '[class*="tabs"], [class*="border-b"]',
                position: 'bottom'
            },
            {
                id: 'conf-avatar',
                title: '📸 Foto de Perfil',
                description: 'Haz clic en el icono de cámara para actualizar tu avatar. Se usa en todo el sistema y en los logs de auditoría.',
                targetSelector: '[data-wizard-target="cambiar-avatar"]',
                position: 'left'
            },
            {
                id: 'conf-form',
                title: '📝 Datos Personales',
                description: 'Mantén tu información actualizada. El nombre de usuario debe ser único.',
                targetSelector: 'form, [data-wizard-target="campo-nombre"]',
                position: 'right'
            },
            {
                id: 'conf-api',
                title: '🔑 API Keys',
                description: 'Si tienes el rol de desarrollador, aquí puedes generar tokens para acceder a la API de Herman desde servicios externos.',
                targetSelector: '[data-wizard-target="crear-api-key"]',
                position: 'bottom'
            },
            {
                id: 'conf-danger',
                title: '⚠️ Zona Peligrosa',
                description: 'Acciones críticas como eliminar cuenta o resetear datos. Requieren confirmación extra.',
                targetSelector: '[data-wizard-target="zona-peligrosa"]',
                position: 'top'
            }
        ]
    },

    // =====================================
    // MÓDULO: DASHBOARD (PROYECTOS)
    // =====================================
    dashboard: {
        module: 'dashboard',
        autoStart: false,
        steps: [
            {
                id: 'dash-intro',
                title: '🚀 Tu Dashboard',
                description: 'Vista general de todos tus proyectos. Desde aquí puedes crear, abrir, editar o eliminar aplicaciones.',
                targetSelector: '.dashboard-header h2',
                position: 'bottom'
            },
            {
                id: 'dash-stats',
                title: '📊 Métricas Rápidas',
                description: 'Resumen de actividad: total de proyectos, uso de recursos y estado de despliegues recientes.',
                targetSelector: '.stats-cards',
                position: 'bottom'
            },
            {
                id: 'dash-search',
                title: '🔍 Buscador y Filtros',
                description: 'Encuentra proyectos por nombre. Alterna entre vista de cuadrícula o lista según tu preferencia.',
                targetSelector: 'input[placeholder*="Buscar"], button[class*="grid"], button[class*="list"]',
                position: 'bottom'
            },
            {
                id: 'dash-create',
                title: '✨ Nuevo Proyecto',
                description: 'Haz clic aquí para iniciar el asistente de creación de una nueva aplicación.',
                targetSelector: 'button:has(svg.plus), button:contains("Crear")', // Generic selector attempt, better specific class
                position: 'left'
            },
            {
                id: 'dash-card',
                title: '📁 Tarjeta de Proyecto',
                description: 'Cada tarjeta muestra el progreso y estado. Haz clic para entrar al "Nivel 2" (Vista Interna del Proyecto).',
                targetSelector: '.project-grid > div:first-child',
                position: 'right'
            }
        ]
    },

    // =====================================
    // MÓDULO: CREAR PROYECTO (MODAL)
    // =====================================
    crearProyecto: {
        module: 'crearProyecto',
        autoStart: true,
        steps: [
            {
                id: 'new-proj-name',
                title: '🏷️ Nombre del Proyecto',
                description: 'Elige un nombre único y descriptivo para tu nueva aplicación.',
                targetSelector: '[data-wizard-target="field-name"]',
                position: 'right'
            },
            {
                id: 'new-proj-desc',
                title: '📝 Descripción',
                description: 'Breve resumen de qué hace tu proyecto. Esto ayuda a identificarlo en el dashboard.',
                targetSelector: '[data-wizard-target="field-description"]',
                position: 'right'
            },
            {
                id: 'new-proj-type',
                title: '📱 Tipo de Aplicación',
                description: '¿Es una web, app móvil o servicio backend? Esto define la arquitectura base.',
                targetSelector: '[data-wizard-target="field-type"]',
                position: 'right'
            },
            {
                id: 'new-proj-template',
                title: '📑 Plantilla Inicial',
                description: 'Selecciona una estructura base para no empezar desde cero (CRUD, E-commerce, Blog).',
                targetSelector: '[data-wizard-target="field-template"]',
                position: 'top'
            },
            {
                id: 'new-proj-stack',
                title: '🛠️ Stack Tecnológico',
                description: 'Elige las tecnologías que prefieres. Herman generará el código optimizado para ellas.',
                targetSelector: '[data-wizard-target="field-stack"]',
                position: 'top'
            },
            {
                id: 'new-proj-submit',
                title: '🚀 Todo Listo',
                description: 'Haz clic en "Crear proyecto" para que Herman genere la estructura inicial.',
                targetSelector: '[data-wizard-target="btn-submit-project"]',
                position: 'top'
            }
        ]
    },

    // =====================================
    // MÓDULO: NUEVO REQUISITO (MODAL)
    // =====================================
    modalNuevoRequisito: {
        module: 'modalNuevoRequisito',
        autoStart: true,
        steps: [
            {
                id: 'new-req-intro',
                title: '➕ Agregar Requisito',
                description: 'Define un nuevo requerimiento para tu sistema.',
                targetSelector: '[data-wizard-target="modal-nuevo-requisito"]',
                position: 'right'
            },
            {
                id: 'new-req-title',
                title: '📝 Título Claro',
                description: 'Usa un nombre corto y descriptivo. Ej: "Login con Google".',
                targetSelector: '[data-wizard-target="modal-req-titulo"]',
                position: 'right'
            },
            {
                id: 'new-req-desc',
                title: '📄 Descripción Detallada',
                description: 'Explica qué debe hacer el sistema. Sé específico para que la IA entienda el contexto.',
                targetSelector: '[data-wizard-target="modal-req-descripcion"]',
                position: 'right'
            },
            {
                id: 'new-req-type',
                title: '🔧 Tipo de Requisito',
                description: 'Funcional (acción del usuario) o No Funcional (rendimiento, seguridad).',
                targetSelector: '[data-wizard-target="modal-req-tipo"]',
                position: 'right'
            },
            {
                id: 'new-req-priority',
                title: '🚨 Prioridad',
                description: 'Alta (bloqueante), Media (importante) o Baja (deseable).',
                targetSelector: '[data-wizard-target="modal-req-prioridad"]',
                position: 'right'
            }
        ]
    }
};
