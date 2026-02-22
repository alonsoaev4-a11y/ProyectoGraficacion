export type TokenType =
    | 'START'
    | 'END'
    | 'ACTION'
    | 'DECISION'
    | 'CONNECTION_YES'
    | 'CONNECTION_NO'
    | 'CONNECTION_DEFAULT';

export interface Token {
    type: TokenType;
    value: any; // Raw data from visual node
    metadata?: any; // Position, ID from original graph
}

// AST (Abstract Syntax Tree)
export type ASTNodeType = 'Step' | 'Decision' | 'AlternativeFlow';

export interface ASTNode {
    id: string;
    type: ASTNodeType;
}

export interface StepNode extends ASTNode {
    type: 'Step';
    action: string;
    semanticType: 'USER_INPUT' | 'SYSTEM_PROCESS' | 'DB_OPERATION';
    semantics?: any;
    nextId?: string; // For linear flow
}

export interface DecisionNode extends ASTNode {
    type: 'Decision';
    condition: string;
    branches: {
        condition: string; // 'true' | 'false'
        targetNodeId: string;
    }[];
}

export interface AST {
    root: ASTNode; // Typically the Start Node
    nodes: Map<string, ASTNode>; // Map for random access
    entryPointId: string;
}

// IR interfaces have been moved to ./ir/types.ts
// CodeGenerator interface is now implicitly defined by the implementation.
