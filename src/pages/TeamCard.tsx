import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

interface TeamMember {
    name: string;
    email: string;
    avatar?: string;
}

interface TeamProject {
    id: string;
    name: string;
}

interface Team {
    id: string;
    name: string;
    emoji: string;
    members: TeamMember[];
    projects: TeamProject[];
    lastActivity: string;
    progress: number;
}

interface TeamCardProps {
    equipo: Team;
    onClick?: () => void;
}

export const TeamCard = ({ equipo, onClick }: TeamCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="dashboard-card p-6 cursor-pointer border border-gray-200 hover:border-[var(--accent-cyan)]/50 transition-all bg-white shadow-sm hover:shadow-lg"
            onClick={onClick}
            data-wizard-target="tarjeta-equipo"
        >
            {/* Header con Avatar del equipo */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 text-white">
                    {equipo.emoji}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">{equipo.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{equipo.members.length} miembros</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Proyectos del equipo */}
            <div className="mb-4">
                <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium uppercase tracking-wider">Proyectos Activos</p>
                <div className="flex flex-wrap gap-2">
                    {equipo.projects.slice(0, 3).map(project => (
                        <div
                            key={project.id}
                            className="px-3 py-1 bg-gray-50 rounded-full text-xs text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 font-medium"
                        >
                            {project.name}
                        </div>
                    ))}
                    {equipo.projects.length > 3 && (
                        <span className="px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-400 border border-gray-200">
                            +{equipo.projects.length - 3}
                        </span>
                    )}
                </div>
            </div>

            {/* Avatares de miembros */}
            <div className="flex items-center justify-between mt-6">
                <div className="flex -space-x-2">
                    {equipo.members.slice(0, 5).map((member, idx) => (
                        <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs text-white font-bold border-2 border-white ring-2 ring-gray-100"
                            title={member.name}
                        >
                            {member.name[0]}
                        </div>
                    ))}
                    {equipo.members.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                            +{equipo.members.length - 5}
                        </div>
                    )}
                </div>
                <span className="text-xs text-[var(--text-secondary)] italic">
                    Activo hace {equipo.lastActivity}
                </span>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-[var(--text-secondary)] font-medium">Progreso General</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{equipo.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-green-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${equipo.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>
        </motion.div>
    );
};
