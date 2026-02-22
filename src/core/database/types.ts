export type DataType =
    | 'INT'
    | 'BIGINT'
    | 'FLOAT'
    | 'DECIMAL'
    | 'BOOLEAN'
    | 'VARCHAR'
    | 'TEXT'
    | 'DATE'
    | 'DATETIME'
    | 'TIMESTAMP'
    | 'JSON'
    | 'UUID'
    | 'ENUM';

export interface ColumnOptions {
    length?: number; // Para VARCHAR
    precision?: number; // Para DECIMAL
    scale?: number; // Para DECIMAL
    unsigned?: boolean; // Para INT
    autoIncrement?: boolean; // Para INT/BIGINT
    isArray?: boolean; // Para soporte de arrays en Postgres
}

export interface ColumnConstraints {
    isPk: boolean;
    isFk: boolean;
    isNullable: boolean;
    isUnique: boolean;
    defaultValue?: string | number | boolean | 'NOW' | 'UUID' | 'CUID';
    checkConstraint?: string; // Ex: "age > 18"
}

export interface Column {
    id: string;
    name: string;
    type: DataType;
    options?: ColumnOptions;
    constraints: ColumnConstraints;
    description?: string; // Para documentación
    references?: {
        tableId: string;
        columnId: string;
        relationName?: string; // Nombre opcional para la relación en Prisma
    };
}

export interface TableOptions {
    timestamps: boolean; // created_at, updated_at
    softDelete: boolean; // deleted_at
    multiTenant: boolean; // tenant_id
    description?: string;
}

export interface Table {
    id: string;
    name: string;
    columns: Column[];
    options: TableOptions;
    position: { x: number; y: number }; // Solo para UI
}

export type RelationType = '1:1' | '1:N' | 'N:M';

export type OnDeleteAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';
export type OnUpdateAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';

export interface Relationship {
    id: string;
    type: RelationType;
    fromTableId: string;
    fromColumnId?: string; // Opcional, si no se selecciona columna específica se usa PK
    toTableId: string;
    toColumnId?: string; // Generalmente la PK de la tabla destino
    onDelete?: OnDeleteAction;
    onUpdate?: OnUpdateAction;
    name?: string; // Nombre de la relación en el esquema
}

// Vinculación con Casos de Uso (Trazabilidad)
export interface EntityUsage {
    entityId: string; // Table ID
    useCaseId: string;
    accessType: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LIST';
    fieldsInvolved?: string[]; // Column IDs
}
