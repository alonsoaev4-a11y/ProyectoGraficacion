import { ChevronRight, Bell, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TopBarProps {
    onNewProject: () => void;
}

export const TopBar = ({ onNewProject }: TopBarProps) => {
    return (
        <header className="sticky top-0 z-20 backdrop-blur-md bg-[rgba(10,10,18,0.8)] border-b border-[rgba(0,171,191,0.3)] h-16 px-8 flex items-center justify-between shadow-[0_4px_20px_rgba(0,171,191,0.1)]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <div className="text-[#a0a0b0] hover:text-[#00ffff] cursor-pointer transition-colors" style={{ textShadow: '0 0 5px rgba(0,171,191,0.5)' }}>
                    <Home className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[#a0a0b0]" />
                <span className="text-[#a0a0b0]">Dashboard</span>
                <ChevronRight className="w-4 h-4 text-[#a0a0b0]" />
                <span className="text-[#e0e0e8] font-medium" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>Resumen</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ffff]" style={{ filter: 'drop-shadow(0 0 5px rgba(0,171,191,0.5))' }} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-[rgba(0,171,191,0.05)] border border-[rgba(0,171,191,0.3)] rounded-full pl-9 pr-4 py-1.5 text-sm text-[#e0e0e8] focus:outline-none focus:border-[#00ffff] focus:bg-[rgba(0,171,191,0.1)] transition-all w-64 placeholder-[#a0a0b0]"
                        style={{ boxShadow: 'inset 0 0 10px rgba(0,171,191,0.1)' }}
                    />
                </div>

                <button className="relative text-[#a0a0b0] hover:text-[#00ffff] transition-colors p-2 hover:bg-[rgba(0,171,191,0.1)] rounded-lg" style={{ textShadow: '0 0 5px rgba(0,171,191,0.5)' }}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff003c] rounded-full ring-2 ring-[rgba(10,10,18,0.8)]" style={{ boxShadow: '0 0 10px rgba(255,0,60,0.8)' }} />
                </button>

                <div className="h-6 w-[1px] bg-[rgba(0,171,191,0.3)] mx-2" />

                <Button
                    className="h-9 px-4 bg-[rgba(0,171,191,0.1)] hover:bg-[rgba(0,171,191,0.2)] text-[#00ffff] border border-[rgba(0,171,191,0.5)] shadow-[0_0_15px_rgba(0,171,191,0.3)] transition-all"
                    onClick={onNewProject}
                    style={{ textShadow: '0 0 5px rgba(0,171,191,0.5)' }}
                >
                    + Nuevo Proyecto
                </Button>
            </div>
        </header>
    );
};
