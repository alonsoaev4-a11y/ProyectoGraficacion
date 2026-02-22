import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Plus, X } from 'lucide-react';
import { StepType, ActionSemantics } from '../casos-uso/types';

// Tipos definidos localmente o importados. 
// Idealmente deberían compartirse, pero para este componente aceptamos las props necesarias.

interface FlowPropertyPanelProps {
    node: any; // Usamos any o la interfaz Node del editor si la exportamos
    onChange: (updatedNode: any) => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onClose: () => void;
}

// Mock data for entities
const MOCK_ENTITIES = ['Alumno', 'Profesor', 'Curso', 'Matricula', 'Calificacion', 'Usuario'];

export function FlowPropertyPanel({ node, onChange, onDuplicate, onDelete, onClose }: FlowPropertyPanelProps) {
    const [semantics, setSemantics] = useState<ActionSemantics>(node.semantics || {});
    const [semanticType, setSemanticType] = useState<StepType>(node.semanticType || 'SYSTEM_PROCESS');

    // Sincronizar estado local cuando cambia el nodo seleccionado
    useEffect(() => {
        setSemantics(node.semantics || {});
        setSemanticType(node.semanticType || (node.type === 'decision' ? 'Make Decision' : 'SYSTEM_PROCESS'));
    }, [node.id]);

    const handleUpdate = (updates: any) => {
        const updated = { ...node, ...updates };
        onChange(updated);
    };

    const updateSemantics = (key: keyof ActionSemantics, value: any) => {
        const newSemantics = { ...semantics, [key]: value };
        setSemantics(newSemantics);
        handleUpdate({ semantics: newSemantics });
    };

    const handleTypeChange = (newType: StepType) => {
        setSemanticType(newType);
        handleUpdate({ semanticType: newType });
    };

    // Renderers for specific step types
    const renderDbOperationConfig = () => (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase">Configuración DB</h4>

            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Entidad</label>
                <select
                    value={semantics.targetEntity || ''}
                    onChange={(e) => updateSemantics('targetEntity', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Seleccionar Entidad...</option>
                    {MOCK_ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Operación</label>
                <select
                    value={semantics.verb || ''}
                    onChange={(e) => updateSemantics('verb', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Seleccionar Verbo...</option>
                    <option value="create">Crear (Create)</option>
                    <option value="update">Actualizar (Update)</option>
                    <option value="delete">Eliminar (Delete)</option>
                    <option value="read">Leer (Read)</option>
                </select>
            </div>
        </div>
    );

    const renderUserInputConfig = () => (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase">Campos de Entrada</h4>

            <div className="space-y-2">
                {(semantics.inputs || []).map((input: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={input.name}
                            placeholder="Nombre campo"
                            className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                            onChange={(e) => {
                                const newInputs = [...(semantics.inputs || [])];
                                newInputs[idx] = { ...input, name: e.target.value };
                                updateSemantics('inputs', newInputs);
                            }}
                        />
                        <select
                            value={input.type}
                            className="w-20 px-1 py-1 text-xs border border-slate-300 rounded"
                            onChange={(e) => {
                                const newInputs = [...(semantics.inputs || [])];
                                newInputs[idx] = { ...input, type: e.target.value };
                                updateSemantics('inputs', newInputs);
                            }}
                        >
                            <option value="string">Texto</option>
                            <option value="number">Num</option>
                            <option value="boolean">Bool</option>
                        </select>
                        <button
                            onClick={() => {
                                const newInputs = (semantics.inputs || []).filter((_: any, i: number) => i !== idx);
                                updateSemantics('inputs', newInputs);
                            }}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    const newInputs = [...(semantics.inputs || []), { name: '', type: 'string', required: true }];
                    updateSemantics('inputs', newInputs);
                }}
                className="w-full py-1 flex items-center justify-center gap-1 text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 rounded"
            >
                <Plus size={12} /> Agregar Campo
            </button>
        </div>
    );

    return (
        <aside className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="font-semibold text-slate-900">Propiedades del Nodo</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {/* Basic Properties */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Etiqueta Visual</label>
                    <textarea
                        value={node.label}
                        onChange={(e) => handleUpdate({ label: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                    />
                </div>

                {/* Semantic Type Selector */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Paso (Lógico)</label>
                    <select
                        value={semanticType}
                        onChange={(e) => handleTypeChange(e.target.value as StepType)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                        <option value="USER_INPUT">Entrada de Usuario</option>
                        <option value="DB_OPERATION">Operación Base de Datos</option>
                        <option value="VALIDATION">Validación / Regla de Negocio</option>
                        <option value="SYSTEM_PROCESS">Proceso de Sistema</option>
                        <option value="NOTIFICATION">Notificación (Email/SMS)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Define qué hará el sistema realmente en este paso.</p>
                </div>

                {/* Conditional Configuration based on Semantic Type */}
                {semanticType === 'DB_OPERATION' && renderDbOperationConfig()}
                {semanticType === 'USER_INPUT' && renderUserInputConfig()}

                {/* Actor Configuration (if applicable) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Actor Ejecutor</label>
                    <input
                        type="text"
                        value={node.actor || ''}
                        onChange={(e) => handleUpdate({ actor: e.target.value })}
                        placeholder="Ej: Sistema, Usuario, Admin"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-200 mt-auto flex-shrink-0">
                <button
                    onClick={onDuplicate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all mb-2 text-sm"
                >
                    <Copy size={16} />
                    Duplicar Nodo
                </button>
                <button
                    onClick={onDelete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm"
                >
                    <Trash2 size={16} />
                    Eliminar Nodo
                </button>
            </div>
        </aside>
    );
}
