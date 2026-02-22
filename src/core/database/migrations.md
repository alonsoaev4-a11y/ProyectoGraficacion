# Arquitectura de Migraciones Automáticas

## Estrategia General
En lugar de implementar un motor de diffing SQL desde cero, utilizaremos **Prisma Migrate** como el motor core. Nuestra herramienta actuará como una capa de abstracción que gestiona el `schema.prisma` y orquesta los comandos de la CLI de Prisma.

## Flujo de Trabajo

1.  **Modelado Visual**: El usuario edita tablas y relaciones en la UI.
2.  **Generación de Schema**: El `PrismaGenerator` convierte el modelo JSON a `schema.prisma`.
3.  **Detección de Cambios**:
    - Se compara el nuevo `schema.prisma` con la versión anterior almacenada.
    - Si hay cambios, se procede al siguiente paso.
4.  **Creación de Migración**:
    - Se ejecuta `prisma migrate dev --create-only --name <timestamp>_<change_summary>`.
    - Esto genera un archivo `.sql` en `prisma/migrations`.
5.  **Aplicación (Opcional)**:
    - El usuario puede revisar el SQL generado.
    - Al confirmar, se ejecuta `prisma migrate deploy` (o se aplica en desarrollo).

## Estructura de Versionado

Las migraciones seguirán el estándar de Prisma:
```
prisma/
  migrations/
    20231027103000_init/
      migration.sql
    20231027110000_add_users_table/
      migration.sql
  schema.prisma
```

## Rollback y Seguridad

### Down Migrations
Prisma no genera "down migrations" automáticamente. Para soportar esto en una plataforma Low-Code, tenemos dos opciones:
1.  **Snapshot Reversion**: Almacenar snapshots del `schema.prisma` completo por versión. Para hacer rollback, restauramos el schema anterior y generamos una nueva migración que invierta los cambios. Esta es la estrategia recomendada por ser más robusta ("Roll forward").
    - *Ejemplo*: V1 (Sin tabla X) -> V2 (Con tabla X).
    - *Rollback*: Restaurar schema V1 -> Generar migración V3 (Drop tabla X).

### Detección de Conflictos
Antes de aplicar una migración, verificamos si hay "drift" en la base de datos (cambios manuales fuera de la herramienta) usando `prisma migrate diff`.

## API de Servicios

`MigrationService` tendrá métodos:
- `generateMigration(schemaContent: string, name: string): Promise<MigrationResult>`
- `applyMigration(): Promise<void>`
- `getMigrationHistory(): Promise<MigrationLog[]>`
