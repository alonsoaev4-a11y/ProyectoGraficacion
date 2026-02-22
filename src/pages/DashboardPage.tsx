import { useState, useEffect } from 'react';
import { Search, Grid, List, Sparkles } from 'lucide-react';
import { TarjetaProyecto } from '@/app/components/dashboard/TarjetaProyecto';
import { ModalCrearProyecto, ProjectFormData } from '@/app/components/dashboard/ModalCrearProyecto';
import { DetalleProyecto } from '@/app/components/dashboard/DetalleProyecto';
import { Toaster, toast } from 'sonner';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { StatsCards } from '@/components/dashboard/StatsCards';
import '@/styles/dashboard.css';

// Mock data for projects
const initialMockProjects = [
    {
        id: '1',
        name: 'Sistema de Gestión Hospitalaria',
        description: 'Plataforma completa para la administración de pacientes, citas médicas y registros clínicos',
        createdAt: '10 Feb 2026',
        lastModified: '2h ago',
        progress: 75,
        color: 'bg-gradient-to-r from-purple-500 to-blue-500',
    },
    {
        id: '2',
        name: 'E-commerce Marketplace',
        description: 'Sistema de comercio electrónico con múltiples vendedores y sistema de pagos integrado',
        createdAt: '08 Feb 2026',
        lastModified: '5h ago',
        progress: 45,
        color: 'bg-gradient-to-r from-purple-600 to-pink-500',
    },
    {
        id: '3',
        name: 'App de Logística',
        description: 'Seguimiento en tiempo real de envíos, gestión de rutas y optimización de entregas',
        createdAt: '05 Feb 2026',
        lastModified: '1d ago',
        progress: 90,
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    {
        id: '4',
        name: 'CRM Empresarial',
        description: 'Sistema de gestión de relaciones con clientes, ventas y análisis de datos',
        createdAt: '03 Feb 2026',
        lastModified: '2d ago',
        progress: 30,
        color: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    },
    {
        id: '5',
        name: 'Plataforma Educativa',
        description: 'LMS con gestión de cursos, evaluaciones y seguimiento de estudiantes',
        createdAt: '01 Feb 2026',
        lastModified: '3d ago',
        progress: 60,
        color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    },
    {
        id: '6',
        name: 'Sistema de Inventario',
        description: 'Control de stock, alertas automáticas y reportes de movimientos',
        createdAt: '28 Ene 2026',
        lastModified: '5d ago',
        progress: 20,
        color: 'bg-gradient-to-r from-purple-500 to-blue-600',
    },
];

function DashboardInner() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState(initialMockProjects);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);

    const { loadModule } = useWizard();

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.dashboard);
    }, []);

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateProject = (formData: ProjectFormData) => {
        const newProject = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            createdAt: 'Hoy',
            lastModified: 'Hace 1 min',
            progress: 0,
            color: 'bg-gradient-to-r from-purple-500 to-blue-600',
            type: formData.type,
            template: formData.template,
            stack: formData.stack,
            language: formData.language,
        };
        setProjects([newProject, ...projects]);

        toast.success(`Proyecto "${formData.name}" creado exitosamente!`, {
            description: 'Click aquí para abrir el proyecto',
            duration: 5000,
            action: {
                label: 'Ver proyecto',
                onClick: () => setSelectedProject(newProject),
            },
        });
    };

    const handleDeleteProject = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este proyecto?')) {
            setProjects(projects.filter((p) => p.id !== id));
        }
    };

    const handleExportProject = (id: string) => {
        const project = projects.find((p) => p.id === id);
        alert(`Exportando proyecto: ${project?.name}`);
    };

    // Show project detail if a project is selected
    if (selectedProject) {
        return (
            <DetalleProyecto
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Section */}
            <StatsCards />

            {/* Header Section */}
            <div className="dashboard-header">
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                    Dashboard
                </h2>
                <p className="text-[var(--text-secondary)]">
                    Bienvenido de nuevo. Aquí tienes un resumen de tus proyectos.
                </p>
            </div>

            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[var(--accent-cyan)] focus:outline-none transition-all text-sm text-[var(--text-primary)] shadow-sm"
                    />
                </div>

                <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'text-gray-500 hover:text-[var(--text-primary)]'}`}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'text-gray-500 hover:text-[var(--text-primary)]'}`}
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="sm:hidden p-2 rounded-md text-gray-500 hover:text-[var(--text-primary)]"
                    >
                        <span className="sr-only">Crear proyecto</span>
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className={`
                    grid gap-6 project-grid pb-20
                    ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}
                `}>
                    {filteredProjects.map((project) => (
                        <TarjetaProyecto
                            key={project.id}
                            project={project}
                            onClick={() => setSelectedProject(project)}
                            onDelete={handleDeleteProject}
                            onExport={handleExportProject}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <div className="p-4 rounded-full bg-white mb-4 shadow-sm border border-gray-100">
                        <Sparkles className="w-8 h-8 text-[var(--accent-cyan)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No se encontraron proyectos</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 px-6 py-2 bg-[var(--accent-cyan)] text-white font-semibold rounded-lg hover:bg-[var(--accent-cyan)]/90 transition-colors shadow-sm"
                    >
                        Crear mi primer proyecto
                    </button>
                </div>
            )}

            <ModalCrearProyecto
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </div>
    );
}

// Plus icon needed for the mobile logic added above
function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}

export default function DashboardPage() {
    return (
        <>
            <Toaster position="top-right" richColors closeButton />
            <DashboardInner />
        </>
    );
}
