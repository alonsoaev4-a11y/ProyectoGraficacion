
import { useState, useEffect } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { TeamCard } from '@/pages/TeamCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, UserPlus, FolderOpen, Clock, X } from 'lucide-react';

// Mock Data
const mockEquipos = [
    {
        id: '1',
        name: 'Equipo Frontend',
        emoji: '🎨',
        members: [
            { name: 'Alice', email: 'alice@herman.com' },
            { name: 'Bob', email: 'bob@herman.com' },
            { name: 'Charlie', email: 'charlie@herman.com' },
            { name: 'Diana', email: 'diana@herman.com' },
            { name: 'Evan', email: 'evan@herman.com' },
            { name: 'Fiona', email: 'fiona@herman.com' },
        ],
        projects: [
            { id: 'p1', name: 'Dashboard' },
            { id: 'p2', name: 'Landing Page' },
            { id: 'p3', name: 'Design System' },
        ],
        lastActivity: '2h',
        progress: 85,
    },
    {
        id: '2',
        name: 'Equipo Backend',
        emoji: '🚀',
        members: [
            { name: 'George', email: 'george@herman.com' },
            { name: 'Hannah', email: 'hannah@herman.com' },
            { name: 'Ivan', email: 'ivan@herman.com' },
        ],
        projects: [
            { id: 'p4', name: 'API Core' },
            { id: 'p5', name: 'Auth Service' },
        ],
        lastActivity: '5m',
        progress: 60,
    },
    {
        id: '3',
        name: 'Equipo Mobile',
        emoji: '📱',
        members: [
            { name: 'Jack', email: 'jack@herman.com' },
            { name: 'Karen', email: 'karen@herman.com' },
        ],
        projects: [
            { id: 'p6', name: 'iOS App' },
            { id: 'p7', name: 'Android App' },
        ],
        lastActivity: '1d',
        progress: 40,
    },
];

const EquiposInner = () => {
    const { loadModule } = useWizard();
    const [equipos] = useState(mockEquipos);
    const [showCreateModal, setShowCreateModal] = useState(false);
    // const [invitedMembers, setInvitedMembers] = useState<{ email: string }[]>([]);

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.gestionEquipos);
    }, []);

    // Wizard switching logic for modal
    useEffect(() => {
        if (showCreateModal) {
            // Small delay to allow modal animation
            const timer = setTimeout(() => {
                loadModule(WIZARD_CONFIGS.crearEquipo);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            loadModule(WIZARD_CONFIGS.gestionEquipos);
        }
    }, [showCreateModal]);

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic to create team would go here
        setShowCreateModal(false);
        // setInvitedMembers([]);
    };

    return (
        <div className="equipos-container min-h-screen">
            {/* Header con Wizard */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Equipos de Trabajo</h1>
                    <p className="text-[var(--text-secondary)]">Colabora con tu equipo en proyectos de Herman</p>
                </div>
                <div className="flex gap-3">
                    <button
                        data-wizard-target="crear-equipo"
                        className="px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-white font-semibold hover:bg-[var(--accent-cyan)]/90 transition-all flex items-center gap-2 shadow-sm"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <UserPlus size={18} />
                        Nuevo Equipo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="dashboard-card p-4 bg-white border border-gray-200">
                    <Users className="w-8 h-8 text-cyan-500 mb-2" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">3</p>
                    <p className="text-sm text-[var(--text-secondary)]">Equipos Activos</p>
                </div>
                <div className="dashboard-card p-4 bg-white border border-gray-200">
                    <UserPlus className="w-8 h-8 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">24</p>
                    <p className="text-sm text-[var(--text-secondary)]">Miembros Totales</p>
                </div>
                <div className="dashboard-card p-4 bg-white border border-gray-200">
                    <FolderOpen className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">12</p>
                    <p className="text-sm text-[var(--text-secondary)]">Proyectos Compartidos</p>
                </div>
                <div className="dashboard-card p-4 bg-white border border-gray-200">
                    <Clock className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">124h</p>
                    <p className="text-sm text-[var(--text-secondary)]">Tiempo Colaborativo</p>
                </div>
            </div>

            {/* Lista de Equipos */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {equipos.map(equipo => (
                    <TeamCard key={equipo.id} equipo={equipo} />
                ))}
            </div>

            {/* Modal de Crear Equipo */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative dashboard-card max-w-2xl w-full p-6 z-10 bg-white border border-gray-200 shadow-xl"
                            data-wizard-target="modal-crear-equipo"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Crear Nuevo Equipo</h2>
                                <button onClick={() => setShowCreateModal(false)} className="hover:text-red-500 transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                {/* Nombre del equipo */}
                                <div data-wizard-target="campo-nombre-equipo">
                                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                        Nombre del Equipo *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="ej: Equipo Frontend"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] outline-none transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        💡 Usa un nombre descriptivo que identifique el propósito del equipo
                                    </p>
                                </div>

                                {/* Emoji del equipo */}
                                <div data-wizard-target="campo-emoji-equipo">
                                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                        Icono del Equipo
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['🚀', '💻', '🎨', '📱', '⚡', '🔥', '🌟', '🎯'].map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 hover:border-[var(--accent-cyan)] flex items-center justify-center text-xl transition-all hover:scale-110"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div data-wizard-target="campo-descripcion-equipo">
                                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe el propósito y objetivos del equipo"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] outline-none transition-colors"
                                    />
                                </div>

                                {/* Agregar miembros */}
                                <div data-wizard-target="agregar-miembros">
                                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                        Agregar Miembros
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            placeholder="email@ejemplo.com"
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] outline-none transition-colors"
                                        />
                                        <button type="button" className="px-4 py-2 rounded-lg border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors font-medium">
                                            ➕ Invitar
                                        </button>
                                    </div>
                                </div>

                                {/* Permisos del equipo */}
                                <div data-wizard-target="permisos-equipo">
                                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                        Permisos del Equipo
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            { id: 'edit', label: 'Editar proyectos', default: true },
                                            { id: 'delete', label: 'Eliminar proyectos', default: false },
                                            { id: 'invite', label: 'Invitar nuevos miembros', default: true },
                                            { id: 'export', label: 'Exportar código', default: true },
                                        ].map(permission => (
                                            <label key={permission.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200 transition-all">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={permission.default}
                                                    className="w-4 h-4 accent-[var(--accent-cyan)]"
                                                />
                                                <span className="text-[var(--text-primary)] text-sm">{permission.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-[var(--text-secondary)] hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-white font-semibold hover:bg-[var(--accent-cyan)]/90 transition-all shadow-lg shadow-cyan-500/20"
                                    >
                                        ✨ Crear Equipo
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function EquiposPage() {
    return (
        <EquiposInner />
    );
}

