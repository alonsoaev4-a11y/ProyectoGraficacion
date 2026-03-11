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
        <nav className="dashboard-sidebar w-64 h-screen sticky top-0 flex flex-col p-4 z-30 overflow-y-auto custom-scrollbar bg-[rgba(10,10,18,0.95)] border-r border-[rgba(0,171,191,0.3)] shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#9d22e6] flex items-center justify-center shadow-[0_0_15px_rgba(0,171,191,0.5)] border border-[rgba(255,255,255,0.2)]">
                    <Code2 className="w-6 h-6 text-[#0a0a12]" />
                </div>
                <span className="text-xl font-bold text-[#e0e0e8] tracking-wide" style={{ textShadow: '0 0 10px rgba(0,171,191,0.5)' }}>Herman</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-1">
                {navItems.map((item, idx) => {
                    if (item.type === 'separator' || !item.icon) {
                        return (
                            <div key={idx} className="px-4 py-2 mt-4 text-xs font-bold text-[#00ffff]/70 uppercase tracking-wider" style={{ textShadow: '0 0 5px rgba(0,171,191,0.3)' }}>
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
                                    ? "text-[#00ffff] model-active border border-[rgba(0,171,191,0.5)] shadow-[inset_0_0_10px_rgba(0,171,191,0.2)]"
                                    : "text-[#a0a0b0] hover:text-[#e0e0e8] hover:bg-[rgba(0,171,191,0.1)] hover:border hover:border-[rgba(0,171,191,0.3)] border border-transparent"
                            )}
                        >
                            {/* Conditional background for active item handled by layoutId if we want, but simple class is often safer for long lists */}
                            {activeModule === item.id && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-gradient-to-r from-[rgba(0,171,191,0.2)] to-transparent rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Icon & Label */}
                            <item.icon className={cn(
                                "w-4 h-4 transition-colors relative z-10",
                                activeModule === item.id ? "text-[#00ffff]" : "group-hover:text-[#00ffff]"
                            )} style={activeModule === item.id || "group-hover" ? { filter: 'drop-shadow(0 0 5px rgba(0,171,191,0.5))' } : {}} />
                            <span className="font-bold text-sm relative z-10" style={activeModule === item.id ? { textShadow: '0 0 5px rgba(0,171,191,0.5)' } : {}}>{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* User Profile */}
            <div className="mt-4 pt-4 border-t border-[rgba(0,171,191,0.3)]">
                <div className="dashboard-card p-3 rounded-xl flex items-center gap-3 group hover:border-[#00ffff] transition-colors cursor-pointer bg-[rgba(10,10,18,0.6)] border border-[rgba(0,171,191,0.2)] shadow-[inset_0_0_10px_rgba(0,171,191,0.05)]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9d22e6] to-[#00ffff] flex-shrink-0 flex items-center justify-center text-[#0a0a12] font-bold text-lg shadow-[0_0_10px_rgba(0,171,191,0.5)]">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#e0e0e8] truncate group-hover:text-[#00ffff] transition-colors" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                            {user?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-[#a0a0b0] truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-[#a0a0b0] hover:text-[#ff003c] transition-colors p-1.5 hover:bg-[rgba(255,0,60,0.1)] rounded-lg"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 2px rgba(255,0,60,0.5))' }} />
                    </button>
                </div>
            </div>
        </nav>
    );
};
