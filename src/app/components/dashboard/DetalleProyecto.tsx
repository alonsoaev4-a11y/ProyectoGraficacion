import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Users,
  Workflow,
  Box,
  Settings,
  Zap,
  Target,
  Code,
  History,
  CheckCircle2,
  Edit2,
  Download,
  Share2,
  Play,
  ChevronRight,
  Clock,
  Database,
} from 'lucide-react';
import { EditorRequisitos, Requirement } from '../acciones/requisitos/EditorRequisitos';
import { EditorCasosUso } from '../acciones/casos-uso/EditorCasosUso';
import { UseCase, Catalogs, CatalogItem } from '../acciones/casos-uso/types';
import { EditorDiagramaFlujo } from '../acciones/diagramas/EditorDiagramaFlujo';
import { ModeladorDatos, Table, Relationship } from '../acciones/modelado/ModeladorDatos';
import { GeneradorCodigo } from '../acciones/generacion/GeneradorCodigo';
import { PanelConfiguracion } from '../acciones/configuracion/PanelConfiguracion';
import { RegistroAuditoria } from '../acciones/auditoria/RegistroAuditoria';
import MetadatosPage from '../../../pages/metadatos/MetadatosPage';
import { requirementsApi, useCasesApi, metadataApi } from '../../../lib/api';
import { toast } from 'sonner';

interface DetalleProyectoProps {
  project: any;
  onClose: () => void;
}

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: Target },
  { id: 'metadatos', label: 'Metadatos', icon: Database },
  { id: 'requisitos', label: 'Requisitos', icon: FileText },
  { id: 'casos-de-uso', label: 'Casos de Uso', icon: Users },
  { id: 'flujos', label: 'Flujos', icon: Workflow },
  { id: 'modelado', label: 'Modelado', icon: Box },
  { id: 'generacion', label: 'Generación', icon: Zap },
  { id: 'auditoria', label: 'Auditoría', icon: History },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function DetalleProyecto({ project, onClose }: DetalleProyectoProps) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [requirements, setRequirements] = useState<any[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [metadatos, setMetadatos] = useState<any>(null);
  const [catalogs, setCatalogs] = useState<{
    roles: any[];
    actors: any[];
    businessRules: any[];
    preconditions: any[];
    postconditions: any[];
    exceptions: any[];
  }>({
    roles: [], actors: [], businessRules: [], preconditions: [], postconditions: [], exceptions: []
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Cargar datos reales al abrir el proyecto
  useEffect(() => {
    if (project?.id) {
      loadProjectData(project.id);
    }
  }, [project?.id]);

  const loadProjectData = async (projectId: number) => {
    setIsLoadingData(true);
    try {
      const [reqs, ucs, meta] = await Promise.all([
        requirementsApi.list(projectId),
        useCasesApi.list(projectId),
        metadataApi.get(projectId)
      ]);
      setRequirements(reqs);
      if (meta) setMetadatos(meta);
      
      // Mapear el UseCaseOut del backend al formato que espera el EditorCasosUso
      const mappedUcs: UseCase[] = ucs.map((u: any) => ({
        id: u.id.toString(),
        code: `CU-${u.id}`,
        title: u.title,
        description: u.description || '',
        type: 'Esencial',
        priority: 'media',
        status: 'draft',
        actors: [],
        preconditions: Array.isArray(u.preconditions) ? u.preconditions : [],
        postconditions: Array.isArray(u.postconditions) ? u.postconditions : [],
        businessRules: [],
        steps: u.snapshot?.steps || [],
        alternativeFlows: u.snapshot?.alternativeFlows || [],
        exceptions: u.snapshot?.exceptions || []
      }));
      setUseCases(mappedUcs);
      
      // Si el snapshot trae catálogos, los ponemos
      const firstUcWithCatalogs = ucs.find((u: any) => u.snapshot?.catalogs);
      if (firstUcWithCatalogs) {
          setCatalogs((firstUcWithCatalogs as any).snapshot.catalogs);
      }
      
    } catch (error) {
       toast.error('Error al cargar datos del proyecto');
    } finally {
       setIsLoadingData(false);
    }
  };

  const handleUpdateMetadata = async (data: any) => {
    try {
      if (project?.id) {
        await metadataApi.upsert(project.id, data);
        toast.success('Metadatos guardados automáticamente');
      }
    } catch (e) {
      toast.error('Error al guardar los metadatos');
    }
  };

  const [tables, setTables] = useState<Table[]>([
    {
      id: '1',
      name: 'alumnos',
      position: { x: 100, y: 100 },
      columns: [
        { id: 'f1', name: 'id', type: 'INT', isPk: true, isFk: false, isNullable: false },
        { id: 'f2', name: 'nombre', type: 'VARCHAR(100)', isPk: false, isFk: false, isNullable: false },
        { id: 'f3', name: 'email', type: 'VARCHAR(100)', isPk: false, isFk: false, isNullable: false },
        { id: 'f4', name: 'telefono', type: 'VARCHAR(20)', isPk: false, isFk: false, isNullable: true },
        { id: 'f5', name: 'fecha_registro', type: 'TIMESTAMP', isPk: false, isFk: false, isNullable: false },
      ],
    },
    {
      id: '2',
      name: 'cursos',
      position: { x: 500, y: 100 },
      columns: [
        { id: 'c1', name: 'id', type: 'INT', isPk: true, isFk: false, isNullable: false },
        { id: 'c2', name: 'titulo', type: 'VARCHAR(100)', isPk: false, isFk: false, isNullable: false },
        { id: 'c3', name: 'descripcion', type: 'TEXT', isPk: false, isFk: false, isNullable: true },
        { id: 'c4', name: 'cupo_maximo', type: 'INT', isPk: false, isFk: false, isNullable: false, defaultValue: '30' },
      ],
    },
    {
      id: '3',
      name: 'inscripciones',
      position: { x: 300, y: 350 },
      columns: [
        { id: 'i1', name: 'id', type: 'INT', isPk: true, isFk: false, isNullable: false },
        { id: 'i2', name: 'alumno_id', type: 'INT', isPk: false, isFk: true, isNullable: false, references: { tableId: '1', columnId: 'f1' } },
        { id: 'i3', name: 'curso_id', type: 'INT', isPk: false, isFk: true, isNullable: false, references: { tableId: '2', columnId: 'c1' } },
        { id: 'i4', name: 'fecha_inscripcion', type: 'DATETIME', isPk: false, isFk: false, isNullable: false },
        { id: 'i5', name: 'calificacion', type: 'DECIMAL(4,2)', isPk: false, isFk: false, isNullable: true },
      ],
    },
  ]);

  const [relationships, setRelationships] = useState<Relationship[]>([
    { id: 'r1', fromTable: '3', toTable: '1', type: '1:N' },
    { id: 'r2', fromTable: '3', toTable: '2', type: '1:N' },
  ]);

  const handleGenerateCode = () => {
    setActiveTab('generacion');
  };

  const confirmGenerate = () => {
    alert('Generando código...');
    setShowGenerateModal(false);
  };

  const handleExportZip = () => {
    alert('Descargando proyecto como ZIP...');
  };

  const handleUpdateRequirements = (newReqs: Requirement[]) => {
    setRequirements(newReqs);
  };



  const handleUpdateDataModel = (newTables: Table[], newRelationships: Relationship[]) => {
    setTables(newTables);
    setRelationships(newRelationships);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportZip}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all font-medium"
              >
                <Download size={18} />
                Exportar ZIP
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all font-medium">
                <Share2 size={18} />
                Compartir
              </button>
              <button
                onClick={handleGenerateCode}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/30"
              >
                <Zap size={18} />
                Generar Código
              </button>
            </div>
          </div>

          {/* Project Name & Tags */}
          <div className="flex items-center gap-4">
            {isEditingName ? (
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') setIsEditingName(false);
                }}
                className="text-3xl font-bold text-slate-900 border-b-2 border-purple-500 focus:outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <h1 className="text-3xl font-bold text-slate-900">{projectName}</h1>
            )}
            <button
              onClick={() => setIsEditingName(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit2 size={18} className="text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Web
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              React
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Node.js
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Sidebar - Menu */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-700 hover:bg-white hover:shadow-sm'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'resumen' ? (
            <div className="p-8 max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold mb-4">Resumen del Proyecto</h2>
               {/* Contenido provisorio del resumen */}
               <p className="text-slate-600">
                 {project.description || 'No hay descripción disponible para este proyecto.'}
               </p>
            </div>
          ) : activeTab === 'metadatos' ? (
            <div className="flex-1 overflow-auto bg-[var(--bg-primary)] mt-12">
            <MetadatosPage 
              initialData={metadatos?.data} 
              onDataChange={handleUpdateMetadata} 
            />
          </div>
          ) : activeTab === 'requisitos' ? (
            <EditorRequisitos requirements={requirements} onUpdate={handleUpdateRequirements} />
          ) : activeTab === 'casos-de-uso' ? (
            <EditorCasosUso
              useCases={useCases}
              catalogs={catalogs}
              onUpdate={setUseCases}
              onUpdateCatalogs={setCatalogs}
            />
          ) : activeTab === 'flujos' ? (
            <EditorDiagramaFlujo />
          ) : activeTab === 'modelado' ? (
            <ModeladorDatos tables={tables} relationships={relationships} onUpdate={handleUpdateDataModel} />
          ) : activeTab === 'generacion' ? (
            <GeneradorCodigo
              projectId={project.id}
              requirements={requirements}
              useCases={useCases}
              tables={tables}
              relationships={relationships}
              catalogs={catalogs}
            />
          ) : activeTab === 'auditoria' ? (
            <RegistroAuditoria />
          ) : activeTab === 'configuracion' ? (
            <PanelConfiguracion />
          ) : activeTab === 'resumen' ? (
            <div className="p-6 lg:p-8">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Resumen del Proyecto</h2>

                {/* Info Cards */}
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                  {/* Objetivos */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Target className="text-purple-600" size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900">Objetivos</h3>
                    </div>
                    <p className="text-slate-600">
                      Generar app CRUD para gestión de alumnos con funcionalidades de registro,
                      edición, eliminación y consulta de información estudiantil.
                    </p>
                  </div>

                  {/* Usuario Objetivo */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900">Usuario Objetivo</h3>
                    </div>
                    <p className="text-slate-600">
                      Personal administrativo de instituciones educativas, profesores y coordinadores académicos.
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Code className="text-green-600" size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900">Tech Stack</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">React</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">Node.js</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">PostgreSQL</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">TailwindCSS</span>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Settings className="text-orange-600" size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900">Estado</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Progreso</span>
                        <span className="text-sm font-semibold text-slate-900">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-600"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline de Versiones */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <History size={20} />
                    Historial de Versiones
                  </h3>
                  <div className="space-y-4">
                    {[
                      { version: 'v1.2.0', date: '15 Feb 2026', changes: 'Generación de código completa', status: 'completed' },
                      { version: 'v1.1.0', date: '14 Feb 2026', changes: 'Modelado de datos actualizado', status: 'completed' },
                      { version: 'v1.0.0', date: '13 Feb 2026', changes: 'Requisitos iniciales definidos', status: 'completed' },
                    ].map((version, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-slate-900">{version.version}</h4>
                            <span className="text-sm text-slate-500">{version.date}</span>
                          </div>
                          <p className="text-sm text-slate-600">{version.changes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 lg:p-8">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {menuItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <div className="text-slate-400 mb-3">
                    <FileText size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Sección en desarrollo
                  </h3>
                  <p className="text-slate-600">
                    Esta funcionalidad estará disponible próximamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Activity & Quick Actions (hide on special editor tabs) */}
        {!['requisitos', 'casos-de-uso', 'flujos', 'modelado', 'generacion', 'configuracion', 'auditoria'].includes(activeTab) && (
          <aside className="w-80 border-l border-slate-200 bg-slate-50 overflow-y-auto p-6">
            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleGenerateCode}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all shadow-lg shadow-purple-500/20"
                >
                  <div className="flex items-center gap-2">
                    <Play size={18} />
                    <span className="font-medium">Ejecutar Generación</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={handleExportZip}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Download size={18} />
                    <span className="font-medium">Exportar</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Actividad Reciente
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'Código generado', time: 'Hace 2 horas', icon: Code, color: 'purple' },
                  { action: 'Requisito agregado', time: 'Hace 5 horas', icon: FileText, color: 'blue' },
                  { action: 'Modelado actualizado', time: 'Hace 1 día', icon: Box, color: 'green' },
                  { action: 'Proyecto creado', time: 'Hace 2 días', icon: CheckCircle2, color: 'slate' },
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className={`w-8 h-8 rounded-lg bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={`text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Generate Code Confirmation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGenerateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              ¿Generar código del proyecto?
            </h3>
            <p className="text-slate-600 mb-6">
              Se generará el código completo basado en los requisitos, casos de uso y modelado definidos.
              Este proceso puede tomar algunos minutos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmGenerate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/30"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}