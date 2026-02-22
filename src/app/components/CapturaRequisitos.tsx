import { useState } from 'react';
import { Plus, Trash2, Edit2, Tag, AlertCircle, ChevronDown, X } from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  tags: string[];
  createdAt: string;
}

const priorityColors = {
  Alta: 'bg-red-100 text-red-700 border-red-200',
  Media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Baja: 'bg-green-100 text-green-700 border-green-200',
};

export function RequirementsCapture() {
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      title: 'Sistema de autenticación de usuarios',
      description: 'Implementar un sistema seguro de login con verificación en dos pasos',
      priority: 'Alta',
      tags: ['Seguridad', 'Autenticación'],
      createdAt: '15 Feb 2026',
    },
    {
      id: '2',
      title: 'Dashboard de métricas en tiempo real',
      description: 'Crear un dashboard que muestre métricas actualizadas automáticamente',
      priority: 'Media',
      tags: ['Dashboard', 'Analytics'],
      createdAt: '15 Feb 2026',
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Media' as 'Alta' | 'Media' | 'Baja',
    tags: [] as string[],
  });

  const [currentTag, setCurrentTag] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()],
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Por favor ingresa un título');
      return;
    }

    if (editingId) {
      // Edit existing requirement
      setRequirements(requirements.map((req) =>
        req.id === editingId
          ? {
              ...req,
              ...formData,
            }
          : req
      ));
      setEditingId(null);
    } else {
      // Add new requirement
      const newRequirement: Requirement = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };
      setRequirements([newRequirement, ...requirements]);
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'Media',
      tags: [],
    });
  };

  const handleEdit = (requirement: Requirement) => {
    setFormData({
      title: requirement.title,
      description: requirement.description,
      priority: requirement.priority,
      tags: requirement.tags,
    });
    setEditingId(requirement.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este requisito?')) {
      setRequirements(requirements.filter((req) => req.id !== id));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      priority: 'Media',
      tags: [],
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Captura de Requisitos
        </h1>
        <p className="text-slate-600">
          Define y gestiona los requisitos funcionales y no funcionales del proyecto
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 lg:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingId ? 'Editar Requisito' : 'Nuevo Requisito'}
          </h2>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <X size={16} />
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título del Requisito *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Sistema de autenticación de usuarios"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe detalladamente el requisito..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Prioridad
            </label>
            <div className="relative">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Etiquetas
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Agregar etiqueta"
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Tag size={18} />
                Agregar
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {editingId ? 'Actualizar Requisito' : 'Agregar Requisito'}
          </button>
        </form>
      </div>

      {/* Requirements Table */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Requisitos Agregados
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({requirements.length} {requirements.length === 1 ? 'requisito' : 'requisitos'})
            </span>
          </h2>
        </div>

        {requirements.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No hay requisitos agregados
            </h3>
            <p className="text-slate-500">
              Comienza agregando tu primer requisito usando el formulario de arriba
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Etiquetas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requirements.map((requirement) => (
                  <tr key={requirement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {requirement.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-md line-clamp-2">
                        {requirement.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${priorityColors[requirement.priority]}`}>
                        {requirement.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {requirement.tags.length > 0 ? (
                          requirement.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {requirement.createdAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(requirement)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(requirement.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
