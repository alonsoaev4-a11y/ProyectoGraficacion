import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { SemanticAnalyzer } from './semantics/analyzer';
import { IRBuilder } from './ir/builder'; // Changed from IRGenerator
import { Optimizer } from './optimizer/optimizer';
import { CodeGenerator } from './codegen/generator';

export class Compiler {
    private lexer: Lexer;
    private parser: Parser;
    private analyzer: SemanticAnalyzer;
    private irBuilder: IRBuilder; // Changed
    private optimizer: Optimizer;
    private codeGenerator: CodeGenerator;

    constructor() {
        this.lexer = new Lexer();
        this.parser = new Parser([]);
        this.analyzer = new SemanticAnalyzer();
        this.irBuilder = new IRBuilder(); // Changed
        this.optimizer = new Optimizer();
        this.codeGenerator = new CodeGenerator();
    }

    public compile(visualNodes: any[], visualEdges: any[]): string {
        console.log("--- Starting Compilation Phase ---");

        // 1. Lexing
        const tokens = this.lexer.tokenize(visualNodes, visualEdges);
        console.log(`[Lexer] Generated ${tokens.length} tokens.`);

        // 2. Parsing (Re-instantiate parser with edges if needed or pass context)
        this.parser = new Parser(visualEdges);
        const ast = this.parser.parse(tokens);
        console.log(`[Parser] AST built with root ${ast.root.type}.`);

        // 3. Semantics
        const validAst = this.analyzer.analyze(ast);
        console.log(`[Semantics] AST Validated.`);

        // 4. IR Generation (Builder)
        const ir = this.irBuilder.build(validAst); // Changed method to .build()
        console.log(`[IR] Generated ${ir.blocks.size} blocks.`);

        // 5. Optimization
        // Optimizer needs update to handle new IR types, skipping for now or passing through
        // const optimizedIr = this.optimizer.optimize(ir);
        console.log(`[Optimizer] Skipped for v2 IR (TODO: Update Optimizer).`);

        // 6. Code Gen
        const code = this.codeGenerator.emit(ir);
        console.log(`[CodeGen] Code generated (${code.length} bytes).`);

        return code;
    }
}
