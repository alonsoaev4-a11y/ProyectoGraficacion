import { useEffect } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { Play, Settings2, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { ProjectModuleLayout } from '@/components/layout/ProjectModuleLayout';

export const DiagramaFlujoPage = () => {
    const { loadModule } = useWizard();

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.diagramaFlujo);
    }, []);

    return (
        <ProjectModuleLayout
            title="Diagrama de Flujo"
            description="Diseña y valida visualmente la lógica del sistema."
            wizardTarget="flow-header"
            fullHeight={true}
            headerActions={
                <div className="flex gap-3" data-wizard-target="flow-validation">
                    <Button variant="secondary" icon={<Share2 className="w-4 h-4" />}>
                        Compartir
                    </Button>
                    <Button variant="success" icon={<Play className="w-4 h-4 ml-0.5" />}>
                        Validar Lógica
                    </Button>
                </div>
            }
        >
            <div className="relative flex-1 h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm shadow-inner">

                {/* Main Canvas Area */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,217,255,0.02)_0%,_transparent_50%)]" data-wizard-target="flow-canvas" />
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

                {/* Elements placed manually for visual mock */}

                {/* Start Node */}
                <div className="absolute top-32 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing" data-wizard-target="flow-nodo-inicio">
                    <div className="w-48 bg-white border-2 border-green-500/50 rounded-full py-3 px-6 flex flex-col items-center justify-center shadow-md relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-1 shadow-sm" />
                        <span className="font-bold text-green-600 text-sm">Inicio</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">POST /login</span>

                        {/* Connection Line */}
                        <div className="absolute top-full left-1/2 w-0.5 h-20 bg-gray-300 overflow-visible">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-l-2 border-b-2 border-gray-300 -rotate-45" />
                        </div>
                    </div>
                </div>

                {/* Action Node */}
                <div className="absolute top-64 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing" data-wizard-target="flow-nodo-accion">
                    <div className="w-56 cyber-card p-4 relative group hover:border-blue-400 transition-colors bg-white border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-600 uppercase">Acción</span>
                            <Settings2 className="w-3 h-3 text-gray-400 group-hover:text-blue-500 cursor-pointer" />
                        </div>
                        <p className="text-[var(--text-primary)] font-medium text-center">Validar Credenciales</p>

                        {/* Connection Line */}
                        <div className="absolute top-full left-1/2 w-0.5 h-20 bg-gray-300">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-l-2 border-b-2 border-gray-300 -rotate-45" />
                        </div>
                    </div>
                </div>

                {/* Decision Node */}
                <div className="absolute top-[26rem] left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing" data-wizard-target="flow-nodo-decision">
                    <div className="w-32 h-32 rotate-45 bg-white border-2 border-yellow-500/50 flex items-center justify-center z-10 shadow-md">
                        <div className="-rotate-45 text-center">
                            <span className="block text-yellow-600 font-bold text-sm">¿Válido?</span>
                        </div>
                    </div>

                    {/* Branches */}
                    <div className="absolute top-1/2 right-0 translate-x-full w-20 h-0.5 bg-gray-300 -translate-y-1/2">
                        <span className="absolute -top-5 left-2 text-xs text-green-600 font-bold">SI</span>
                    </div>
                    <div className="absolute top-1/2 left-0 -translate-x-full w-20 h-0.5 bg-gray-300 -translate-y-1/2">
                        <span className="absolute -top-5 right-2 text-xs text-red-600 font-bold">NO</span>
                    </div>
                </div>

                {/* Right Sidebar - Properties & Palette */}
                <aside className="absolute top-4 right-4 bottom-4 w-80 cyber-card flex flex-col z-20 overflow-hidden !p-0 bg-white/90 border border-gray-200 shadow-lg">
                    {/* Palette */}
                    <div className="p-6 border-b border-gray-200" data-wizard-target="flow-paleta">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Componentes</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Proceso', color: 'border-blue-500/30 text-blue-600 bg-blue-50' },
                                { label: 'Decisión', color: 'border-yellow-500/30 text-yellow-600 bg-yellow-50' },
                                { label: 'Input/Output', color: 'border-green-500/30 text-green-600 bg-green-50' },
                                { label: 'Database', color: 'border-purple-500/30 text-purple-600 bg-purple-50' },
                                { label: 'API Call', color: 'border-pink-500/30 text-pink-600 bg-pink-50' },
                                { label: 'Delay', color: 'border-gray-500/30 text-gray-600 bg-gray-50' },
                            ].map((item) => (
                                <div key={item.label} className={`border ${item.color} p-3 rounded-lg text-xs font-bold text-center cursor-move hover:shadow-md transition-all shadow-sm`}>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Properties Panel */}
                    <div className="p-6 flex-1 overflow-y-auto flow-properties-panel custom-scrollbar">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Settings2 className="w-4 h-4" /> Propiedades
                        </h3>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs text-[var(--text-secondary)]">Nombre del Nodo</label>
                                <input
                                    type="text"
                                    className="cyber-input w-full bg-white border-gray-200 text-slate-800 focus:border-cyan-500"
                                    defaultValue="Validar Credenciales"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-[var(--text-secondary)]">Tipo de Operación</label>
                                <select className="cyber-select w-full bg-white border-gray-200 text-slate-800 focus:border-cyan-500">
                                    <option>DB Query (Prisma)</option>
                                    <option>Custom Function</option>
                                    <option>External API</option>
                                </select>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                                <p className="text-xs text-yellow-600 mb-2 font-bold">⚠ Atención</p>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Este nodo bloqueará el thread principal hasta completarse. Considera usar async.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </ProjectModuleLayout>
    );
};
