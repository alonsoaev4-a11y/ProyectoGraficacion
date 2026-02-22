import { Plus, X } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface SectionListProps {
    title: string;
    icon: any;
    color: string;
    items: any[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    isEditing: boolean;
    customRenderer?: (item: any) => React.ReactNode;
    displayField?: string;
    secondaryField?: string;
    helpText?: string;
}

export function SectionList({
    title,
    icon: Icon,
    color,
    items,
    onAdd,
    onRemove,
    isEditing,
    customRenderer,
    displayField = 'description',
    helpText
}: SectionListProps) {

    // Color mapping for dynamic classes
    const colorClasses: Record<string, string> = {
        purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
        blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
        amber: 'text-amber-600 bg-amber-50 hover:bg-amber-100',
        green: 'text-green-600 bg-green-50 hover:bg-green-100',
        red: 'text-red-600 bg-red-50 hover:bg-red-100',
    };

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-bold text-slate-800 flex items-center gap-2.5 text-sm">
                    <div className={`p-1.5 rounded-lg ${color === 'purple' ? 'bg-purple-100 text-purple-600' : color === 'blue' ? 'bg-blue-100 text-blue-600' : color === 'amber' ? 'bg-amber-100 text-amber-600' : color === 'green' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Icon size={16} strokeWidth={2.5} />
                    </div>
                    {title}
                    {helpText && <HelpTooltip text={helpText} />}
                </h3>
                {isEditing && (
                    <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">{items.length}</span>
                )}
            </div>

            <div className="p-1 flex-1">
                {items.length > 0 ? (
                    <ul className="space-y-1">
                        {items.map((item: any, index: number) => (
                            <li key={index} className="group flex items-start justify-between gap-3 p-2.5 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex-1 min-w-0">
                                    {customRenderer ? customRenderer(item) : (
                                        <span className="text-sm text-slate-600">{displayField ? item[displayField] : item}</span>
                                    )}
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => onRemove(index)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-xs text-slate-400 italic mb-2">No hay elementos.</p>
                    </div>
                )}

            </div>
            {isEditing && (
                <button
                    onClick={onAdd}
                    className={`w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border-t border-slate-50 ${colorClasses[color] || 'text-slate-600 bg-slate-50'}`}
                >
                    <Plus size={14} />
                    Agregar
                </button>
            )}
        </section>
    );
}
