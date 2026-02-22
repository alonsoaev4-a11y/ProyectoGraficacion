import {
  Plus,
  Search,
  Download,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  Link as LinkIcon,
  AlertCircle,
  Save,
  X,
  GripVertical,
  FileCheck,
  MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Requirement {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'funcional' | 'no-funcional';
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'aprobado' | 'rechazado';
  acceptanceCriteria: string[];
  dependencies: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface EditorRequisitosProps {
  requirements: Requirement[];
  onUpdate: (requirements: Requirement[]) => void;
}

export function EditorRequisitos({ requirements, onUpdate }: EditorRequisitosProps) {
  const { loadModule } = useWizard();
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(requirements[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReq, setEditedReq] = useState<Requirement | null>(null);
  const [showNewReqModal, setShowNewReqModal] = useState(false);

  // Wizard context switching for the modal
  useEffect(() => {
    if (showNewReqModal) {
      const timer = setTimeout(() => {
        loadModule(WIZARD_CONFIGS.modalNuevoRequisito);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      loadModule(WIZARD_CONFIGS.requisitos);
    }
  }, [showNewReqModal]);

  // Filter requirements
  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleSelectReq = (req: Requirement) => {
    setSelectedReq(req);
    setIsEditing(false);
    setEditedReq(null);
  };

  const handleEdit = () => {
    if (selectedReq) {
      setEditedReq({ ...selectedReq });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editedReq) {
      onUpdate(requirements.map((r) => r.id === editedReq.id ? editedReq : r));
      setSelectedReq(editedReq);
      setIsEditing(false);
      setEditedReq(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedReq(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este requisito?')) {
      onUpdate(requirements.filter((r) => r.id !== id));
      if (selectedReq?.id === id) {
        setSelectedReq(null);
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    onUpdate(requirements.map((r) =>
      selectedIds.includes(r.id) ? { ...r, status: 'aprobado' as const } : r
    ));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`¿Eliminar ${selectedIds.length} requisitos seleccionados?`)) {
      onUpdate(requirements.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setSelectedReq(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Código', 'Título', 'Tipo', 'Prioridad', 'Estado', 'Descripción'];
    const rows = requirements.map((r) => [
      r.code,
      r.title,
      r.type,
      r.priority,
      r.status,
      r.description
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requisitos.csv';
    a.click();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'funcional'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-purple-100 text-purple-700 border-purple-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobado': return <CheckCircle className="text-green-600" size={16} />;
      case 'rechazado': return <X className="text-red-600" size={16} />;
      default: return <Circle className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editor de Requisitos</h1>
            <p className="text-slate-600 text-sm mt-1">Gestiona requisitos funcionales y no funcionales</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={handleBulkApprove}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium"
                >
                  <FileCheck size={18} />
                  Aprobar ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
                >
                  <Trash2 size={18} />
                  Eliminar ({selectedIds.length})
                </button>
              </>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all font-medium"
            >
              <Download size={18} />
              Exportar CSV
            </button>
            <button
              onClick={() => setShowNewReqModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/30"
            >
              <Plus size={18} />
              Nuevo Requisito
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar requisitos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">Todos los tipos</option>
            <option value="funcional">Funcional</option>
            <option value="no-funcional">No Funcional</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Requirements List */}
        <div className="w-96 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4">
            <div className="text-sm text-slate-600 mb-3">
              {filteredRequirements.length} requisito{filteredRequirements.length !== 1 ? 's' : ''}
              {selectedIds.length > 0 && ` • ${selectedIds.length} seleccionado${selectedIds.length !== 1 ? 's' : ''}`}
            </div>

            <div className="space-y-2">
              {filteredRequirements.map((req) => (
                <div
                  key={req.id}
                  onClick={() => handleSelectReq(req)}
                  className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedReq?.id === req.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                >
                  {/* Drag Handle */}
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                    <GripVertical size={16} className="text-slate-400" />
                  </div>

                  {/* Checkbox */}
                  <div className="absolute right-3 top-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(req.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(req.id);
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>

                  <div className="pr-8 pl-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(req.status)}
                      <span className="text-xs font-mono text-slate-500">{req.code}</span>
                    </div>

                    <h3 className={`font-semibold mb-2 ${selectedReq?.id === req.id ? 'text-purple-700' : 'text-slate-900'
                      }`}>
                      {req.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {req.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(req.type)}`}>
                        {req.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                      {req.comments.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MessageSquare size={12} />
                          {req.comments.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredRequirements.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-600">No se encontraron requisitos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Requirement Detail */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {selectedReq ? (
            <div className="max-w-4xl">
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Detalle del Requisito</h2>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all font-medium"
                      >
                        <X size={18} className="inline mr-1" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium"
                      >
                        <Save size={18} className="inline mr-1" />
                        Guardar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDelete(selectedReq.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium"
                      >
                        <Edit2 size={18} />
                        Editar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Code & Title */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-sm font-mono text-slate-500 mb-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedReq?.code}
                            onChange={(e) => setEditedReq(editedReq ? { ...editedReq, code: e.target.value } : null)}
                            className="px-2 py-1 border border-slate-300 rounded"
                          />
                        ) : (
                          selectedReq.code
                        )}
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedReq?.title}
                          onChange={(e) => setEditedReq(editedReq ? { ...editedReq, title: e.target.value } : null)}
                          className="text-xl font-bold text-slate-900 w-full px-2 py-1 border border-slate-300 rounded"
                        />
                      ) : (
                        <h3 className="text-xl font-bold text-slate-900">{selectedReq.title}</h3>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedReq.status)}
                      <span className="text-sm font-medium text-slate-600 capitalize">{selectedReq.status}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    {isEditing ? (
                      <>
                        <select
                          value={editedReq?.type}
                          onChange={(e) => setEditedReq(editedReq ? { ...editedReq, type: e.target.value as any } : null)}
                          className="px-3 py-1 rounded border border-slate-300 text-sm"
                        >
                          <option value="funcional">Funcional</option>
                          <option value="no-funcional">No Funcional</option>
                        </select>
                        <select
                          value={editedReq?.priority}
                          onChange={(e) => setEditedReq(editedReq ? { ...editedReq, priority: e.target.value as any } : null)}
                          className="px-3 py-1 rounded border border-slate-300 text-sm"
                        >
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                      </>
                    ) : (
                      <>
                        <span className={`px-3 py-1 rounded text-sm font-medium border ${getTypeColor(selectedReq.type)}`}>
                          {selectedReq.type}
                        </span>
                        <span className={`px-3 py-1 rounded text-sm font-medium border ${getPriorityColor(selectedReq.priority)}`}>
                          Prioridad: {selectedReq.priority}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                    {isEditing ? (
                      <textarea
                        value={editedReq?.description}
                        onChange={(e) => setEditedReq(editedReq ? { ...editedReq, description: e.target.value } : null)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-slate-700">{selectedReq.description}</p>
                    )}
                  </div>
                </div>

                {/* Acceptance Criteria */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    Criterios de Aceptación
                  </h4>
                  <ul className="space-y-2">
                    {(isEditing ? editedReq?.acceptanceCriteria : selectedReq.acceptanceCriteria)?.map((criteria, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <span className="text-xs text-green-700 font-semibold">{index + 1}</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={criteria}
                            onChange={(e) => {
                              if (editedReq) {
                                const newCriteria = [...editedReq.acceptanceCriteria];
                                newCriteria[index] = e.target.value;
                                setEditedReq({ ...editedReq, acceptanceCriteria: newCriteria });
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded"
                          />
                        ) : (
                          <span className="text-slate-700">{criteria}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dependencies */}
                {selectedReq.dependencies.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <LinkIcon size={18} className="text-blue-600" />
                      Dependencias (Linked a Casos de Uso)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReq.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {selectedReq.comments.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <MessageSquare size={18} className="text-purple-600" />
                      Comentarios y Validaciones
                    </h4>
                    <div className="space-y-3">
                      {selectedReq.comments.map((comment) => (
                        <div key={comment.id} className="border-l-4 border-purple-500 pl-4 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-900">{comment.author}</span>
                            <span className="text-xs text-slate-500">{comment.date}</span>
                          </div>
                          <p className="text-slate-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Creado:</span>
                      <span className="ml-2 font-medium text-slate-900">{selectedReq.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Actualizado:</span>
                      <span className="ml-2 font-medium text-slate-900">{selectedReq.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileCheck size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Selecciona un requisito
                </h3>
                <p className="text-slate-600">
                  Haz clic en un requisito de la lista para ver sus detalles
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Requirement Modal */}
      {showNewReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewReqModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full" data-wizard-target="modal-nuevo-requisito">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Nuevo Requisito</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newReq: Requirement = {
                  id: Date.now().toString(),
                  code: `REQ-${String(requirements.length + 1).padStart(3, '0')}`,
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  type: formData.get('type') as any,
                  priority: formData.get('priority') as any,
                  status: 'pendiente',
                  acceptanceCriteria: [],
                  dependencies: [],
                  comments: [],
                  createdAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                  updatedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                };
                onUpdate([...requirements, newReq]);
                setShowNewReqModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Ej: Registrar Alumno"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  data-wizard-target="modal-req-titulo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Describe el requisito..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  data-wizard-target="modal-req-descripcion"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    data-wizard-target="modal-req-tipo"
                  >
                    <option value="funcional">Funcional</option>
                    <option value="no-funcional">No Funcional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prioridad</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    data-wizard-target="modal-req-prioridad"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewReqModal(false)}
                  className="flex-1 px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/30"
                >
                  Crear Requisito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
