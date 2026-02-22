import { VisualNode, VisualConnection } from './types';

export class FlowValidator {

    public validate(nodes: VisualNode[], connections: VisualConnection[]): string[] {
        const errors: string[] = [];

        // 1. Debe haber un Start y al menos un End
        const startNodes = nodes.filter(n => n.type === 'start');
        const endNodes = nodes.filter(n => n.type === 'end');

        if (startNodes.length === 0) errors.push("El flujo debe tener un nodo de Inicio.");
        if (startNodes.length > 1) errors.push("El flujo solo puede tener un nodo de Inicio.");
        if (endNodes.length === 0) errors.push("El flujo debe tener al menos un nodo de Fin.");

        // 2. Nodos huérfanos (excepto Start que no tiene entradas, y End que no tiene salidas)
        nodes.forEach(node => {
            if (node.type !== 'start') {
                const hasInput = connections.some(c => c.to === node.id);
                if (!hasInput) errors.push(`El nodo '${node.label}' no tiene conexiones de entrada (es inalcanzable).`);
            }

            if (node.type !== 'end') {
                const hasOutput = connections.some(c => c.from === node.id);
                if (!hasOutput) errors.push(`El nodo '${node.label}' no tiene conexiones de salida (camino sin salida).`);
            }
        });

        // 3. Decisiones deben tener al menos 2 salidas
        const decisions = nodes.filter(n => n.type === 'decision');
        decisions.forEach(node => {
            const outputs = connections.filter(c => c.from === node.id);
            if (outputs.length < 2) {
                errors.push(`La decisión '${node.label}' debe tener al menos 2 salidas (ej. Sí/No).`);
            }
        });

        return errors;
    }
}
