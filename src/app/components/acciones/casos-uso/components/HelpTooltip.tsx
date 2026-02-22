import { HelpCircle } from 'lucide-react';

export function HelpTooltip({ text }: { text: string }) {
    return (
        <div className="group relative inline-flex items-center ml-2 z-10">
            <div className="cursor-help text-slate-400 hover:text-purple-600 transition-colors">
                <HelpCircle size={14} />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center font-normal tracking-wide">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
        </div>
    );
}
