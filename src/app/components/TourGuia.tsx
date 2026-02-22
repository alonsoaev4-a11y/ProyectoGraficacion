import { useState } from 'react';
import {
  Rocket,
  FileText,
  Database,
  Zap,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: 1,
    title: '¡Bienvenido a tu Generador de Software! 🎉',
    description: 'Crea aplicaciones completas en minutos. Vamos a hacer un tour rápido para que conozcas las funcionalidades principales.',
    icon: Rocket,
    color: 'from-purple-600 to-blue-600',
    image: '🚀',
  },
  {
    id: 2,
    title: 'Paso 1: Crea tu Proyecto',
    description: 'Define el nombre, descripción y selecciona una plantilla inicial. Puedes elegir entre CRUD, E-commerce, Blog y más.',
    icon: Sparkles,
    color: 'from-blue-600 to-cyan-600',
    image: '📋',
    cta: 'Cada proyecto puede tener múltiples requisitos, casos de uso y modelos de datos.',
  },
  {
    id: 3,
    title: 'Paso 2: Define Requisitos',
    description: 'Añade requisitos funcionales y no funcionales. Organízalos por prioridad, tipo y estado. También puedes vincular dependencias.',
    icon: FileText,
    color: 'from-cyan-600 to-teal-600',
    image: '📝',
    cta: 'Los requisitos bien definidos son la base de un buen software.',
  },
  {
    id: 4,
    title: 'Paso 3: Modela tus Datos',
    description: 'Crea tablas, define campos y relaciones. El sistema generará automáticamente el código SQL y los modelos.',
    icon: Database,
    color: 'from-teal-600 to-green-600',
    image: '🗄️',
    cta: 'Drag & drop para crear relaciones entre tablas.',
  },
  {
    id: 5,
    title: 'Paso 4: ¡Genera tu Código!',
    description: 'Selecciona tu stack tecnológico, configura opciones y genera tu aplicación completa. Descarga el ZIP o despliega con Docker.',
    icon: Zap,
    color: 'from-green-600 to-purple-600',
    image: '⚡',
    cta: '¡Todo listo para empezar!',
  },
];

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${step.color} p-8 text-white relative`}>
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
          <div className="text-6xl mb-4 text-center">{step.image}</div>
          <h2 className="text-2xl font-bold text-center">{step.title}</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-lg text-slate-700 text-center mb-6">{step.description}</p>
          
          {step.cta && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-purple-900 font-medium text-center flex items-center justify-center gap-2">
                <Sparkles size={18} />
                {step.cta}
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-purple-600'
                      : index < currentStep
                      ? 'w-2 bg-purple-400'
                      : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-slate-500">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold"
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold"
              >
                <CheckCircle2 size={18} />
                ¡Empezar!
              </button>
            )}
          </div>

          {/* Skip */}
          <div className="text-center mt-4">
            <button
              onClick={onSkip}
              className="text-sm text-slate-500 hover:text-slate-700 transition-all"
            >
              Saltar tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
