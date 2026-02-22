import { useEffect, useState } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { FileText, Plus, AlertCircle, Check, TrendingUp, Filter, User, Calendar, Link2, MoreVertical, Download } from 'lucide-react';
import { ProjectModuleLayout } from '@/components/layout/ProjectModuleLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

// Mock Data
const MOCK_REQUISITOS = [
    {
        id: 1,
        title: "Autenticación de Usuarios",
        description: "El sistema debe permitir a los usuarios iniciar sesión con email y contraseña, soportando recuperación de cuenta.",
        priority: "alta",
        status: "completado",
        category: "Funcional",
        tags: ["Seguridad", "Login"],
        author: "Alonso",
        createdAt: "12 Oct",
        linkedCases: 3
    },
    {
        id: 2,
        title: "Gestión de Inventario",
        description: "Capacidad para crear, editar y eliminar productos del catálogo, incluyendo gestión de precios y stock.",
        priority: "media",
        status: "en-progreso",
        category: "Funcional",
        tags: ["Catálogo", "Admin"],
        author: "Alonso",
        createdAt: "14 Oct",
        linkedCases: 2
    },
    {
        id: 3,
        title: "Reporte de Ventas Mensual",
        description: "Generar automáticamente un PDF con el resumen de ventas al final de cada mes.",
        priority: "baja",
        status: "pendiente",
        category: "Reportes",
        tags: ["Analytics", "PDF"],
        author: "Sistema",
        createdAt: "15 Oct",
        linkedCases: 0
    }
];

export const RequisitosPage = () => {
    const { loadModule } = useWizard();
    const [requisitos] = useState(MOCK_REQUISITOS);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.requisitos);
    }, []);

    const handleEdit = (id: number) => {
        console.log("Edit req", id);
    };

    return (
        <ProjectModuleLayout
            title="Requisitos del Proyecto"
            description="Define las necesidades funcionales y no funcionales de tu aplicación para guiar el desarrollo."
            wizardTarget="req-header"
            headerActions={
                <>
                    <Button
                        variant="ghost"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => { }}
                        wizardTarget="btn-exportar-csv"
                    >
                        Exportar CSV
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<Filter className="w-4 h-4" />}
                        onClick={() => setShowFilters(!showFilters)}
                        wizardTarget="req-filtros"
                    >
                        Filtros
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => { }}
                        wizardTarget="btn-nuevo-requisito"
                    >
                        Nuevo Requisito
                    </Button>
                </>
            }
        >
            {/* Stats rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <GlassCard hoverable className="bg-white border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">{requisitos.length}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Total Requisitos</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 flex items-center justify-center shadow-sm">
                            <FileText className="w-6 h-6 text-cyan-600" />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard hoverable className="bg-white border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-red-500 mb-1">
                                {requisitos.filter(r => r.priority === 'alta').length}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">Prioridad Alta</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center shadow-sm">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard hoverable className="bg-white border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-green-500 mb-1">
                                {requisitos.filter(r => r.status === 'completado').length}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">Completados</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center shadow-sm">
                            <Check className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard hoverable className="bg-white border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-purple-600 mb-1">33%</p>
                            <p className="text-sm text-[var(--text-secondary)]">Progreso</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Wizard hidden targets */}
            <div className="hidden">
                <div data-wizard-target="req-field-title"></div>
                <div data-wizard-target="req-field-priority"></div>
            </div>

            {/* Panel de detalle (placeholder para wizard) */}
            <div data-wizard-target="req-detalle" className="hidden lg:block">
                <GlassCard className="p-6 text-center text-[var(--text-secondary)] bg-white border-gray-200">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Selecciona un requisito para ver su detalle</p>
                </GlassCard>
            </div>

            {/* Lista de requisitos */}
            <div className="space-y-4" data-wizard-target="req-lista">
                {requisitos.map((req, index) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <RequisitoCard requisito={req} onEdit={() => handleEdit(req.id)} />
                    </motion.div>
                ))}

                {/* Placeholder para demo del wizard si es necesario mostrar cómo añadir */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] hover:opacity-100 transition-all cursor-pointer group bg-white/50"
                    data-wizard-target="btn-new-requisito-placeholder"
                >
                    <Plus className="w-8 h-8 mb-2 group-hover:text-[var(--accent-cyan)] transition-colors" />
                    <span>Añadir nuevo requisito</span>
                </motion.div>
            </div>
        </ProjectModuleLayout>
    );
};

// Card de requisito individual
const RequisitoCard = ({ requisito, onEdit }: { requisito: typeof MOCK_REQUISITOS[0], onEdit: () => void }) => (
    <GlassCard hoverable onClick={onEdit} className="group relative overflow-hidden bg-white border-gray-200">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-cyan)]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

        <div className="flex items-start gap-5 relative z-10">
            {/* Indicador de prioridad */}
            <div className={`
                w-1.5 self-stretch rounded-full my-1 shadow-sm
                ${requisito.priority === 'alta' ? 'bg-red-500' :
                    requisito.priority === 'media' ? 'bg-yellow-500' :
                        'bg-green-500'}
            `} />

            {/* Contenido */}
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-mono text-[var(--text-secondary)]">REQ-{100 + requisito.id}</span>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                                {requisito.title}
                            </h3>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 max-w-3xl">
                            {requisito.description}
                        </p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="cyber-badge cyber-badge-funcional">
                        {requisito.category}
                    </span>
                    {requisito.tags.map(tag => (
                        <span key={tag} className="cyber-badge cyber-badge-nofuncional">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-6 text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {requisito.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {requisito.createdAt}
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-[var(--accent-cyan)] transition-colors cursor-pointer">
                            <Link2 className="w-3.5 h-3.5" />
                            {requisito.linkedCases} casos de uso
                        </span>
                    </div>
                    <span className={`
                            cyber-badge
                            ${requisito.status === 'completado' ? 'cyber-badge-aprobado' :
                            requisito.status === 'en-progreso' ? 'cyber-badge-pendiente' :
                                'cyber-badge-baja'}
                        `}>
                        {requisito.status}
                    </span>
                </div>
            </div>
        </div>
    </GlassCard>
);
