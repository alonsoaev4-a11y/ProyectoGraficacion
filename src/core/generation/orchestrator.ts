import { UseCase } from '../../app/components/acciones/casos-uso/types';
import { Table } from '../database/types';

export class Orchestrator {
    private tables: Table[];

    constructor(tables: Table[]) {
        this.tables = tables;
    }

    public validateUseCase(useCase: UseCase): string[] {
        const errors: string[] = [];

        useCase.steps.forEach((step, index) => {
            if (step.type === 'DB_OPERATION' && step.semantics?.targetEntity) {
                const tableName = step.semantics.targetEntity;
                const tableExists = this.tables.some(t => t.name.toLowerCase() === tableName.toLowerCase());

                if (!tableExists) {
                    errors.push(`Step ${index + 1}: Target entity '${tableName}' does not exist in the data model.`);
                }
            }
        });

        return errors;
    }
}
