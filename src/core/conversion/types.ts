import { StepType, ActionSemantics } from '../../app/components/acciones/casos-uso/types';

// Tipos visuales (re-exportados o adaptados de EditorDiagramaFlujo)
export interface VisualNode {
    id: string;
    type: 'start' | 'action' | 'decision' | 'end' | 'actor';
    label: string;
    actor?: string;
    // Propiedades semánticas añadidas para la conversión
    semanticType?: StepType;
    semantics?: ActionSemantics;
}

export interface VisualConnection {
    id: string;
    from: string;
    to: string;
    label?: string; // "Sí", "No", etc.
}

export interface ConversionResult {
    steps: any[]; // Step[]
    alternativeFlows: any[]; // AlternativeFlow[]
    errors: string[];
}
