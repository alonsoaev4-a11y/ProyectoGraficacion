import { AST, StepNode, DecisionNode } from '../types';

export class SemanticAnalyzer {
    // In a real scenario, this gets the Data Model (Tables) to validate references.
    private dataModel: any[]; // Mock for now

    constructor(dataModel: any[] = []) {
        this.dataModel = dataModel;
    }

    public analyze(ast: AST): AST {
        const errors: string[] = [];

        ast.nodes.forEach(node => {
            if (node.type === 'Step') {
                this.validateStep(node as StepNode, errors);
            }
            if (node.type === 'Decision') {
                this.validateDecision(node as DecisionNode, errors);
            }
        });

        if (errors.length > 0) {
            console.error("Semantic Errors:", errors);
            throw new Error(`Semantic Compilation Failed: ${errors.join(', ')}`);
        }

        return ast; // Returns the same AST if valid, or a refined one
    }

    private validateStep(step: StepNode, errors: string[]) {
        // Rule 1: DB_OPERATION must have a target entity
        if (step.semanticType === 'DB_OPERATION') {
            if (!step.semantics?.targetEntity) {
                errors.push(`Step '${step.action}' is a DB_OPERATION but has no Target Entity configured.`);
            }
            if (!step.semantics?.verb) {
                errors.push(`Step '${step.action}' is a DB_OPERATION but has no Verb (create/update/etc) configured.`);
            }
        }

        // Rule 2: USER_INPUT inputs must have types
        if (step.semanticType === 'USER_INPUT') {
            if (step.semantics?.inputs) {
                step.semantics.inputs.forEach((input: any) => {
                    if (!input.type) {
                        errors.push(`Input '${input.name}' in step '${step.action}' has no type defined.`);
                    }
                });
            }
        }
    }

    private validateDecision(decision: DecisionNode, errors: string[]) {
        // Rule 3: Decisions must have at least 2 branches (or 1 if it's a simple check, but usually flow logic implies divergent paths)
        if (decision.branches.length < 2) {
            errors.push(`Decision '${decision.condition}' must have at least 2 outcomes (branches). Found: ${decision.branches.length}`);
        }
    }
}
