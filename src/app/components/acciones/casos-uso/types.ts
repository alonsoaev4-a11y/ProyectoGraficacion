// --- Compiler Oriented Model Types ---

export type StepType =
    | 'USER_INPUT'      // User enters data
    | 'SYSTEM_PROCESS'  // Internal calculation/process
    | 'DB_OPERATION'    // Direct CRUD
    | 'EXTERNAL_CALL'   // API/Service call
    | 'VALIDATION'      // Explicit check
    | 'NOTIFICATION';   // Email/Push

export interface ActionSemantics {
    verb: string; // 'create', 'update', 'approve', 'calculate'
    targetEntity?: string; // e.g., 'Student', 'Order'
    targetField?: string; // e.g., 'email', 'total_amount'
    inputs?: { name: string; type: string; required: boolean }[];
    outputs?: { name: string; type: string }[];
}

export interface BusinessRule extends CatalogItem {
    isActive: boolean;
    enforcementLevel?: 'DB_CONSTRAINT' | 'APP_VALIDATION' | 'WORKFLOW_BLOCKER';
    logic?: {
        expression: string; // e.g., "amount > 1000"
        errorMsg: string;
        errorCode: string;
    };
}

export interface GlobalException extends CatalogItem {
    triggerCondition?: string;
    response?: {
        httpStatus: number;
        recoveryAction: 'RETRY' | 'ABORT' | 'ROLLBACK';
        userMessage: string;
    };
}

// --- Extended Core Models ---

export interface CatalogItem {
    id: string;
    code?: string;
    description: string;
}


export interface SystemRole {
    id: string;
    name: string;
    code: string;
    description: string;
    isSystem: boolean;
    inheritsFrom?: string[];
}

export interface CRUDImpact {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    execute: boolean;
}

export interface Actor {
    id: string;
    roleId: string; // Link to SystemRole
    name: string;   // Display name (Role name or Alias)
    role: string;   // "primary" | "secondary" (Legacy field, mapped to participationType)

    // Advanced Security Context
    participationType: 'initiator' | 'secondary' | 'receiver';
    accessScope: 'own' | 'department' | 'global';
    crudImpact: CRUDImpact;
}

export interface Step {
    id: string;
    order: number;
    actorId: string;
    action: string; // Legacy text description

    // AST Fields (Optional for backward compat)
    type?: StepType;
    semantics?: ActionSemantics;
    triggersEvents?: string[];
    associatedRules?: string[]; // IDs of BusinessRules
}

export interface AlternativeFlow {
    id: string;
    code: string; // e.g., "A1"
    title: string;
    steps: Step[];

    // AST Fields
    triggerStepId?: string; // The step that triggers this flow
    condition?: {
        type: 'BUSINESS_ERROR' | 'SYSTEM_ERROR' | 'LOGICAL_BRANCH';
        logic: string; // expression or description
    };
}

export interface UseCase {
    id: string;
    code: string; // e.g., "CU-01"
    title: string;
    description: string;
    type: string; // e.g., "Esencial", "Soporte"
    priority: 'alta' | 'media' | 'baja';
    status: 'draft' | 'review' | 'approved';
    actors: Actor[];
    preconditions: CatalogItem[];
    postconditions: CatalogItem[];
    businessRules: BusinessRule[]; // Updated type
    exceptions: GlobalException[]; // Updated type
    steps: Step[];
    alternativeFlows: AlternativeFlow[];
}

export interface Catalogs {
    roles: SystemRole[]; // New Roles catalog
    actors: Actor[];     // Legacy/Template actors (optional, can be deprecated in favor of Roles)
    businessRules: BusinessRule[];
    preconditions: CatalogItem[];
    postconditions: CatalogItem[];
    exceptions: GlobalException[];
}
