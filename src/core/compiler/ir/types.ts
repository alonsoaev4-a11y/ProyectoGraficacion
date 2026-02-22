// Intermediate Representation (IR) Types
// This layer is completely decoupled from the AST and the Target Code.

export type HIRTyping = 'string' | 'number' | 'boolean' | 'date' | 'json';

export interface IRVariable {
    name: string;
    type: HIRTyping;
}

export type IROpCode =
    | 'LOAD_INPUT'
    | 'VALIDATE'
    | 'DB_CREATE'
    | 'DB_UPDATE'
    | 'DB_FIND'
    | 'DB_DELETE'
    | 'JUMP'
    | 'JUMP_IF'
    | 'RETURN'
    | 'NOOP';

export interface IRInstruction {
    id: string;
    op: IROpCode;
    // We use a discriminated union or loose bag of props depending on strictness.
    // For this design, we'll use specific fields for clarity.

    // DB Ops
    entity?: string;
    data?: Record<string, any>; // Field mapping

    // Control Flow
    condition?: string;
    targetBlockId?: string;
    elseTargetBlockId?: string; // For JUMP_IF

    // I/O
    inputSchema?: Record<string, string>; // name -> type

    // Output
    resultVar?: string; // Where to store the result of this op
}

export interface IRBlock {
    id: string;
    label?: string;
    instructions: IRInstruction[];
    terminator?: IRInstruction; // The last instruction (Jump/Return)
}

export interface IRProgram {
    entryBlockId: string;
    blocks: Map<string, IRBlock>;
    variables: IRVariable[]; // Symbol table for the IR scope
}
