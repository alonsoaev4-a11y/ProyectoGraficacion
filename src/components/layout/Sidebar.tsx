import { motion } from 'framer-motion';
import {
    Code2,
    LayoutDashboard,
    Settings,
    LogOut,
    FolderOpen,
    Users,
    FileText,
    Database,
    Zap,
    GitMerge,
    Terminal,
    History,
    ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSimulatedAuth } from '@/hooks/useSimulatedAuth';

interface SidebarProps {
    activeModule: string;
    setActiveModule: (module: string) => void;
}

export const Sidebar = ({ activeModule, setActiveModule }: SidebarProps) => {
    const { user, logout } = useSimulatedAuth();

    // List of module IDs that belong to a specific project
    const projectModuleIds = ['requisitos', 'modelado', 'casos-uso', 'diagrama-flujo', 'generacion', 'auditoria', 'metadatos'];

    // Check if we are currently inside a project module
    const isProjectContext = projectModuleIds.includes(activeModule);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Proyectos', icon: FolderOpen },
        { id: 'team', label: 'Equipo', icon: Users },
        // Only show project modules if we are in a project context
        ...(isProjectContext ? [
            { type: 'separator', label: 'Modulos Proyecto' },
            { id: 'metadatos', label: 'Metadatos', icon: ClipboardCheck },
            { id: 'requisitos', label: 'Requisitos', icon: FileText },
            { id: 'modelado', label: 'Modelado', icon: Database },
            { id: 'casos-uso', label: 'Casos de Uso', icon: Zap },
            { id: 'diagrama-flujo', label: 'Diagramas', icon: GitMerge },
            { id: 'generacion', label: 'Generación', icon: Terminal },
            { id: 'auditoria', label: 'Auditoría', icon: History },
        ] : []),
        { type: 'separator', label: 'Sistema' },
        { id: 'settings', label: 'Configuración', icon: Settings },
    ];

    return (
        <nav className="dashboard-sidebar w-64 h-screen sticky top-0 flex flex-col p-4 z-30 overflow-y-auto custom-scrollbar">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg shadow-[var(--accent-cyan)]/20">
                    <Code2 className="w-6 h-6 text-black" />
                </div>
                <span className="text-xl font-bold text-white tracking-wide">Herman</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-1">
                {navItems.map((item, idx) => {
                    if (item.type === 'separator' || !item.icon) {
                        return (
                            <div key={idx} className="px-4 py-2 mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {item.label}
                            </div>
                        );
                    }

                    return (
                        <div
                            key={item.id}
                            onClick={() => setActiveModule(item.id!)}
                            className={cn(
                                "nav-item flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group relative",
                                activeModule === item.id
                                    ? "text-[var(--accent-cyan)] model-active"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {/* Conditional background for active item handled by layoutId if we want, but simple class is often safer for long lists */}
                            {activeModule === item.id && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)]/10 to-transparent rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Icon & Label */}
                            <item.icon className={cn(
                                "w-4 h-4 transition-colors relative z-10",
                                activeModule === item.id ? "text-[var(--accent-cyan)]" : "group-hover:text-white"
                            )} />
                            <span className="font-medium text-sm relative z-10">{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* User Profile */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="dashboard-card p-3 rounded-xl flex items-center gap-3 group hover:border-[var(--accent-cyan)]/30 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-[var(--accent-cyan)] transition-colors">
                            {user?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </nav>
    );
};
