import {
  FileText,
  Users,
  Database,
  Workflow,
  Plus,
  Sparkles,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';

interface EmptyStateProps {
  type: 'requirements' | 'usecases' | 'flows' | 'data-model' | 'projects';
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const configs = {
    requirements: {
      icon: FileText,
      title: 'No hay requisitos aún',
      description: 'Los requisitos son la base de tu proyecto. Define qué debe hacer tu aplicación.',
      illustration: '📋',
      tips: [
        'Define requisitos funcionales y no funcionales',
        'Asigna prioridades y responsables',
        'Vincula dependencias entre requisitos',
      ],
      actionLabel: 'Crear Primer Requisito',
      color: 'blue',
    },
    usecases: {
      icon: Users,
      title: 'No hay casos de uso',
      description: 'Los casos de uso describen cómo los usuarios interactúan con tu sistema.',
      illustration: '👥',
      tips: [
        'Define actores y sus objetivos',
        'Describe el flujo principal paso a paso',
        'Añade flujos alternativos y excepciones',
      ],
      actionLabel: 'Crear Primer Caso de Uso',
      color: 'purple',
    },
    flows: {
      icon: Workflow,
      title: 'No hay diagramas de flujo',
      description: 'Visualiza el flujo de tu aplicación con diagramas interactivos.',
      illustration: '🔄',
      tips: [
        'Usa drag & drop para crear flujos',
        'Conecta nodos con flechas',
        'Exporta como SVG o PNG',
      ],
      actionLabel: 'Crear Primer Flujo',
      color: 'cyan',
    },
    'data-model': {
      icon: Database,
      title: 'No hay modelo de datos',
      description: 'Define la estructura de tu base de datos: tablas, campos y relaciones.',
      illustration: '🗄️',
      tips: [
        'Crea tablas y define campos',
        'Establece relaciones (1:1, 1:N, N:M)',
        'Genera SQL automáticamente',
      ],
      actionLabel: 'Crear Primera Tabla',
      color: 'green',
    },
    projects: {
      icon: Sparkles,
      title: '¡Empieza tu primer proyecto!',
      description: 'Crea un proyecto para comenzar a generar tu aplicación.',
      illustration: '🚀',
      tips: [
        'Elige una plantilla predefinida',
        'Define requisitos y casos de uso',
        'Genera código automáticamente',
      ],
      actionLabel: 'Crear Nuevo Proyecto',
      color: 'purple',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        gradient: 'from-blue-600 to-cyan-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        button: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
      },
      purple: {
        gradient: 'from-purple-600 to-blue-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        button: 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
      },
      cyan: {
        gradient: 'from-cyan-600 to-teal-600',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        text: 'text-cyan-700',
        button: 'from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700',
      },
      green: {
        gradient: 'from-green-600 to-emerald-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        button: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
      },
    };
    return colors[color as keyof typeof colors];
  };

  const colors = getColorClasses(config.color);

  return (
    <div className="flex items-center justify-center min-h-[500px] p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${colors.gradient} text-white text-6xl mb-4 shadow-lg`}>
            {config.illustration}
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-3xl font-bold text-slate-900 mb-3">{config.title}</h2>
        <p className="text-lg text-slate-600 mb-8">{config.description}</p>

        {/* Tips */}
        <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 mb-8`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lightbulb size={20} className={colors.text} />
            <h3 className={`font-semibold ${colors.text}`}>Tips para empezar</h3>
          </div>
          <ul className="space-y-2">
            {config.tips.map((tip, index) => (
              <li key={index} className={`flex items-start gap-3 text-left ${colors.text}`}>
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold text-sm">
                  {index + 1}
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onAction}
          className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${colors.button} text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105`}
        >
          <Plus size={24} />
          {config.actionLabel}
        </button>

        {/* Footer motivation */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500">
          <Sparkles size={16} />
          <p className="text-sm">Cada gran aplicación empieza con una idea simple</p>
        </div>
      </div>
    </div>
  );
}

// Mini empty state para usar dentro de secciones
interface MiniEmptyStateProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}

export function MiniEmptyState({ icon: Icon, title, description, actionLabel, onAction }: MiniEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 max-w-md">{description}</p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium"
      >
        <Plus size={18} />
        {actionLabel}
      </button>
    </div>
  );
}
