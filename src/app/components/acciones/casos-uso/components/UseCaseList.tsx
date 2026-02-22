import { Plus, Trash2, BookOpen } from 'lucide-react';
import { UseCase } from '../types';

interface UseCaseListProps {
    useCases: UseCase[];
    selectedUseCaseId: string | null;
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export function UseCaseList({ useCases, selectedUseCaseId, onSelect, onCreate, onDelete }: UseCaseListProps) {
    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Casos de Uso</h2>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus size={18} />
                    Nuevo Caso de Uso
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {useCases.map(uc => (
                    <div
                        key={uc.id}
                        onClick={() => onSelect(uc.id)}
                        className="bg-white p-5 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                {uc.code}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={(e) => onDelete(uc.id, e)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 truncate">{uc.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                            {uc.description || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className={`px-2 py-0.5 rounded-full border ${uc.priority === 'alta' ? 'bg-red-50 border-red-200 text-red-700' :
                                uc.priority === 'media' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                    'bg-green-50 border-green-200 text-green-700'
                                }`}>
                                {uc.priority.charAt(0).toUpperCase() + uc.priority.slice(1)}
                            </span>
                            <span>•</span>
                            <span>{uc.steps.length} pasos</span>
                        </div>
                    </div>
                ))}

                {useCases.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="text-slate-400" size={24} />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">No hay casos de uso</h3>
                        <p className="text-slate-500 text-sm">Comienza creando el primer caso de uso para tu proyecto.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
