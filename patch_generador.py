import re

with open("src/app/components/acciones/generacion/GeneradorCodigo.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace JSZip import
if "import JSZip" not in content:
    content = content.replace("import { saveAs } from 'file-saver';", "import { saveAs } from 'file-saver';\nimport JSZip from 'jszip';")

# Fix missing Download icon import
if "Download," not in content and "Download" not in content.split("} from 'lucide-react'")[0]:
    content = content.replace("Code2,", "Code2,\n  Download,")

# Replace buildBDSchemaPrompt
content = re.sub(
    r'let md = `# BD — Schema de Base de Datos \+ Prompt para IA\n\n`;.*?md \+= `\`\`\`\n\n`;',
    r'''let md = `# BD — Schema de Base de Datos + Prompt para IA\n\n`;
  md += `> **Instrucciones:** Copia este documento completo y pégalo en la IA para generar los modelos de SQLAlchemy, migraciones Alembic y scripts para MySQL.\n\n`;
  md += `---\n\n`;

  // SQLAlchemy / MySQL schema
  md += `## Schema SQLAlchemy (FastAPI) y DDL MySQL\n\n`;
  md += `\`\`\`python\n`;
  md += `# models.py — generado por Soft-Evolved AI\n`;
  md += `# Proyecto: ${p.nombre || 'Mi Proyecto'}\n\n`;
  md += `from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey\n`;
  md += `from sqlalchemy.orm import relationship\n`;
  md += `from database import Base\n\n`;

  if (tables.length > 0) {
    tables.forEach((table: any) => {
      md += `class ${toPascalCase(table.name)}(Base):\n`;
      md += `    __tablename__ = "${toSnakeCase(table.name)}"\n\n`;
      if (table.fields?.length > 0) {
        table.fields.forEach((f: any) => {
          const pyType = f.type === 'number' ? 'Integer' : f.type === 'boolean' ? 'Boolean' : f.type === 'date' ? 'DateTime' : 'String';
          const pk = f.isPrimaryKey ? ', primary_key=True, index=True' : '';
          const nullable = !f.required ? ', nullable=True' : ', nullable=False';
          const unique = f.isUnique ? ', unique=True' : '';
          md += `    ${toCamelCase(f.name)} = Column(${pyType}${pk}${unique}${nullable})\n`;
        });
      } else {
        md += `    id = Column(Integer, primary_key=True, index=True)\n`;
        md += `    # TODO: Define fields for ${table.name}\n`;
      }
      md += `\n`;
    });
  } else if (entidades.length > 0) {
    entidades.slice(0, 8).forEach((ent: string) => {
      md += `class ${toPascalCase(ent)}(Base):\n`;
      md += `    __tablename__ = "${toSnakeCase(ent)}"\n\n`;
      md += `    id = Column(Integer, primary_key=True, index=True)\n`;
      md += `    # TODO: Define fields for ${ent}\n\n`;
    });
  } else {
    md += `# No se definieron tablas ni entidades.\n# Completa el Modelado de Datos o el levantamiento de Metadatos.\n`;
  }
  md += `\`\`\`\n\n`;''',
    content, flags=re.DOTALL
)

# Replace buildBackendAPIPrompt
content = re.sub(
    r'let md = `# Backend — API REST \+ Prompt para IA\n\n`;.*?\/\/ Validaciones Zod',
    r'''let md = `# Backend — API REST + Prompt para IA\n\n`;
  md += `> **Instrucciones:** Copia este documento completo y pégalo en la IA para generar el backend completo con FastAPI y Pydantic.\n\n`;
  md += `---\n\n`;

  // Endpoints derived from use cases
  md += `## Endpoints REST (FastAPI) derivados de Casos de Uso\n\n`;

  if (useCases.length > 0) {
    useCases.forEach((uc: any) => {
      md += `### ${uc.code}: ${uc.title}\n\n`;
      // Infer HTTP method and path from steps
      const dbSteps = (uc.steps ?? []).filter((s: any) => s.type === 'DB_OPERATION');
      const verb = inferHTTPVerb(uc.title);
      const resource = inferResource(uc.title, tables);
      md += `\`${verb} /api/${resource}\`\n\n`;
      md += `- **Descripción:** ${uc.description || '—'}\n`;
      if (uc.actors?.length > 0) {
        md += `- **Actores:** ${uc.actors.map((a: any) => a.name).join(', ')}\n`;
      }
      if (uc.preconditions?.length > 0) {
        md += `- **Precondiciones:** ${uc.preconditions.map((p: any) => p.description).join('; ')}\n`;
      }
      if (uc.businessRules?.length > 0) {
        md += `- **Reglas de negocio:** ${uc.businessRules.map((br: any) => br.description).join('; ')}\n`;
      }
      if (dbSteps.length > 0) {
        md += `- **Operaciones BD:** ${dbSteps.map((s: any) => s.action).join('; ')}\n`;
      }
      md += '\n';
    });
  } else {
    // Fallback: generate CRUD endpoints from tables
    if (tables.length > 0) {
      md += `_No se definieron casos de uso. Endpoints CRUD inferidos desde tablas:_\n\n`;
      tables.forEach((table: any) => {
        const res = toSnakeCase(table.name).replace(/_/g, '-');
        md += `- \`GET    /api/${res}\` — Listar todos\n`;
        md += `- \`GET    /api/${res}/{id}\` — Obtener por ID\n`;
        md += `- \`POST   /api/${res}\` — Crear nuevo\n`;
        md += `- \`PUT    /api/${res}/{id}\` — Actualizar\n`;
        md += `- \`DELETE /api/${res}/{id}\` — Eliminar\n\n`;
      });
    } else {
      md += `_Sin casos de uso ni tablas definidas. Define al menos uno para generar endpoints._\n\n`;
    }
  }

  // Validaciones Pydantic''',
    content, flags=re.DOTALL
)

# Replace Zod with Pydantic
content = re.sub(
    r'\/\/ Validaciones Zod.*?md \+= `---\n\n## Esquemas de Validación \(Zod\)\n\n\`\`\`typescript\n`;.*?md \+= `import \{ z \} from \'zod\';\n\n`;.*?md \+= `\`\`\`\n\n`;',
    r'''// Validaciones Pydantic
  if (tables.length > 0) {
    md += `---\n\n## Esquemas de Validación (Pydantic)\n\n\`\`\`python\n`;
    md += `from pydantic import BaseModel\nfrom typing import Optional, List\nfrom datetime import datetime\n\n`;
    tables.forEach((table: any) => {
      const className = toPascalCase(table.name);
      if (table.fields?.length > 0) {
        md += `class ${className}Base(BaseModel):\n`;
        table.fields.filter((f: any) => !f.isPrimaryKey).forEach((f: any) => {
          const pyType = f.type === 'number' ? 'int' : f.type === 'boolean' ? 'bool' : f.type === 'date' ? 'datetime' : 'str';
          const optional = !f.required ? 'Optional[' : '';
          const optEnd = !f.required ? '] = None' : '';
          md += `    ${toCamelCase(f.name)}: ${optional}${pyType}${optEnd}\n`;
        });
        md += `\nclass ${className}Create(${className}Base):\n    pass\n\n`;
        md += `class ${className}(${className}Base):\n    id: int\n\n    class Config:\n        orm_mode = True\n\n`;
      }
    });
    md += `\`\`\`\n\n`;
  }''',
    content, flags=re.DOTALL
)

# Replace buildFrontendComponentsPrompt
content = re.sub(
    r'let md = `# Frontend — Componentes React \+ Prompt para IA\n\n`;.*?md \+= `> \*\*Instrucciones:\*\* Copia este documento completo y pégalo en Claude/ChatGPT para generar el frontend completo\.\n\n`;',
    r'''let md = `# Frontend — Componentes Angular + Prompt para IA\n\n`;
  md += `> **Instrucciones:** Copia este documento completo y pégalo en la IA para generar la estructura completa en Angular.\n\n`;''',
    content, flags=re.DOTALL
)

content = re.sub(
    r'// Routes.*?md \+= `---\n\n## Rutas React Router v6\n\n\`\`\`tsx\n`;.*?md \+= `\]\);\n\`\`\`\n\n`;',
    r'''// Routes
  md += `---\n\n## Rutas Angular (app.routes.ts)\n\n\`\`\`typescript\n`;
  md += `import { Routes } from '@angular/router';\n`;
  md += `import { DashboardComponent } from './dashboard/dashboard.component';\n\n`;
  md += `export const routes: Routes = [\n`;
  md += `  { path: '', component: DashboardComponent },\n`;
  if (useCases.length > 0) {
    useCases.forEach((uc: any) => {
      const path = `${toSnakeCase(uc.title).replace(/_/g, '-')}`;
      const comp = toPascalCase(uc.title.replace(/\s+/g, '')) + 'Component';
      md += `  { path: '${path}', component: ${comp} },\n`;
    });
  }
  md += `];\n\`\`\`\n\n`;''',
    content, flags=re.DOTALL
)

# Replace Help texts and descriptions
content = content.replace("Componentes React + prompt para generar UI", "Componentes Angular + prompt para generar UI")
content = content.replace("Schema Prisma + prompt para generar BD completa", "Schema SQLAlchemy + DDL MySQL + prompt para BD")
content = content.replace("Endpoints REST + prompt para generar API", "Endpoints FastAPI + prompt para generar API")
content =
