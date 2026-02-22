import { useEffect, useState } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { History, Search, RotateCcw, Filter, Calendar, User, FileText, Database, Terminal, GitMerge, Zap } from 'lucide-react';
import { ProjectModuleLayout } from '@/components/layout/ProjectModuleLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

const MOCK_LOGS = [
    { id: 1, user: 'Alonso', action: 'Modificó el Schema (User table)', module: 'Modelado', time: 'Hace 5 min', type: 'update', icon: Database },
    { id: 2, user: 'Herman bot', action: 'Generación de código completada', module: 'Generación', time: 'Hace 1 hora', type: 'system', icon: Terminal },
    { id: 3, user: 'Alonso', action: 'Creó nuevo Requisito #104', module: 'Requisitos', time: 'Hace 3 horas', type: 'create', icon: FileText },
    { id: 4, user: 'Alonso', action: 'Actualizó Flujo de Login', module: 'Diagramas', time: 'Ayer', type: 'update', icon: GitMerge },
    { id: 5, user: 'Alonso', action: 'Eliminó Caso de Uso #99', module: 'Casos de Uso', time: 'Ayer', type: 'delete', icon: Zap },
];

export const AuditoriaPage = () => {
    const { loadModule } = useWizard();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.auditoria);
    }, []);

    return (
        <ProjectModuleLayout
            title="Auditoría del Proyecto"
            description="Historial inmutable de todas las acciones y cambios realizados en el proyecto."
            wizardTarget="auditoria-header"
            headerActions={
                <Button
                    variant="danger"
                    icon={<RotateCcw className="w-4 h-4" />}
                    wizardTarget="btn-rollback"
                >
                    Restaurar Versión
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Filters Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-6 sticky top-6 bg-white border-gray-200" data-wizard-target="aud-filtros">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-[var(--accent-cyan)]" /> Filtros
                        </h3>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="cyber-input w-full pl-10 pr-4 bg-white border-gray-200 text-slate-800 focus:border-cyan-500 placeholder:text-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Módulo</label>
                                <select className="cyber-select w-full bg-white border-gray-200 text-slate-800 focus:border-cyan-500">
                                    <option>Todos</option>
                                    <option>Requisitos</option>
                                    <option>Modelado</option>
                                    <option>Generación</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Usuario</label>
                                <select className="cyber-select w-full bg-white border-gray-200 text-slate-800 focus:border-cyan-500">
                                    <option>Todos</option>
                                    <option>Alonso</option>
                                    <option>System</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Fecha</label>
                                <select className="cyber-select w-full bg-white border-gray-200 text-slate-800 focus:border-cyan-500">
                                    <option>Últimos 7 días</option>
                                    <option>Este mes</option>
                                    <option>Rango personalizado</option>
                                </select>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-3">
                    <div className="relative pl-8 border-l border-gray-200 space-y-8" data-wizard-target="aud-timeline">
                        {MOCK_LOGS.map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                {/* Timeline Dot */}
                                <div className={`
                                    absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 border-white 
                                    ${log.type === 'create' ? 'bg-green-500' :
                                        log.type === 'update' ? 'bg-blue-500' :
                                            log.type === 'delete' ? 'bg-red-500' : 'bg-purple-500'}
                                    group-hover:scale-125 transition-transform shadow-sm
                                `} />

                                <GlassCard hoverable className="relative overflow-hidden bg-white border-gray-200">
                                    {/* Background Icon Watermark */}
                                    {log.icon && (
                                        <log.icon className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-100 -rotate-12 pointer-events-none" />
                                    )}

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg bg-gray-50 border border-gray-200 group-hover:border-[var(--accent-cyan)] transition-colors`}>
                                                <log.icon className="w-6 h-6 text-slate-400 group-hover:text-[var(--accent-cyan)] transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                                                    {log.action}
                                                </h4>
                                                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mt-1">
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                                                        <User className="w-3 h-3 text-slate-500" /> {log.user}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                                                        <History className="w-3 h-3 text-slate-500" /> {log.module}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                            <Calendar className="w-3 h-3" />
                                            {log.time}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Button variant="ghost" className="text-xs mx-auto text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            Cargar más actividad...
                        </Button>
                    </div>
                </div>
            </div>
        </ProjectModuleLayout>
    );
};
