import { Table, Column } from './types';

export type ChangeType = 'CREATE_TABLE' | 'DROP_TABLE' | 'ADD_COLUMN' | 'DROP_COLUMN' | 'ALTER_COLUMN' | 'ADD_RELATION' | 'DROP_RELATION';

export interface ModelChange {
    type: ChangeType;
    entityName: string; // Table name
    details: string;
    severity: 'INFO' | 'WARNING' | 'DANGER';
}

export class ModelDiffer {
    public diff(oldTables: Table[], newTables: Table[]): ModelChange[] {
        const changes: ModelChange[] = [];

        // 1. Detect Tables Added
        newTables.forEach(newTable => {
            const oldTable = oldTables.find(t => t.id === newTable.id);
            if (!oldTable) {
                changes.push({
                    type: 'CREATE_TABLE',
                    entityName: newTable.name,
                    details: `Table '${newTable.name}' will be created.`,
                    severity: 'INFO'
                });
            } else {
                // Table exists, check columns
                this.diffColumns(oldTable, newTable, changes);
            }
        });

        // 2. Detect Tables Removed
        oldTables.forEach(oldTable => {
            const newTable = newTables.find(t => t.id === oldTable.id);
            if (!newTable) {
                changes.push({
                    type: 'DROP_TABLE',
                    entityName: oldTable.name,
                    details: `Table '${oldTable.name}' will be DELETED. Data loss possible.`,
                    severity: 'DANGER'
                });
            }
        });

        return changes;
    }

    private diffColumns(oldTable: Table, newTable: Table, changes: ModelChange[]) {
        // 1. Check Added Columns
        newTable.columns.forEach(newCol => {
            const oldCol = oldTable.columns.find(c => c.id === newCol.id);
            if (!oldCol) {
                changes.push({
                    type: 'ADD_COLUMN',
                    entityName: newTable.name,
                    details: `Column '${newCol.name}' (${newCol.type}) added to ${newTable.name}.`,
                    severity: 'INFO'
                });
            } else {
                // Check modifications
                if (oldCol.name !== newCol.name || oldCol.type !== newCol.type || oldCol.constraints.isNullable !== newCol.constraints.isNullable) {
                    changes.push({
                        type: 'ALTER_COLUMN',
                        entityName: newTable.name,
                        details: `Column '${oldCol.name}' changed to '${newCol.name}' (${newCol.type}).`,
                        severity: 'WARNING'
                    });
                }
            }
        });

        // 2. Check Removed Columns
        oldTable.columns.forEach(oldCol => {
            const newCol = newTable.columns.find(c => c.id === oldCol.id);
            if (!newCol) {
                changes.push({
                    type: 'DROP_COLUMN',
                    entityName: oldTable.name,
                    details: `Column '${oldCol.name}' removed from ${oldTable.name}.`,
                    severity: 'DANGER'
                });
            }
        });
    }
}
