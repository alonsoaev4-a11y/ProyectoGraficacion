
export type AccessType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LIST';

export interface DataRequirement {
    id: string;
    useCaseId: string; // ID del caso de uso (AST)
    stepId: string;    // ID del paso específico donde ocurre el acceso

    entityId: string;  // ID de la Tabla
    fields?: string[]; // IDs de las Columnas involucradas (opcional, si es todo el registro)

    accessType: AccessType;

    // Reglas de negocio asociadas al acceso de datos
    constraints?: {
        filter?: string; // Ejemplo: "user.id == current_user.id" (Row Level Security)
        validation?: string; // Ejemplo: "amount > 0"
    };
}

export interface TraceabilityMatrix {
    // Mapa inverso: Entity ID -> Lista de Usos
    entityUsage: Record<string, DataRequirement[]>;

    // Mapa directo: UseCase ID -> Entidades tocadas
    useCaseImpact: Record<string, string[]>; // Lista de Entity IDs
}
