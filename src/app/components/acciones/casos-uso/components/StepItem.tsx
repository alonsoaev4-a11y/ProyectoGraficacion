import { Trash2, User, Code, Database, Globe, MessageSquare, Calculator, CheckCircle2 } from 'lucide-react';
import { Step, Actor, StepType } from '../types';

interface StepItemProps {
    step: Step;
    actors: Actor[];
    isEditing: boolean;
    onUpdate: (id: string, field: keyof Step, val: any) => void;
    onDelete: (id: string) => void;
    compact?: boolean;
}

export function StepItem({ step, actors, isEditing, onUpdate, onDelete, compact }: StepItemProps) {
    const actor = actors.find((a) => a.id === step.actorId);

    const stepTypeIcons: Record<string, any> = {
        'USER_INPUT': MessageSquare,
        'SYSTEM_PROCESS': Calculator,
        'DB_OPERATION': Database,
        'EXTERNAL_CALL': Globe,
        'VALIDATION': CheckCircle2,
        'NOTIFICATION': MessageSquare, // fallback
    };

    const TypeIcon = step.type ? stepTypeIcons[step.type] : Code;

    return (
        <div className={`group relative flex gap-4 ${compact ? 'py-1' : 'py-3'} transition-all`}>

            {/* Actor Avatar / Step Number */}
            <div className="shrink-0 relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm transition-all ${isEditing ? 'bg-white border-purple-200 text-purple-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                    <span className="font-bold text-xs">{step.order}</span>
                </div>
                {/* Connector Line */}
                {!compact && <div className="absolute top-8 bottom-[-12px] w-px bg-slate-200 group-last:hidden"></div>}
            </div>

            {/* Content Card */}
            <div className={`flex-1 min-w-0 rounded-xl border transition-all duration-200 ${isEditing
                    ? 'bg-white border-purple-200 shadow-sm ring-1 ring-purple-100'
                    : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
                } ${compact ? 'p-2' : 'p-4'}`}>

                {isEditing ? (
                    <div className="space-y-4">
                        {/* Header: Actor & Type */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={step.actorId}
                                    onChange={(e) => onUpdate(step.id, 'actorId', e.target.value)}
                                    className="appearance-none pl-8 pr-6 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="">-- Actor --</option>
                                    {actors.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="w-px h-4 bg-slate-200"></div>

                            <div className="relative flex-1">
                                <select
                                    value={step.type || ''}
                                    onChange={(e) => onUpdate(step.id, 'type', e.target.value)}
                                    className="w-full appearance-none pl-8 pr-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="">-- Tipo de Acción (AST) --</option>
                                    <option value="USER_INPUT">Entrada de Usuario (Input)</option>
                                    <option value="SYSTEM_PROCESS">Proceso del Sistema (Cálculo)</option>
                                    <option value="DB_OPERATION">Operación BD (CRUD)</option>
                                    <option value="EXTERNAL_CALL">Llamada Externa (API)</option>
                                    <option value="VALIDATION">Validación (Regla)</option>
                                    <option value="NOTIFICATION">Notificación</option>
                                </select>
                                <TypeIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Description (Legacy/Human Readable) */}
                        <textarea
                            value={step.action}
                            onChange={(e) => onUpdate(step.id, 'action', e.target.value)}
                            className="w-full text-slate-700 text-sm border-0 border-b border-transparent focus:border-purple-200 p-0 focus:ring-0 bg-transparent placeholder-slate-300 resize-none leading-relaxed"
                            placeholder="Describe la acción en lenguaje natural..."
                            rows={1}
                        />

                        {/* Compiler Semantics Form (Only if Type is selected) */}
                        {step.type && (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-2">
                                    <Code size={10} />
                                    <span>Semántica del Compilador</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Verbo / Acción</label>
                                        <input
                                            type="text"
                                            value={step.semantics?.verb || ''}
                                            onChange={(e) => onUpdate(step.id, 'semantics', { ...step.semantics, verb: e.target.value })}
                                            placeholder={step.type === 'DB_OPERATION' ? 'create, update...' : 'calculate, validate...'}
                                            className="w-full text-xs p-1.5 rounded border border-slate-200 focus:border-purple-400 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Entidad / Objetivo</label>
                                        <input
                                            type="text"
                                            value={step.semantics?.targetEntity || ''}
                                            onChange={(e) => onUpdate(step.id, 'semantics', { ...step.semantics, targetEntity: e.target.value })}
                                            placeholder="Student, Order..."
                                            className="w-full text-xs p-1.5 rounded border border-slate-200 focus:border-purple-400 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Inputs based on Type */}
                                {step.type === 'USER_INPUT' && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Campos de Entrada (Separados por coma)</label>
                                        <input
                                            type="text"
                                            placeholder="email:string, password:password..."
                                            className="w-full text-xs p-1.5 rounded border border-slate-200 focus:border-purple-400 focus:outline-none font-mono"
                                            // Simple mock parser for UI demo
                                            onBlur={(e) => {
                                                const raw = e.target.value;
                                                const inputs = raw.split(',').map(s => {
                                                    const [name, type] = s.split(':').map(str => str.trim());
                                                    return { name, type: type || 'string', required: true };
                                                });
                                                onUpdate(step.id, 'semantics', { ...step.semantics, inputs });
                                            }}
                                        />
                                        {step.semantics?.inputs && (
                                            <div className="flex gap-1 flex-wrap mt-1">
                                                {step.semantics.inputs.map((inp, i) => (
                                                    <span key={i} className="text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-600 font-mono">
                                                        {inp.name}:{inp.type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {/* Actor Badge */}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {actor?.name || 'Sistema'}
                            </span>

                            {/* Type Badge */}
                            {step.type && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex items-center gap-1 ${step.type === 'DB_OPERATION' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        step.type === 'USER_INPUT' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    <TypeIcon size={10} />
                                    {step.type.replace('_', ' ')}
                                </span>
                            )}
                        </div>

                        <p className="text-slate-800 text-sm font-medium leading-relaxed">{step.action}</p>

                        {/* Compact Semantics View */}
                        {step.semantics && step.type && (
                            <div className="mt-2 text-xs font-mono text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center gap-2">
                                <span className="text-purple-600 font-bold">{step.semantics.verb}</span>
                                {step.semantics.targetEntity && <span className="text-slate-400">→</span>}
                                {step.semantics.targetEntity && <span className="text-blue-600 font-bold">{step.semantics.targetEntity}</span>}
                                {step.semantics.inputs?.length && (
                                    <span className="text-slate-400 text-[10px]">({step.semantics.inputs.map(i => i.name).join(', ')})</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            {isEditing && (
                <button
                    onClick={() => onDelete(step.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all self-start"
                    title="Eliminar paso"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
}
