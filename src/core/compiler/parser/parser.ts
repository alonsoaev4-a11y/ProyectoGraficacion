import { Token, AST, ASTNode, StepNode, DecisionNode } from '../types';

export class Parser {
    // The Parser in a Visual Compiler needs the Connectivity Data (Edges) which might come separately or be embedded.
    // In our design, the Lexer produced Tokens from Nodes. The Edges are essential for Structure.
    // We'll accept Edges as context or assume they are passed alongside.

    private edges: any[];

    constructor(edges: any[]) {
        this.edges = edges;
    }

    public parse(tokens: Token[]): AST {
        // 1. Identify Root
        const startToken = tokens.find(t => t.type === 'START');
        if (!startToken) throw new Error('Missing START token');

        const nodesMap = new Map<string, ASTNode>();

        // 2. Map Tokens to AST Nodes (Structural conversion)
        tokens.forEach(token => {
            const node = this.createASTNode(token);
            if (node) nodesMap.set(node.id, node);
        });

        // 3. Build the Tree/Graph structure (Linking)
        // In a strictly linear AST, we might order them. 
        // For Flowcharts, the AST closely mirrors the graph but with semantic validation.

        this.linkNodes(nodesMap);

        return {
            root: nodesMap.get(startToken.metadata.id)!,
            nodes: nodesMap,
            entryPointId: startToken.metadata.id
        };
    }

    private createASTNode(token: Token): ASTNode {
        const raw = token.value;
        const base = { id: raw.id };

        switch (token.type) {
            case 'ACTION':
                return {
                    ...base,
                    type: 'Step',
                    action: raw.label,
                    semanticType: raw.semanticType || 'SYSTEM_PROCESS',
                    semantics: raw.semantics
                } as StepNode;

            case 'DECISION':
                return {
                    ...base,
                    type: 'Decision',
                    condition: raw.label,
                    branches: [] // Populated in linking phase
                } as DecisionNode;

            default:
                return { ...base, type: 'Step' } as ASTNode; // Fallback
        }
    }

    private linkNodes(nodesMap: Map<string, ASTNode>) {
        this.edges.forEach(edge => {
            const source = nodesMap.get(edge.source);
            const target = nodesMap.get(edge.target);

            if (source && target) {
                if (source.type === 'Decision') {
                    const decision = source as DecisionNode;
                    decision.branches.push({
                        condition: edge.label || 'default',
                        targetNodeId: target.id
                    });
                } else if (source.type === 'Step') {
                    const step = source as StepNode;
                    step.nextId = target.id;
                }
            }
        });
    }
}
