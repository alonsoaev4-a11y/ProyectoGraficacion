import { X, Folder, ShoppingCart, FileText, Info, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';

interface ModalCrearProyectoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
}
// Export the props interface so it can be used elsewhere if needed, or just keep it internal
export type { ModalCrearProyectoProps };

export interface ProjectFormData {
  name: string;
  description: string;
  type: string;
  template: string;
  stack: string[];
  language: string;
}

const templates = [
  { id: 'crud', name: 'CRUD básico', description: 'Sistema básico de gestión', icon: Folder },
  { id: 'ecommerce', name: 'Ecommerce', description: 'Tienda online completa', icon: ShoppingCart },
  { id: 'blog', name: 'Blog', description: 'Plataforma de contenidos', icon: FileText },
];

const stackOptions = [
  { id: 'react', name: 'React', category: 'Frontend' },
  { id: 'vue', name: 'Vue', category: 'Frontend' },
  { id: 'django', name: 'Django', category: 'Backend' },
  { id: 'spring', name: 'Spring', category: 'Backend' },
  { id: 'node', name: 'Node.js', category: 'Backend' },
  { id: 'dotnet', name: '.NET', category: 'Backend' },
];

export function ModalCrearProyecto({ isOpen, onClose, onSubmit }: ModalCrearProyectoProps) {
  const { loadModule } = useWizard();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: 'web',
    template: 'crud',
    stack: [],
    language: 'es',
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Wizard logic: Load "crearProyecto" when open, restore "dashboard" when closed
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        loadModule(WIZARD_CONFIGS.crearProyecto);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      loadModule(WIZARD_CONFIGS.dashboard);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    const newErrors: { [key: string]: boolean } = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.description.trim()) newErrors.description = true;
    if (formData.stack.length === 0) newErrors.stack = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simular loader
    setIsLoading(true);
    setTimeout(() => {
      onSubmit(formData);
      setIsLoading(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'web',
        template: 'crud',
        stack: [],
        language: 'es',
      });
      setErrors({});
      onClose();
    }, 1500);
  };

  const handleStackToggle = (stackId: string) => {
    setFormData({
      ...formData,
      stack: formData.stack.includes(stackId)
        ? formData.stack.filter((s) => s !== stackId)
        : [...formData.stack, stackId],
    });
    setErrors({ ...errors, stack: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="modal-crear-proyecto-content relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 relative bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="text-white" size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">Crear nuevo proyecto</h2>
          <p className="text-purple-100">Completa la información para generar tu proyecto automáticamente</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre del Proyecto */}
          <div data-wizard-target="field-name">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre del proyecto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: false });
              }}
              placeholder="Ej: AnalizaSys — Generador"
              className={`w-full px-4 py-3 rounded-lg border-2 bg-white focus:outline-none transition-all ${errors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">Este campo es obligatorio</p>
            )}
          </div>

          {/* Descripción */}
          <div data-wizard-target="field-description">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción corta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrors({ ...errors, description: false });
              }}
              placeholder="Describe brevemente el propósito del proyecto..."
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-white focus:outline-none transition-all resize-none ${errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">Este campo es obligatorio</p>
            )}
          </div>

          {/* Tipo de Proyecto */}
          <div data-wizard-target="field-type">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de proyecto
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer"
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="microservicio">Microservicio</option>
            </select>
          </div>

          {/* Plantilla */}
          <div data-wizard-target="field-template">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Plantilla
            </label>
            <div className="flex items-start gap-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Puedes elegir una plantilla para acelerar el desarrollo. Esto generará código base automáticamente.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = formData.template === template.id;
                return (
                  <label
                    key={template.id}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={isSelected}
                      onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                        }`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isSelected ? 'text-purple-700' : 'text-slate-900'
                          }`}>
                          {template.name}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Stack Preferido */}
          <div data-wizard-target="field-stack">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Stack preferido <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stackOptions.map((stack) => {
                const isSelected = formData.stack.includes(stack.id);
                return (
                  <label
                    key={stack.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : errors.stack
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStackToggle(stack.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-300 bg-white'
                        }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${isSelected ? 'text-purple-700' : 'text-slate-900'
                          }`}>
                          {stack.name}
                        </div>
                        <div className="text-xs text-slate-500">{stack.category}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.stack && (
              <p className="mt-2 text-sm text-red-600">Selecciona al menos una tecnología</p>
            )}
          </div>

          {/* Lenguaje */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Lenguaje del proyecto
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="es"
                  checked={formData.language === 'es'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-slate-700">Español</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={formData.language === 'en'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-slate-700">English</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-all"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              data-wizard-target="btn-submit-project"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear proyecto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
