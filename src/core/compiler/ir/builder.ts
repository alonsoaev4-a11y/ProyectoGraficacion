import { AST, ASTNode, StepNode, DecisionNode } from '../types';
import { IRProgram, IRBlock, IRInstruction, IROpCode } from './types';

export class IRBuilder {
    private program: IRProgram;
    private currentBlock: IRBlock | null = null;
    private blockCounter = 0;
    private instructionCounter = 0;

    constructor() {
        this.program = {
            entryBlockId: '',
            blocks: new Map(),
            variables: []
        };
    }

    public build(ast: AST): IRProgram {
        // Reset state
        this.program.blocks.clear();
        this.program.variables = [];
        this.blockCounter = 0;
        this.instructionCounter = 0;

        // Create Entry Block
        const entryBlock = this.createBlock('entry');
        this.program.entryBlockId = entryBlock.id;
        this.currentBlock = entryBlock;

        // Traverse AST
        this.traverse(ast.root, entryBlock, ast);

        // Ensure all blocks have a terminator if not set (implied return or error)
        this.program.blocks.forEach(block => {
            if (!block.terminator && block.instructions.length > 0) {
                const last = block.instructions[block.instructions.length - 1];
                if (last.op !== 'RETURN' && last.op !== 'JUMP' && last.op !== 'JUMP_IF') {
                    // Add implicit return
                    this.addInstruction(block, 'RETURN', {});
                }
            } else if (block.instructions.length === 0 && !block.terminator) {
                this.addInstruction(block, 'RETURN', {});
            }
        });

        return this.program;
    }

    private traverse(node: ASTNode, block: IRBlock, ast: AST) {
        if (!node) return;
        this.currentBlock = block; // Set context

        if (node.type === 'Step') {
            const step = node as StepNode;

            if (step.semanticType === 'USER_INPUT') {
                this.addInstruction(block, 'LOAD_INPUT', {
                    inputSchema: this.mapInputs(step.semantics?.inputs)
                });
            }
            else if (step.semanticType === 'DB_OPERATION') {
                const verb = step.semantics?.verb || 'create';
                const op = this.mapDbVerbToOp(verb);

                this.addInstruction(block, op, {
                    entity: step.semantics?.targetEntity,
                    resultVar: `res_${step.id}`
                });
            }

            // Linear flow assumption: Next node is often implicit in this simplified AST.
            // In a full graph, we'd check edges here. 
            // Existing logic assumes linear unless Decision.
            // IMPORTANT: If next node is Decision, we don't start a NEW block yet, 
            // unless we want every node to be a block (SSA style).
            // For simplicity, we append instructions to current block until a branching point.

            // Linear flow
            if (step.nextId) {
                const nextNode = ast.nodes.get(step.nextId);
                if (nextNode) {
                    this.traverse(nextNode, block, ast);
                }
            }

        } else if (node.type === 'Decision') {
            const decision = node as DecisionNode;

            const trueBlock = this.createBlock('true_branch');
            const falseBlock = this.createBlock('false_branch');

            // Terminate current block with JumpIf
            const jumpInstr: IRInstruction = {
                id: this.genId(),
                op: 'JUMP_IF',
                condition: decision.condition,
                targetBlockId: trueBlock.id,
                elseTargetBlockId: falseBlock.id
            };
            block.instructions.push(jumpInstr);
            block.terminator = jumpInstr;

            // Recurse
            decision.branches.forEach(branch => {
                const targetNode = ast.nodes.get(branch.targetNodeId);
                const targetBlock = (branch.condition === 'true' || branch.condition === 'Sí') ? trueBlock : falseBlock;
                if (targetNode) {
                    this.traverse(targetNode, targetBlock, ast);
                }
            });
        }
    }

    private createBlock(label?: string): IRBlock {
        const id = `blk_${this.blockCounter++}`;
        const block: IRBlock = {
            id,
            label,
            instructions: []
        };
        this.program.blocks.set(id, block);
        return block;
    }

    private addInstruction(block: IRBlock, op: IROpCode, params: Partial<IRInstruction>) {
        const instr: IRInstruction = {
            id: this.genId(),
            op,
            ...params
        };
        block.instructions.push(instr);
    }

    private genId(): string {
        return `i_${this.instructionCounter++}`;
    }

    private mapInputs(inputs: any[]): Record<string, string> {
        const schema: Record<string, string> = {};
        if (inputs && Array.isArray(inputs)) {
            inputs.forEach(i => schema[i.name] = i.type || 'string');
        }
        return schema;
    }

    private mapDbVerbToOp(verb: string): IROpCode {
        switch (verb.toLowerCase()) {
            case 'create': return 'DB_CREATE';
            case 'update': return 'DB_UPDATE';
            case 'delete': return 'DB_DELETE';
            case 'read': case 'find': return 'DB_FIND';
            default: return 'NOOP';
        }
    }
}
