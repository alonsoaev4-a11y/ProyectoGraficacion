import { Calendar, Clock, ExternalLink, Trash2, Download } from 'lucide-react';
import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  progress: number;
  color: string;
}

interface TarjetaProyectoProps {
  project: any;
  onClick: () => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function TarjetaProyecto({ project, onClick, onDelete, onExport }: TarjetaProyectoProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="group relative bg-white rounded-xl border border-slate-200 hover:border-purple-400 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
    >
      {/* Color accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${project.color}`}
      />

      {/* Hover Actions */}
      <div
        className={`absolute top-4 right-4 flex gap-2 transition-all duration-300 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="p-2 bg-white hover:bg-purple-50 border border-purple-200 text-purple-600 rounded-lg transition-colors shadow-lg"
          title="Abrir"
        >
          <ExternalLink size={16} />
        </button>
        {onExport && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(project.id);
            }}
            className="p-2 bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 rounded-lg transition-colors shadow-lg"
            title="Exportar"
          >
            <Download size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="p-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-lg transition-colors shadow-lg"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4" onClick={onClick}>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4" onClick={onClick}>
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <span>Progreso</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-slate-500" onClick={onClick}>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{project.createdAt}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{project.lastModified}</span>
        </div>
      </div>
    </div>
  );
}
