import { IRProgram, IRBlock, IRInstruction } from '../ir/types';

export class CodeGenerator {
    public emit(ir: IRProgram): string {
        let code = `import { NextApiRequest, NextApiResponse } from 'next';\nimport { prisma } from '@/lib/prisma';\n\n`;
        code += `export default async function handler(req: NextApiRequest, res: NextApiResponse) {\n`;

        // Iterate over blocks map
        // Note: New IR has blocks as Map, need to iterate values or order them if sequence is critical.
        // For basic blocks, we often start from entry and follow jumps. 
        // For this simple v2, we'll iterate the map values.

        for (const block of ir.blocks.values()) {
            code += `  // Block ${block.id} ${block.label ? `(${block.label})` : ''}\n`;

            block.instructions.forEach(inst => {
                switch (inst.op) {
                    case 'LOAD_INPUT':
                        // const types = JSON.stringify(inst.inputSchema);
                        code += `  const input = req.body; // Schema: ${JSON.stringify(inst.inputSchema)}\n`;
                        break;

                    case 'DB_CREATE':
                        code += `  const ${inst.resultVar} = await prisma.${inst.entity}.create({ data: input });\n`;
                        break;

                    case 'DB_UPDATE':
                        code += `  const ${inst.resultVar} = await prisma.${inst.entity}.update({ where: { ... }, data: input });\n`;
                        break;

                    case 'JUMP_IF':
                        code += `  if (${inst.condition}) { /* Goto ${inst.targetBlockId} */ } else { /* Goto ${inst.elseTargetBlockId} */ }\n`;
                        break;

                    case 'RETURN':
                        code += `  return res.status(200).json({ success: true });\n`;
                        break;

                    case 'NOOP':
                        break;
                }
            });
        }

        code += `  return res.status(200).json({ message: 'Flow completed' });\n}`;
        return code;
    }
}
