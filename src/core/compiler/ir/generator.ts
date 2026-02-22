import { AST, ASTNode, StepNode, DecisionNode, IRProgram, IRBlock, IRInstruction } from '../types';

export class IRGenerator {
    private blocks: IRBlock[] = [];
    private blockCounter = 0;

    public generate(ast: AST): IRProgram {
        this.blocks = [];
        this.blockCounter = 0;

        // 1. Create Entry Block
        const entryBlock = this.createBlock();

        // 2. Traverse from Root
        // We need to maintain a "current block" context.
        this.traverse(ast.root, entryBlock, ast);

        return {
            blocks: this.blocks,
            entryBlockId: entryBlock.id
        };
    }

    private traverse(node: ASTNode, currentBlock: IRBlock, ast: AST) {
        if (!node) return;

        if (node.type === 'Step') {
            const step = node as StepNode;
            // Map high-level sematics to low-level IR Ops
            if (step.semanticType === 'USER_INPUT') {
                currentBlock.instructions.push({ op: 'LOAD_INPUT', args: [step.semantics?.inputs] });
            } else if (step.semanticType === 'DB_OPERATION') {
                const op = step.semantics?.verb === 'create' ? 'DB_CREATE' : 'DB_UPDATE';
                currentBlock.instructions.push({
                    op,
                    args: [step.semantics?.targetEntity],
                    result: `res_${step.id}`
                });
            } else if (step.semanticType === 'SYSTEM_PROCESS') {
                currentBlock.instructions.push({ op: 'NOOP', args: [step.action] });
            }

            // Move to next node (linear flow found in nodesMap or via explicit links in a real parser)
            // For chaos/demo, we assume linear next for now unless it's a decision.
            // In a real implementation, the Parser would have linked 'next'.
        }
        else if (node.type === 'Decision') {
            const decision = node as DecisionNode;

            // Decision implies branching -> End current block with JUMP_IF
            const targetBlockTrue = this.createBlock();
            const targetBlockFalse = this.createBlock();

            currentBlock.instructions.push({
                op: 'JUMP_IF',
                args: [decision.condition, targetBlockTrue.id, targetBlockFalse.id]
            });

            // Recurse into branches (In a real graph, we'd follow edges)
            decision.branches.forEach(branch => {
                const targetNode = ast.nodes.get(branch.targetNodeId);
                if (targetNode) {
                    // Logic to connect branches to blocks
                    // simplified: 
                    const branchBlock = branch.condition === 'true' || branch.condition === 'Sí' ? targetBlockTrue : targetBlockFalse;
                    this.traverse(targetNode, branchBlock, ast);
                }
            });
        }
    }

    private createBlock(): IRBlock {
        const block: IRBlock = {
            id: `blk_${this.blockCounter++}`,
            instructions: []
        };
        this.blocks.push(block);
        return block;
    }
}
