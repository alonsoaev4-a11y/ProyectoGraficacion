import { UseCase, Step } from '../../app/components/acciones/casos-uso/types';
import { inferType } from './type-inference';

export class UseCaseTranspiler {
    private useCase: UseCase;

    constructor(useCase: UseCase) {
        this.useCase = useCase;
    }

    public generate(): string {
        const imports = this.generateImports();
        const validationSchema = this.generateValidationSchema();
        const handler = this.generateHandler();

        return `${imports}

${validationSchema}

${handler}
`;
    }

    private generateImports(): string {
        return `import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma'; // Asumiendo ubicación
`;
    }

    private generateValidationSchema(): string {
        // Buscar paso USER_INPUT para sacar el schema
        const inputStep = this.useCase.steps.find(s => s.type === 'USER_INPUT');
        if (!inputStep || !inputStep.semantics?.inputs) return '';

        const fields = inputStep.semantics.inputs.map(input => {
            return `  ${input.name}: ${inferType(input.name, input.required)}`;
        }).join(',\n');

        return `const InputSchema = z.object({
${fields}
});`;
    }

    private generateHandler(): string {
        const logic = this.generateLogic();

        return `export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { // Asumimos POST por defecto para transacciones
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    ${this.hasUserInput() ? 'const input = InputSchema.parse(req.body);' : ''}

    // Transaction block if multiple DB operations exist
    const result = await prisma.$transaction(async (tx) => {
${logic}
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}`;
    }

    private hasUserInput(): boolean {
        return this.useCase.steps.some(s => s.type === 'USER_INPUT');
    }

    private generateLogic(): string {
        // Generar código secuencialmente basado en pasos
        let code = '';
        let lastResultVar = '';

        this.useCase.steps.forEach((step, index) => {
            code += `      // Step ${index + 1}: ${step.action}\n`;

            switch (step.type) {
                case 'USER_INPUT':
                    // Ya manejado al inicio del handler
                    break;

                case 'VALIDATION':
                    code += this.generateValidationStep(step);
                    break;

                case 'DB_OPERATION':
                    const { varName, block } = this.generateDbStep(step, lastResultVar);
                    code += block;
                    lastResultVar = varName;
                    break;

                case 'SYSTEM_PROCESS':
                    code += `      // TODO: Implement Logic for '${step.action}'\n`;
                    break;
            }
            code += '\n';
        });

        // Return final result (last DB operation or dummy)
        code += `      return ${lastResultVar || '{ message: "Proceso completado" }'};`;

        return code;
    }

    private generateValidationStep(step: Step): string {
        // Ejemplo: "Check if email exists"
        // AST debería tener semántica rica, aquí inferimos o usamos placeholders
        if (!step.semantics) return `      // Validation logic missing\n`;

        // Simulación: Si semántica dice "check_unique"
        if (step.semantics.verb === 'check_unique' && step.semantics.targetEntity) {
            const field = step.semantics.targetField || 'email';
            const model = step.semantics.targetEntity.toLowerCase();

            return `      const existing = await tx.${model}.findUnique({ where: { ${field}: input.${field} } });
      if (existing) throw new Error('${step.action} failed: Record already exists');\n`;
        }

        return `      // Custom validation: ${step.action}\n`;
    }

    private generateDbStep(step: Step, prevVar: string): { varName: string, block: string } {
        if (!step.semantics) return { varName: '', block: '' };

        const model = step.semantics.targetEntity?.toLowerCase() || 'model';
        const action = step.semantics.verb; // create, update, delete
        const varName = `${action}${step.semantics.targetEntity || 'Result'}`;

        let block = '';

        if (action === 'create') {
            block = `      const ${varName} = await tx.${model}.create({
        data: {
          // TODO: Map fields correctly
          ...input
        }
      });\n`;
        } else if (action === 'update') {
            block = `      const ${varName} = await tx.${model}.update({
        where: { id: input.id },
        data: input
      });\n`;
        }

        return { varName, block };
    }
}
