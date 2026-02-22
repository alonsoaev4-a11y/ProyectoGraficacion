import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Edit2, ListOrdered, Share2, Plus, Trash2, User, Briefcase, AlertCircle, PlayCircle, ShieldAlert } from 'lucide-react';
import { UseCase, Catalogs, Step, CatalogItem, Actor, AlternativeFlow } from '../types';
import { SectionList } from './SectionList';
import { StepItem } from './StepItem';
import { HelpTooltip } from './HelpTooltip';

interface UseCaseDetailProps {
    useCase: UseCase;
    catalogs: Catalogs;
    onUpdate: (useCase: UseCase) => void;
    onUpdateCatalogs: (catalogs: Catalogs) => void;
    onBack: () => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
}

export function UseCaseDetail({ useCase, catalogs, onUpdate, onUpdateCatalogs, onBack, isEditing, setIsEditing }: UseCaseDetailProps) {
    // Modal States
    const [modalType, setModalType] = useState<'actor' | 'pre' | 'post' | 'rule' | 'exception' | null>(null);

    // Selection State (for adding existing items)
    const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');

    // Creation State (for adding new items)
    const [newItemText, setNewItemText] = useState('');
    const [newItemCode, setNewItemCode] = useState(''); // Only for business rules if needed

    // Actor Modal State
    const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [participationType, setParticipationType] = useState<'initiator' | 'secondary' | 'receiver'>('initiator');
    const [accessScope, setAccessScope] = useState<'own' | 'department' | 'global'>('own');
    const [crudImpact, setCrudImpact] = useState({
        create: false, read: true, update: false, delete: false, execute: false
    });


    // --- Step Management ---
    const handleAddStep = (flowId?: string) => {
        // If flowId is provided, add to alternative flow
        if (flowId) {
            const flowIndex = useCase.alternativeFlows.findIndex(f => f.id === flowId);
            if (flowIndex === -1) return;

            const flow = useCase.alternativeFlows[flowIndex];
            const newStep: Step = {
                id: Date.now().toString(),
                order: flow.steps.length + 1,
                actorId: useCase.actors[0]?.id || '',
                action: '',
            };

            const updatedFlows = [...useCase.alternativeFlows];
            updatedFlows[flowIndex] = { ...flow, steps: [...flow.steps, newStep] };
            onUpdate({ ...useCase, alternativeFlows: updatedFlows });
        } else {
            // Add to main flow
            const newStep: Step = {
                id: Date.now().toString(),
                order: useCase.steps.length + 1,
                actorId: useCase.actors[0]?.id || '',
                action: '',
            };
            onUpdate({ ...useCase, steps: [...useCase.steps, newStep] });
        }
    };

    const handleUpdateStep = (stepId: string, field: keyof Step, value: any, flowId?: string) => {
        if (flowId) {
            const flowIndex = useCase.alternativeFlows.findIndex(f => f.id === flowId);
            if (flowIndex === -1) return;
            const flow = useCase.alternativeFlows[flowIndex];
            const updatedSteps = flow.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s);
            const updatedFlows = [...useCase.alternativeFlows];
            updatedFlows[flowIndex] = { ...flow, steps: updatedSteps };
            onUpdate({ ...useCase, alternativeFlows: updatedFlows });
        } else {
            onUpdate({
                ...useCase,
                steps: useCase.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s)
            });
        }
    };

    const handleDeleteStep = (stepId: string, flowId?: string) => {
        if (flowId) {
            const flowIndex = useCase.alternativeFlows.findIndex(f => f.id === flowId);
            if (flowIndex === -1) return;
            const flow = useCase.alternativeFlows[flowIndex];
            const filtered = flow.steps.filter(s => s.id !== stepId);
            const reordered = filtered.map((s, i) => ({ ...s, order: i + 1 }));
            const updatedFlows = [...useCase.alternativeFlows];
            updatedFlows[flowIndex] = { ...flow, steps: reordered };
            onUpdate({ ...useCase, alternativeFlows: updatedFlows });
        } else {
            const filtered = useCase.steps.filter(s => s.id !== stepId);
            const reordered = filtered.map((s, i) => ({ ...s, order: i + 1 }));
            onUpdate({ ...useCase, steps: reordered });
        }
    };


    // --- Catalog Item Management (Pre, Post, Rules, Exceptions) ---

    const handleAddItem = () => {
        if (!modalType) return;

        // A. Create New
        if (newItemText.trim()) {
            const newItem: any = {
                id: Date.now().toString(),
                description: newItemText,
                code: modalType === 'rule' ? newItemCode : undefined,
                isActive: modalType === 'rule' ? true : undefined
            };

            // Update Global Catalog
            let updatedCatalogs = { ...catalogs };
            if (modalType === 'pre') updatedCatalogs.preconditions = [...catalogs.preconditions, newItem];
            if (modalType === 'post') updatedCatalogs.postconditions = [...catalogs.postconditions, newItem];
            if (modalType === 'rule') updatedCatalogs.businessRules = [...catalogs.businessRules, newItem];
            if (modalType === 'exception') updatedCatalogs.exceptions = [...catalogs.exceptions, newItem];
            onUpdateCatalogs(updatedCatalogs);

            // Update Use Case
            let useCaseUpdates = {};
            if (modalType === 'pre') useCaseUpdates = { preconditions: [...useCase.preconditions, newItem] };
            if (modalType === 'post') useCaseUpdates = { postconditions: [...useCase.postconditions, newItem] };
            if (modalType === 'rule') useCaseUpdates = { businessRules: [...useCase.businessRules, newItem] };
            if (modalType === 'exception') useCaseUpdates = { exceptions: [...useCase.exceptions, newItem] };

            onUpdate({ ...useCase, ...useCaseUpdates });
        }
        // B. Select Existing
        else if (selectedCatalogId) {
            let list: CatalogItem[] = [];
            if (modalType === 'pre') list = catalogs.preconditions;
            if (modalType === 'post') list = catalogs.postconditions;
            if (modalType === 'rule') list = catalogs.businessRules;
            if (modalType === 'exception') list = catalogs.exceptions;

            const selectedItem = list.find(i => i.id === selectedCatalogId);
            if (selectedItem) {
                let useCaseUpdates = {};
                // Prevent duplicates
                if (modalType === 'pre' && !useCase.preconditions.find(i => i.id === selectedItem.id))
                    useCaseUpdates = { preconditions: [...useCase.preconditions, selectedItem] };
                if (modalType === 'post' && !useCase.postconditions.find(i => i.id === selectedItem.id))
                    useCaseUpdates = { postconditions: [...useCase.postconditions, selectedItem] };
                if (modalType === 'rule' && !useCase.businessRules.find(i => i.id === selectedItem.id))
                    useCaseUpdates = { businessRules: [...useCase.businessRules, selectedItem] };
                if (modalType === 'exception' && !useCase.exceptions.find(i => i.id === selectedItem.id))
                    useCaseUpdates = { exceptions: [...useCase.exceptions, selectedItem] };

                onUpdate({ ...useCase, ...useCaseUpdates });
            }
        }

        // Reset
        setNewItemText('');
        setNewItemCode('');
        setSelectedCatalogId('');
        setModalType(null);
    };

    const handleRemoveItem = (index: number, type: 'pre' | 'post' | 'rule' | 'exception') => {
        if (type === 'pre') onUpdate({ ...useCase, preconditions: useCase.preconditions.filter((_, i) => i !== index) });
        if (type === 'post') onUpdate({ ...useCase, postconditions: useCase.postconditions.filter((_, i) => i !== index) });
        if (type === 'rule') onUpdate({ ...useCase, businessRules: useCase.businessRules.filter((_, i) => i !== index) });
        if (type === 'exception') onUpdate({ ...useCase, exceptions: useCase.exceptions.filter((_, i) => i !== index) });
    };


    // --- Actor Management ---

    const handleAddActor = () => {
        let roleIdToLink = selectedCatalogId;
        let roleName = '';

        // 1. If "Create Role" is active, create the SystemRole first
        if (activeTab === 'create' && newItemText && newItemCode) {
            const newRole = {
                id: Date.now().toString(),
                name: newItemText,
                code: newItemCode,
                description: newRoleDescription,
                isSystem: false // Default to false for user-created roles
            };

            // Update Global Catalog
            const updatedCatalogs = { ...catalogs, roles: [...catalogs.roles, newRole] };
            onUpdateCatalogs(updatedCatalogs);

            roleIdToLink = newRole.id;
            roleName = newRole.name;
        } else if (activeTab === 'select' && selectedCatalogId) {
            const selectedRole = catalogs.roles.find(r => r.id === selectedCatalogId);
            if (selectedRole) {
                roleName = selectedRole.name;
            }
        }

        if (roleIdToLink) {
            // 2. Create Actor Participation linked to Role
            const newActor: Actor = {
                id: Date.now().toString(),
                roleId: roleIdToLink,
                name: roleName,
                role: participationType === 'initiator' ? 'primary' : 'secondary', // Legacy mapping
                participationType: participationType,
                accessScope: accessScope,
                crudImpact: crudImpact
            };

            // Check for duplicates
            if (!useCase.actors.find(a => a.roleId === roleIdToLink && a.participationType === participationType)) {
                onUpdate({ ...useCase, actors: [...useCase.actors, newActor] });
            }
        }

        // Reset
        setNewItemText('');
        setNewItemCode('');
        setNewRoleDescription('');
        setSelectedCatalogId('');
        setModalType(null);
        setActiveTab('select');
    };

    const handleRemoveActor = (id: string) => {
        onUpdate({ ...useCase, actors: useCase.actors.filter(a => a.id !== id) });
    };

    // --- Alternative Flows Management ---
    const handleAddFlow = () => {
        const newFlow: AlternativeFlow = {
            id: Date.now().toString(),
            code: `A${useCase.alternativeFlows.length + 1}`,
            title: 'Nuevo Flujo Alternativo',
            steps: []
        };
        onUpdate({ ...useCase, alternativeFlows: [...useCase.alternativeFlows, newFlow] });
    };

    const handleUpdateFlow = (id: string, field: keyof AlternativeFlow, value: any) => {
        onUpdate({
            ...useCase,
            alternativeFlows: useCase.alternativeFlows.map(f => f.id === id ? { ...f, [field]: value } : f)
        });
    };

    const handleDeleteFlow = (id: string) => {
        onUpdate({
            ...useCase,
            alternativeFlows: useCase.alternativeFlows.filter(f => f.id !== id)
        });
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 pb-40">
            {/* Header / Navigation */}
            <div className="flex justify-between items-start">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
                >
                    <ArrowLeft size={18} />
                    <span className="font-medium">Volver a la lista</span>
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border font-medium shadow-sm transition-all ${isEditing
                            ? 'bg-purple-600 border-purple-600 text-white shadow-purple-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-slate-50'
                            }`}
                    >
                        {isEditing ? <CheckCircle2 size={18} /> : <Edit2 size={18} />}
                        {isEditing ? 'Guardar Cambios' : 'Editar Caso de Uso'}
                    </button>
                </div>
            </div>

            {/* Title & Metadata Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${useCase.status === 'approved' ? 'bg-green-100 border-green-200 text-green-700' :
                                        useCase.status === 'review' ? 'bg-amber-100 border-amber-200 text-amber-700' :
                                            'bg-slate-100 border-slate-200 text-slate-600'
                                        }`}>
                                        {isEditing ? (
                                            <select
                                                value={useCase.status}
                                                onChange={(e) => onUpdate({ ...useCase, status: e.target.value as any })}
                                                className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold uppercase"
                                            >
                                                <option value="draft">Borrador</option>
                                                <option value="review">Revisión</option>
                                                <option value="approved">Aprobado</option>
                                            </select>
                                        ) : (
                                            useCase.status === 'approved' ? 'Aprobado' : useCase.status === 'review' ? 'En Revisión' : 'Borrador'
                                        )}
                                    </div>
                                    <div className="h-4 w-[1px] bg-slate-300"></div>
                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400 font-mono text-sm">ID:</span>
                                            <input
                                                type="text"
                                                value={useCase.code}
                                                onChange={(e) => onUpdate({ ...useCase, code: e.target.value })}
                                                className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border-none focus:ring-1 focus:ring-purple-500 w-24 tracking-tight"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-500 font-mono tracking-tight">{useCase.code}</span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={useCase.title}
                                            onChange={(e) => onUpdate({ ...useCase, title: e.target.value })}
                                            className="text-4xl font-extrabold text-slate-900 border-b-2 border-purple-200 focus:border-purple-500 focus:outline-none bg-transparent w-full placeholder-slate-300"
                                            placeholder="Título del Caso de Uso"
                                        />
                                    ) : (
                                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{useCase.title}</h1>
                                    )}

                                    {isEditing ? (
                                        <textarea
                                            value={useCase.description}
                                            onChange={(e) => onUpdate({ ...useCase, description: e.target.value })}
                                            className="w-full text-lg text-slate-600 border rounded-xl p-3 focus:ring-2 focus:ring-purple-500/20 bg-white"
                                            rows={2}
                                            placeholder="Descripción detallada del objetivo..."
                                        />
                                    ) : (
                                        <p className="text-lg text-slate-600 leading-relaxed max-w-4xl">{useCase.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI/Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 bg-white">
                    <div className="p-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                                <AlertCircle size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridad</span>
                        </div>
                        {isEditing ? (
                            <select
                                value={useCase.priority}
                                onChange={(e) => onUpdate({ ...useCase, priority: e.target.value as any })}
                                className="w-full text-base font-semibold text-slate-900 border-none p-0 focus:ring-0 bg-transparent cursor-pointer"
                            >
                                <option value="alta">Alta</option>
                                <option value="media">Media</option>
                                <option value="baja">Baja</option>
                            </select>
                        ) : (
                            <div className="text-base font-bold text-slate-900 capitalize">{useCase.priority}</div>
                        )}
                    </div>

                    <div className="p-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                <ShieldAlert size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nivel</span>
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={useCase.type}
                                onChange={(e) => onUpdate({ ...useCase, type: e.target.value })}
                                className="w-full text-base font-semibold text-slate-900 border-none p-0 focus:ring-0 bg-transparent placeholder-slate-300"
                                placeholder="e.g. Esencial"
                            />
                        ) : (
                            <div className="text-base font-bold text-slate-900">{useCase.type}</div>
                        )}
                    </div>

                    <div className="p-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                                <User size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actores</span>
                        </div>
                        <div className="flex -space-x-3 pt-1">
                            {useCase.actors.length > 0 ? (
                                <>
                                    {useCase.actors.slice(0, 4).map((a, i) => (
                                        <div key={i} title={a.name} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-transparent group-hover:ring-purple-100 transition-all">
                                            {a.name.charAt(0)}
                                        </div>
                                    ))}
                                    {useCase.actors.length > 4 && (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                                            +{useCase.actors.length - 4}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm text-slate-400 italic">Sin actores</span>
                            )}
                        </div>
                    </div>

                    <div className="p-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
                                <ListOrdered size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complejidad</span>
                        </div>
                        <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                            {useCase.steps.length} pasos
                            <span className="text-slate-300 text-xs font-normal">|</span>
                            <span className="text-slate-500 text-sm font-medium">{useCase.alternativeFlows.length} alt.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content (Steps & Alternative Flows) */}
                <div className="col-span-12 lg:col-span-8 space-y-10">

                    {/* Main Flow */}
                    <div className="relative">
                        <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-slate-200"></div>
                        <div className="relative z-10 flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                <span className="font-bold text-2xl">1</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Flujo Principal</h3>
                                <p className="text-slate-500 text-sm">El camino ideal para completar la tarea con éxito.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ml-4 lg:ml-8">
                            <div className="p-2 space-y-2">
                                {useCase.steps.length > 0 ? (
                                    <div className="relative p-4 space-y-4">
                                        {/* Vertical connection line for steps */}
                                        <div className="absolute left-[2.4rem] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>

                                        {useCase.steps.map((step, index) => (
                                            <div key={step.id} className="relative z-10">
                                                <StepItem
                                                    step={step}
                                                    actors={useCase.actors}
                                                    isEditing={isEditing}
                                                    onUpdate={(id, field, val) => handleUpdateStep(id, field, val)}
                                                    onDelete={(id) => handleDeleteStep(id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                            <ListOrdered size={32} />
                                        </div>
                                        <p className="text-slate-900 font-medium text-lg">Sin pasos definidos</p>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Describe paso a paso cómo interactúa el usuario con el sistema.</p>
                                        {isEditing && (
                                            <button
                                                onClick={() => handleAddStep()}
                                                className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 transition-all"
                                            >
                                                Agregar primer paso
                                            </button>
                                        )}
                                    </div>
                                )}

                                {isEditing && useCase.steps.length > 0 && (
                                    <button
                                        onClick={() => handleAddStep()}
                                        className="w-full py-4 border-t border-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-500 transition-colors flex items-center justify-center gap-2 font-semibold text-sm mt-2"
                                    >
                                        <Plus size={18} />
                                        Agregar Siguiente Paso
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Alternative Flows */}
                    <div className="relative pt-6">
                        <div className="absolute left-8 top-14 bottom-0 w-0.5 bg-slate-200"></div>
                        <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                    <Share2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        Flujos Alternativos
                                        <HelpTooltip text="Caminos secundarios donde el resultado es diferente al éxito principal (e.g., 'Usuario Cancelado', 'Error de Validación')." />
                                    </h3>
                                    <p className="text-slate-500 text-sm">Escenarios de error y caminos opcionales.</p>
                                </div>
                            </div>
                            {isEditing && (
                                <button onClick={handleAddFlow} className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 rounded-lg shadow-sm transition-all text-sm font-semibold flex items-center gap-2">
                                    <Plus size={16} />
                                    Nuevo Flujo
                                </button>
                            )}
                        </div>

                        <div className="space-y-6 ml-4 lg:ml-8">
                            {useCase.alternativeFlows.map(flow => (
                                <div key={flow.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:border-blue-300 transition-colors">
                                    {/* Flow Header */}
                                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-start gap-4">
                                        <div className="mt-1">
                                            {isEditing ? (
                                                <input
                                                    value={flow.code}
                                                    onChange={(e) => handleUpdateFlow(flow.id, 'code', e.target.value)}
                                                    className="w-14 text-center text-xs font-black text-blue-600 bg-blue-100/50 py-1 rounded uppercase tracking-wider border-none"
                                                />
                                            ) : (
                                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded uppercase tracking-wider">{flow.code}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <input
                                                        value={flow.title}
                                                        onChange={(e) => handleUpdateFlow(flow.id, 'title', e.target.value)}
                                                        className="w-full font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:ring-purple-500 placeholder-slate-400"
                                                        placeholder="Título del flujo (e.g. Error de conexión)"
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={flow.triggerStepId || ''}
                                                            onChange={(e) => handleUpdateFlow(flow.id, 'triggerStepId', e.target.value)}
                                                            className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 focus:ring-purple-500"
                                                        >
                                                            <option value="">-- Paso de Desvío --</option>
                                                            {useCase.steps.map(s => (
                                                                <option key={s.id} value={s.id}>{s.order}. {s.action.substring(0, 30)}...</option>
                                                            ))}
                                                        </select>

                                                        <select
                                                            value={flow.condition?.type || ''}
                                                            onChange={(e) => handleUpdateFlow(flow.id, 'condition', { ...flow.condition, type: e.target.value })}
                                                            className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 focus:ring-purple-500"
                                                        >
                                                            <option value="">-- Condición --</option>
                                                            <option value="BUSINESS_ERROR">Error de Negocio</option>
                                                            <option value="SYSTEM_ERROR">Fallo de Sistema</option>
                                                            <option value="LOGICAL_BRANCH">Rama Lógica</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{flow.title}</h4>
                                                    {flow.triggerStepId && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 rounded">
                                                                Desvío en paso {useCase.steps.find(s => s.id === flow.triggerStepId)?.order}
                                                            </span>
                                                            {flow.condition?.type && (
                                                                <span className="text-[10px] border border-slate-200 text-slate-500 px-1.5 rounded uppercase">
                                                                    {flow.condition.type.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <button onClick={() => handleDeleteFlow(flow.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Flow Steps */}
                                    <div className="p-4 space-y-2">
                                        {flow.steps.length > 0 ? (
                                            flow.steps.map(step => (
                                                <StepItem
                                                    key={step.id}
                                                    step={step}
                                                    actors={useCase.actors}
                                                    isEditing={isEditing}
                                                    onUpdate={(id, field, val) => handleUpdateStep(id, field, val, flow.id)}
                                                    onDelete={(id) => handleDeleteStep(id, flow.id)}
                                                    compact
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-slate-400 text-sm italic bg-slate-50/30 rounded-lg border border-dashed border-slate-200">
                                                Sin pasos en este flujo alternativo.
                                            </div>
                                        )}

                                        {isEditing && (
                                            <button
                                                onClick={() => handleAddStep(flow.id)}
                                                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 mt-2"
                                            >
                                                <Plus size={14} /> Agregar paso
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {useCase.alternativeFlows.length === 0 && (
                                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                                    <p className="text-slate-500 text-lg font-medium">No hay flujos alternativos</p>
                                    <p className="text-slate-400 text-sm mb-4">¿Todo sale siempre bien? Agrega excepciones o caminos alternos.</p>
                                    {isEditing && (
                                        <button onClick={handleAddFlow} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all">
                                            Crear primer flujo alternativo
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info - Sticky */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 font-bold px-1">
                            <Briefcase size={20} className="text-purple-600" />
                            Contexto y Reglas
                        </div>

                        <SectionList
                            title="Actores del Sistema"
                            icon={User}
                            color="purple"
                            items={useCase.actors}
                            displayField="name"
                            secondaryField="role"
                            helpText="Quienes participan activamente."
                            customRenderer={(item: any) => {
                                // Helper to generate CRUD string
                                const crud = item.crudImpact ?
                                    [
                                        item.crudImpact.create && 'C',
                                        item.crudImpact.read && 'R',
                                        item.crudImpact.update && 'U',
                                        item.crudImpact.delete && 'D',
                                        item.crudImpact.execute && 'E'
                                    ].filter(Boolean).join('') : '';

                                return (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${item.participationType === 'initiator' ? 'bg-purple-100 border-purple-200 text-purple-700' :
                                                item.participationType === 'receiver' ? 'bg-blue-100 border-blue-200 text-blue-700' :
                                                    'bg-slate-100 border-slate-200 text-slate-600'
                                                }`}>
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold text-sm">{item.name}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${item.participationType === 'initiator' ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-600'
                                                        }`}>
                                                        {item.participationType || item.role}
                                                    </span>
                                                    {item.accessScope && (
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                                                            {item.accessScope}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {crud && (
                                            <div className="text-[10px] font-black tracking-widest text-slate-300 uppercase bg-slate-50 px-2 py-1 rounded" title="Permisos: Create, Read, Update, Delete, Execute">
                                                {crud}
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                            onAdd={() => setModalType('actor')}
                            onRemove={(i) => handleRemoveActor(useCase.actors[i].id)}
                            isEditing={isEditing}
                        />

                        <SectionList
                            title="Reglas de Negocio"
                            icon={Briefcase}
                            color="blue"
                            items={useCase.businessRules}
                            displayField="description"
                            secondaryField="code"
                            helpText="Restricciones obligatorias."
                            customRenderer={(item: any) => (
                                <div className="flex gap-3">
                                    <div className="mt-0.5 min-w-[3rem] px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded text-center h-fit">
                                        {item.code}
                                    </div>
                                    <span className="text-slate-600 text-sm leading-snug">{item.description}</span>
                                </div>
                            )}
                            onAdd={() => setModalType('rule')}
                            onRemove={(i) => handleRemoveItem(i, 'rule')}
                            isEditing={isEditing}
                        />

                        <div className="h-px bg-slate-200 my-4"></div>

                        <SectionList
                            title="Precondiciones"
                            icon={PlayCircle}
                            color="amber"
                            items={useCase.preconditions}
                            displayField="description"
                            helpText="Requisitos previos."
                            onAdd={() => setModalType('pre')}
                            onRemove={(i) => handleRemoveItem(i, 'pre')}
                            isEditing={isEditing}
                        />

                        <SectionList
                            title="Postcondiciones"
                            icon={CheckCircle2}
                            color="green"
                            items={useCase.postconditions}
                            displayField="description"
                            helpText="Garantías de éxito."
                            onAdd={() => setModalType('post')}
                            onRemove={(i) => handleRemoveItem(i, 'post')}
                            isEditing={isEditing}
                        />

                        <SectionList
                            title="Excepciones Globales"
                            icon={AlertCircle}
                            color="red"
                            items={useCase.exceptions}
                            displayField="description"
                            helpText="Errores que pueden ocurrir."
                            onAdd={() => setModalType('exception')}
                            onRemove={(i) => handleRemoveItem(i, 'exception')}
                            isEditing={isEditing}
                        />
                    </div>
                </div>
            </div>

            {/* Unified Add Modal */}
            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {modalType === 'actor' && <User className="text-purple-600" size={20} />}
                                {modalType === 'pre' && <PlayCircle className="text-amber-600" size={20} />}
                                {modalType === 'post' && <CheckCircle2 className="text-green-600" size={20} />}
                                {modalType === 'rule' && <Briefcase className="text-blue-600" size={20} />}

                                {modalType === 'actor' ? 'Configurar Actor y Permisos' :
                                    modalType === 'pre' ? 'Agregar Precondición' :
                                        modalType === 'post' ? 'Agregar Postcondición' :
                                            modalType === 'rule' ? 'Definir Regla de Negocio' : 'Registrar Excepción'}
                            </h3>
                            <button onClick={() => { setModalType(null); setSelectedCatalogId(''); setNewItemText(''); }} className="text-slate-400 hover:text-slate-600">
                                <div className="sr-only">Cerrar</div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            {modalType === 'actor' ? (
                                <ActorModalContent
                                    catalogs={catalogs}
                                    selectedCatalogId={selectedCatalogId}
                                    setSelectedCatalogId={setSelectedCatalogId}
                                    newItemText={newItemText}
                                    setNewItemText={setNewItemText}
                                    newRoleCode={newItemCode}
                                    setNewRoleCode={setNewItemCode}
                                    newRoleDescription={newRoleDescription}
                                    setNewRoleDescription={setNewRoleDescription}
                                    participationType={participationType}
                                    setParticipationType={setParticipationType}
                                    accessScope={accessScope}
                                    setAccessScope={setAccessScope}
                                    crudImpact={crudImpact}
                                    setCrudImpact={setCrudImpact}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                />
                            ) : (
                                <>
                                    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm leading-relaxed flex gap-3">
                                        <div className="mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div></div>
                                        <div>
                                            {modalType === 'rule' ? 'Las reglas se guardan en el catálogo global para ser reutilizadas en otros casos de uso.' :
                                                modalType === 'pre' ? 'Define qué debe cumplirse antes de iniciar el caso de uso.' :
                                                    'Puedes crear un nuevo elemento o seleccionar uno existente del catálogo.'}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Standard Catalog Selection */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buscar en Catálogo</label>
                                            <select
                                                value={selectedCatalogId}
                                                onChange={(e) => {
                                                    setSelectedCatalogId(e.target.value);
                                                    if (e.target.value) { setNewItemText(''); setNewItemCode(''); }
                                                }}
                                                className="w-full border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                                            >
                                                <option value="">-- Seleccionar existente --</option>
                                                {modalType === 'pre' && catalogs.preconditions.map(i => <option key={i.id} value={i.id}>{i.description}</option>)}
                                                {modalType === 'post' && catalogs.postconditions.map(i => <option key={i.id} value={i.id}>{i.description}</option>)}
                                                {modalType === 'rule' && catalogs.businessRules.map(i => <option key={i.id} value={i.id}>{i.code} - {i.description}</option>)}
                                                {modalType === 'exception' && catalogs.exceptions.map(i => <option key={i.id} value={i.id}>{i.description}</option>)}
                                            </select>
                                        </div>

                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-slate-100"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-300">
                                                <span className="bg-white px-2">O nuevo</span>
                                            </div>
                                        </div>

                                        {/* Standard Creation Fields */}
                                        <div className="space-y-4">
                                            {modalType === 'rule' && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código</label>
                                                    <input
                                                        type="text"
                                                        value={newItemCode}
                                                        onChange={(e) => { setNewItemCode(e.target.value); if (e.target.value) setSelectedCatalogId(''); }}
                                                        placeholder="e.g., RN-05"
                                                        className="w-full border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-purple-500 shadow-sm"
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</label>
                                                <textarea
                                                    value={newItemText}
                                                    onChange={(e) => { setNewItemText(e.target.value); if (e.target.value) setSelectedCatalogId(''); }}
                                                    className="w-full border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-purple-500 shadow-sm min-h-[100px]"
                                                    placeholder={
                                                        modalType === 'pre' ? "Ej: El usuario debe tener una sesión activa..." :
                                                            modalType === 'post' ? "Ej: Se envía un correo electrónico de confirmación..." :
                                                                "Describe el elemento..."
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                            <button onClick={() => { setModalType(null); setSelectedCatalogId(''); setNewItemText(''); }} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200/50 rounded-xl text-sm font-semibold transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={modalType === 'actor' ? handleAddActor : handleAddItem}
                                disabled={
                                    (modalType === 'actor' && activeTab === 'select' && !selectedCatalogId) ||
                                    (modalType === 'actor' && activeTab === 'create' && (!newItemText || !newItemCode)) ||
                                    (modalType !== 'actor' && !selectedCatalogId && !newItemText)
                                }
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 text-sm font-semibold transition-all transform active:scale-95"
                            >
                                {selectedCatalogId ? 'Vincular' : 'Crear y Vincular'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponent for Actor Modal Content to keep main file clean(er)
function ActorModalContent({ catalogs, selectedCatalogId, setSelectedCatalogId, newItemText, setNewItemText, newRoleCode, setNewRoleCode, newRoleDescription, setNewRoleDescription, participationType, setParticipationType, accessScope, setAccessScope, crudImpact, setCrudImpact, activeTab, setActiveTab }: any) {
    return (
        <div className="space-y-6">

            {/* 1. Role Selection/Creation Tabs */}
            <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1">
                <button
                    onClick={() => setActiveTab('select')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'select' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Seleccionar Rol
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Crear Nuevo Rol
                </button>
            </div>

            {/* 2. Role Identity Inputs */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                {activeTab === 'select' ? (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rol de Sistema</label>
                        <select
                            value={selectedCatalogId}
                            onChange={(e) => {
                                setSelectedCatalogId(e.target.value);
                            }}
                            className="w-full border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        >
                            <option value="">-- Seleccionar --</option>
                            {catalogs.roles.map((r: any) => (
                                <option key={r.id} value={r.id}>
                                    {r.name} ({r.code})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400">Selecciona un rol existente definido en el proyecto.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Rol</label>
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => {
                                        setNewItemText(e.target.value);
                                        // Auto-generate code slug
                                        if (!newRoleCode) {
                                            setNewRoleCode(e.target.value.toUpperCase().replace(/\s+/g, '_').slice(0, 20));
                                        }
                                    }}
                                    placeholder="e.g. Gerente Ventas"
                                    className="w-full border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-purple-500 shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código Técnico</label>
                                <input
                                    type="text"
                                    value={newRoleCode}
                                    onChange={(e) => setNewRoleCode(e.target.value)}
                                    placeholder="e.g. SALES_MGR"
                                    className="w-full border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-600 bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-purple-500 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</label>
                            <textarea
                                value={newRoleDescription}
                                onChange={(e) => setNewRoleDescription(e.target.value)}
                                className="w-full border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-purple-500 shadow-sm"
                                rows={2}
                                placeholder="Responsabilidades generales del rol..."
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Context & Permissions (The "Meat" of the change) */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Contexto en este Caso de Uso</h4>

                <div className="grid grid-cols-2 gap-6">
                    {/* Participation Type */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel de Participación</label>
                        <div className="space-y-2">
                            {[
                                { id: 'initiator', label: 'Iniciador', desc: 'Inicia el proceso' },
                                { id: 'secondary', label: 'Secundario', desc: 'Participa activamente' },
                                { id: 'receiver', label: 'Receptor', desc: 'Recibe información/notificaciones' }
                            ].map((type) => (
                                <label key={type.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${participationType === type.id ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="pType"
                                        checked={participationType === type.id}
                                        onChange={() => setParticipationType(type.id)}
                                        className="mt-1 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-slate-700">{type.label}</div>
                                        <div className="text-xs text-slate-500">{type.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Scope & CRUD */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alcance de Datos</label>
                            <select
                                value={accessScope}
                                onChange={(e) => setAccessScope(e.target.value)}
                                className="w-full border-slate-200 rounded-xl p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 bg-white"
                            >
                                <option value="own">Propios (Solo sus datos)</option>
                                <option value="department">Departamento / Grupo</option>
                                <option value="global">Global (Todo el sistema)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Permisos Implicados</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: 'create', label: 'Create' },
                                    { key: 'read', label: 'Read' },
                                    { key: 'update', label: 'Update' },
                                    { key: 'delete', label: 'Delete' },
                                    { key: 'execute', label: 'Execute' }
                                ].map((perm) => (
                                    <label key={perm.key} className={`flex items-center gap-2 p-2 rounded border cursor-pointer select-none transition-colors ${crudImpact[perm.key] ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={crudImpact[perm.key]}
                                            onChange={(e) => setCrudImpact({ ...crudImpact, [perm.key]: e.target.checked })}
                                            className="rounded text-green-600 focus:ring-green-500 border-slate-300"
                                        />
                                        <span className="text-xs font-bold uppercase">{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

