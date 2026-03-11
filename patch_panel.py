with open("src/app/components/acciones/ia/PanelIA.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "description: 'Revisión de contexto, requisitos y casos de uso.',",
    "description: 'Para entender el negocio antes de diseñar.',"
)
content = content.replace(
    "description: 'Propuesta de arquitectura con patrones de diseño.',",
    "description: 'Para estructurar Angular, FastAPI y MySQL.',"
)
content = content.replace(
    "description: 'Schema Prisma, SQL DDL y scripts de seed.',",
    "description: 'Para crear tablas y relaciones en MySQL.',"
)
content = content.replace(
    "description: 'Endpoints REST, JWT y validación.',",
    "description: 'Para exponer reglas y datos de forma segura.',"
)
content = content.replace(
    "description: 'Componentes React, hooks y navegación.',",
    "description: 'Para estructurar la interfaz con Angular.',"
)
content = content.replace(
    "description: 'Estrategia de pruebas y cobertura.',",
    "description: 'Para asegurar la calidad del código.',"
)
content = content.replace(
    "description: 'CI/CD, Docker y variables de entorno.',",
    "description: 'Para preparar el despliegue a producción.',"
)
content = content.replace(
    "7 fases · DeepSeek V3",
    "7 fases · Qwen 3.5 35B"
)

with open("src/app/components/acciones/ia/PanelIA.tsx", "w", encoding="utf-8") as f:
    f.write(content)
