import { Token, TokenType } from '../types';

export class Lexer {
    // The input here corresponds to the Visual Graph (Nodes + Edges)
    // In a textual compiler, this would be a string.
    // In our visual compiler, the "Lexer" flattens the graph into a linear/traversable structure or just sanitizes the input.
    // For Herman, our "Tokens" are actually purified versions of the Visual Nodes.

    public tokenize(nodes: any[], edges: any[]): Token[] {
        const tokens: Token[] = [];

        // 1. Find Start Node
        const startNode = nodes.find(n => n.type === 'start');
        if (!startNode) throw new Error('No Start Node found');

        // This is a simplified "Graph Lexer". 
        // Real lexing happens when we traverse. 
        // However, to fit the pipeline, we can convert ALL visual nodes to Tokens first.

        nodes.forEach(node => {
            let type: TokenType;

            switch (node.type) {
                case 'start': type = 'START'; break;
                case 'end': type = 'END'; break;
                case 'action': type = 'ACTION'; break;
                case 'decision': type = 'DECISION'; break;
                default: type = 'ACTION';
            }

            tokens.push({
                type,
                value: node,
                metadata: {
                    id: node.id,
                    position: { x: node.x, y: node.y }
                }
            });
        });

        return tokens;
    }
}
