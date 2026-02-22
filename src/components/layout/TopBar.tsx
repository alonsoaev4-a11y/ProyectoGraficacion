import { ChevronRight, Bell, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TopBarProps {
    onNewProject: () => void;
}

export const TopBar = ({ onNewProject }: TopBarProps) => {
    return (
        <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-gray-200 h-16 px-8 flex items-center justify-between shadow-sm">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <div className="text-gray-500 hover:text-[var(--accent-cyan)] cursor-pointer transition-colors">
                    <Home className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Dashboard</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-slate-900 font-medium">Resumen</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-gray-100 border border-transparent rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-[var(--accent-cyan)] focus:bg-white transition-all w-64 placeholder-gray-400"
                    />
                </div>

                <button className="relative text-gray-500 hover:text-slate-900 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>

                <div className="h-6 w-[1px] bg-gray-200 mx-2" />

                <Button
                    className="h-9 px-4 bg-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/80 text-white border-none shadow-sm"
                    onClick={onNewProject}
                >
                    + Nuevo Proyecto
                </Button>
            </div>
        </header>
    );
};
