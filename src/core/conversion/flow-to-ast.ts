import { VisualNode, VisualConnection, ConversionResult } from './types';
import { Step, AlternativeFlow } from '../../app/components/acciones/casos-uso/types';

export class FlowToAstConverter {
    private nodes: Map<string, VisualNode>;
    private connections: VisualConnection[];
    private visited: Set<string>;
    private steps: Step[];
    private alternativeFlows: AlternativeFlow[];
    private stepCounter: number;

    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.visited = new Set();
        this.steps = [];
        this.alternativeFlows = [];
        this.stepCounter = 1;
    }

    public convert(nodes: VisualNode[], connections: VisualConnection[]): ConversionResult {
        this.nodes.clear();
        nodes.forEach(n => this.nodes.set(n.id, n));
        this.connections = connections;
        this.visited.clear();
        this.steps = [];
        this.alternativeFlows = [];
        this.stepCounter = 1;

        const startNode = nodes.find(n => n.type === 'start');
        if (!startNode) return { steps: [], alternativeFlows: [], errors: ["No start node found"] };

        // Iniciar recorrido desde el nodo siguiente al Start
        const initialLink = connections.find(c => c.from === startNode.id);
        if (initialLink) {
            this.traverse(initialLink.to, 'main');
        }

        return {
            steps: this.steps,
            alternativeFlows: this.alternativeFlows,
            errors: []
        };
    }

    private traverse(nodeId: string, flowId: string, parentStepId?: string): void {
        const node = this.nodes.get(nodeId);
        if (!node || this.visited.has(nodeId)) return;

        this.visited.add(nodeId);

        if (node.type === 'end') return;

        // Crear Step para el nodo actual
        const step: Step = {
            id: node.id,
            order: this.stepCounter++,
            actorId: node.actor || 'System', // Default actor
            action: node.label,
            type: node.semanticType || 'SYSTEM_PROCESS',
            semantics: node.semantics
        };

        if (flowId === 'main') {
            this.steps.push(step);
        } else {
            // Añadir a alternative flow
            let altFlow = this.alternativeFlows.find(f => f.id === flowId);
            if (!altFlow) {
                altFlow = {
                    id: flowId,
                    code: `AF-${this.alternativeFlows.length + 1}`,
                    title: `Flujo Alternativo ${this.alternativeFlows.length + 1}`,
                    steps: [],
                    triggerStepId: parentStepId
                };
                this.alternativeFlows.push(altFlow);
            }
            altFlow.steps.push(step);
        }

        // Manejar conexiones salientes
        const outputs = this.connections.filter(c => c.from === nodeId);

        if (node.type === 'decision') {
            // Bifurcación
            // Asumimos que la conexión sin etiqueta o "Sí" es el camino principal (si estamos en main)
            // O continuamos el flujo actual.
            // Las otras son nuevos flujos alternativos.

            const mainPath = outputs.find(c => !c.label || c.label.toLowerCase() === 'sí' || c.label.toLowerCase() === 'yes');
            const altPaths = outputs.filter(c => c !== mainPath);

            if (mainPath) {
                this.traverse(mainPath.to, flowId, node.id); // Continuar flujo actual
            }

            altPaths.forEach((conn) => {
                // Iniciar nuevo flujo alternativo
                // Usamos un ID único para el flujo basado en la conexión
                const newFlowId = `flow_${conn.id}`;

                // El nodo destino de esta rama es el primer paso del flujo alternativo
                // PERO: ¿qué pasa si el nodo destino ya fue visitado? (Ciclos o convergencia)
                // Por simplicidad, si ya fue visitado no lo re-procesamos como nuevo paso,
                // pero en un AST estricto los ciclos se manejan con "GOTO" o repeticiones.
                // Aquí lo ignoramos para evitar recursión infinita simple.
                this.traverse(conn.to, newFlowId, node.id);
            });

        } else {
            // Nodo lineal (Action/Actor)
            if (outputs.length > 0) {
                this.traverse(outputs[0].to, flowId, node.id);
            }
        }
    }
}
