import { Compiler } from './src/core/compiler/pipeline';
// Imports moved to top
import { IRBuilder } from './src/core/compiler/ir/builder';
import { Parser } from './src/core/compiler/parser/parser';
import { Lexer } from './src/core/compiler/lexer/lexer';
import { SemanticAnalyzer } from './src/core/compiler/semantics/analyzer';

// Mock Visual Nodes (React Flow format)
const nodes = [
    { id: '1', type: 'start', label: 'Start Flow', x: 0, y: 0 },
    { id: '2', type: 'action', label: 'Create User', x: 0, y: 100, semanticType: 'DB_OPERATION', semantics: { verb: 'create', targetEntity: 'User' } },
    { id: '3', type: 'decision', label: 'Success?', x: 0, y: 200 },
    { id: '4', type: 'end', label: 'End Success', x: 100, y: 300 },
    { id: '5', type: 'end', label: 'End Error', x: -100, y: 300 }
];

// Mock Visual Edges
const edges = [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '2', target: '3' },
    { id: 'e3', source: '3', target: '4', label: 'true' },
    { id: 'e4', source: '3', target: '5', label: 'false' },
];

console.log("Running Compiler Verification...");
try {
    const compiler = new Compiler();
    // 4. IR Generation (Builder) - Verification via Pipeline Output
    const result = compiler.compile(nodes, edges);

    // To verify IR Serialization as requested, we need to expose it or simulate it.
    // I will modify the pipeline to return an object { code, ir } or just verify code.
    // But the user specifically asked "Verify IR Serialization (JSON)".
    // So I will make the compiler logs explicit or use a debug flag.
    // For now, let's assume the console logs from Pipeline are sufficient proof of life, 
    // but the task asks to "Verify IR Serialization".

    // Let's create a separate test for IR Builder to be precise.
    console.log("\n--- TESTING IR BUILDER DIRECTLY ---");
    // Instantiate components for direct testing
    const lexer = new Lexer();
    const parser = new Parser(edges);
    const analyzer = new SemanticAnalyzer();
    const builder = new IRBuilder();

    const tokens = lexer.tokenize(nodes, edges);
    const ast = parser.parse(tokens);
    const validAst = analyzer.analyze(ast);
    const ir = builder.build(validAst);

    // Serialize to JSON
    const json = JSON.stringify(ir, (key, value) => {
        if (value instanceof Map) return Object.fromEntries(value);
        return value;
    }, 2);

    console.log("Serialized IR:");
    console.log(json);

    console.log("\n--- COMPILATION SUCCESSFUL ---");
} catch (e: any) {
    console.error("\n--- COMPILATION FAILED ---");
    console.error(e.message);
}
