import { useState } from 'react';
import { createPortal } from 'react-dom';
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
  ClipboardList,
} from 'lucide-react';
import { EditorRequisitos, Requirement } from '../acciones/requisitos/EditorRequisitos';
import { EditorCasosUso } from '../acciones/casos-uso/EditorCasosUso';
import { UseCase, Catalogs, CatalogItem } from '../acciones/casos-uso/types';
import { EditorDiagramaFlujo } from '../acciones/diagramas/EditorDiagramaFlujo';
import { ModeladorDatos, Table, Relationship } from '../acciones/modelado/ModeladorDatos';
import { GeneradorCodigo } from '../acciones/generacion/GeneradorCodigo';
import { PanelConfiguracion } from '../acciones/configuracion/PanelConfiguracion';
import { RegistroAuditoria } from '../acciones/auditoria/RegistroAuditoria';
import { MetadatosPage } from '@/pages/metadatos/MetadatosPage';

interface DetalleProyectoProps {
  project: any;
  onClose: () => void;
}

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: Target },
  { id: 'metadatos', label: 'Metadatos', icon: ClipboardList },
  { id: 'requisitos', label: 'Requisitos', icon: FileText },
  { id: 'casos-de-uso', label: 'Casos de Uso', icon: Users },
  { id: 'flujos', label: 'Flujos', icon: Workflow },
  { id: 'modelado', label: 'Modelado', icon: Box },
  { id: 'generacion', label: 'Generación', icon: Zap },
  { id: 'auditoria', label: 'Auditoría', icon: History },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

// Sub-pasos del módulo de metadatos para el sidebar
const META_STEPS: { id: string; numero: number; label: string; siempre?: boolean; metodo?: string }[] = [
  { id: 'meta-s1', numero: 1, label: 'Info General', siempre: true },
  { id: 'meta-s2', numero: 2, label: 'Métodos', siempre: true },
  { id: 'meta-s3', numero: 3, label: 'Entrevista', metodo: 'entrevista' },
  { id: 'meta-s4', numero: 4, label: 'Encuesta', metodo: 'encuesta' },
  { id: 'meta-s5', numero: 5, label: 'Historias Usuario', metodo: 'historiasDeUsuario' },
  { id: 'meta-s6', numero: 6, label: 'Observación', metodo: 'observacion' },
  { id: 'meta-s7', numero: 7, label: 'Análisis Doc.', metodo: 'analisisDocumental' },
  { id: 'meta-s8', numero: 8, label: 'Resumen JSON', siempre: true },
];

export function DetalleProyecto({ project, onClose }: DetalleProyectoProps) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  // Estado sincronizado desde MetadatosPage — qué métodos están activos
  const [metodosActivos, setMetodosActivos] = useState<string[]>([]);

  // Lifted State
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      code: 'REQ-001',
      title: 'Registro de Alumnos',
      description: 'El sistema debe permitir registrar nuevos alumnos con sus datos personales y de contacto.',
      type: 'funcional',
      priority: 'alta',
      status: 'aprobado',
      acceptanceCriteria: ['Validar campos obligatorios', 'Email único en el sistema', 'Generar matrícula automáticamente'],
      dependencies: [],
      comments: [],
      createdAt: '15 Feb 2026',
      updatedAt: '15 Feb 2026'
    },
    {
      id: '2',
      code: 'REQ-002',
      title: 'Gestión de Cursos',
      description: 'Los administradores deben poder crear, editar y eliminar cursos académicos.',
      type: 'funcional',
      priority: 'alta',
      status: 'aprobado',
      acceptanceCriteria: ['Nombre de curso único', 'Asignar profesor titular', 'Definir cupo máximo'],
      dependencies: [],
      comments: [],
      createdAt: '15 Feb 2026',
      updatedAt: '15 Feb 2026'
    },
    {
      id: '3',
      code: 'REQ-003',
      title: 'Historial Académico',
      description: 'Consultar el historial de calificaciones y asistencias de un alumno.',
      type: 'funcional',
      priority: 'media',
      status: 'pendiente',
      acceptanceCriteria: ['Ver promedio general', 'Exportar a PDF'],
      dependencies: ['REQ-001', 'REQ-002'],
      comments: [],
      createdAt: '15 Feb 2026',
      updatedAt: '15 Feb 2026'
    },
    {
      id: '4',
      code: 'SEG-001',
      title: 'Autenticación Segura',
      description: 'El acceso al sistema debe requerir autenticación de dos factores para administradores.',
      type: 'no-funcional',
      priority: 'alta',
      status: 'pendiente',
      acceptanceCriteria: ['Contraseñas encriptadas', 'Token de sesión expira en 30min'],
      dependencies: [],
      comments: [],
      createdAt: '15 Feb 2026',
      updatedAt: '15 Feb 2026'
    },
    {
      id: '5',
      code: 'REP-001',
      title: 'Reporte de Inscripciones',
      description: 'Generar reportes mensuales de alumnos inscritos por curso.',
      type: 'funcional',
      priority: 'baja',
      status: 'pendiente',
      acceptanceCriteria: ['Filtros por fecha y curso', 'Formato Excel y PDF'],
      dependencies: ['REQ-002'],
      comments: [],
      createdAt: '15 Feb 2026',
      updatedAt: '15 Feb 2026'
    }
  ]);

  // --- Catalog State ---
  const [catalogs, setCatalogs] = useState<{
    roles: any[];
    actors: any[];
    businessRules: any[];
    preconditions: any[];
    postconditions: any[];
    exceptions: any[];
  }>({
    roles: [
      { id: 'role1', name: 'Secretaria', code: 'SECRETARIA', description: 'Personal administrativo', isSystem: false },
      { id: 'role2', name: 'Alumno', code: 'ALUMNO', description: 'Estudiante registrado', isSystem: false },
      { id: 'role3', name: 'Sistema', code: 'SISTEMA', description: 'El propio sistema', isSystem: true },
      { id: 'role4', name: 'Administrador', code: 'ADMIN', description: 'Acceso total', isSystem: false },
    ],
    actors: [], // Valid but empty, we use Roles now
    businessRules: [
      { id: 'rn1', code: 'RN-01', description: 'Un alumno no puede estar inscrito en más de 5 cursos simultáneos', isActive: true },
      { id: 'rn2', code: 'RN-02', description: 'No se permiten horarios traslapados entre cursos', isActive: true },
      { id: 'rn3', code: 'RN-03', description: 'El alumno debe tener estado "Activo" para inscribirse', isActive: true },
    ],
    preconditions: [
      { id: 'pre1', description: 'El usuario debe estar autenticado en el sistema' },
      { id: 'pre2', description: 'El alumno debe estar registrado previamente' },
      { id: 'pre3', description: 'El curso debe tener cupo disponible' },
    ],
    postconditions: [
      { id: 'post1', description: 'El registro queda guardado en la base de datos' },
      { id: 'post2', description: 'Se envía una notificación de confirmación al usuario' },
      { id: 'post3', description: 'Se actualiza el cupo disponible del curso' },
    ],
    exceptions: [
      { id: 'ex1', description: 'Fallo de conexión con la base de datos' },
      { id: 'ex2', description: 'Datos inválidos o incompletos' },
    ],
  });

  const [useCases, setUseCases] = useState<UseCase[]>([
    {
      id: '1',
      code: 'CU-01',
      title: 'Inscribir alumno en curso',
      description: 'Permitir que la secretaria registre la inscripción de un alumno en un curso disponible.',
      type: 'Esencial',
      priority: 'alta',
      status: 'draft',
      actors: [
        {
          id: 'act1',
          roleId: 'role1',
          name: 'Secretaria',
          role: 'primary',
          participationType: 'initiator',
          accessScope: 'department',
          crudImpact: { create: true, read: true, update: false, delete: false, execute: false }
        },
        {
          id: 'act3',
          roleId: 'role3',
          name: 'Sistema',
          role: 'system',
          participationType: 'receiver',
          accessScope: 'global',
          crudImpact: { create: false, read: true, update: true, delete: false, execute: true }
        },
        {
          id: 'act2',
          roleId: 'role2',
          name: 'Alumno',
          role: 'secondary',
          participationType: 'secondary',
          accessScope: 'own',
          crudImpact: { create: false, read: true, update: false, delete: false, execute: false }
        }
      ],
      preconditions: [
        { id: 'pre1', description: 'El usuario debe estar autenticado en el sistema' },
        { id: 'pre2', description: 'El alumno debe estar registrado previamente' },
        { id: 'pre3', description: 'El curso debe tener cupo disponible' },
      ],
      postconditions: [
        { id: 'post1', description: 'El registro queda guardado en la base de datos' },
        { id: 'post2', description: 'Se envía una notificación de confirmación al usuario' },
        { id: 'post3', description: 'Se actualiza el cupo disponible del curso' },
      ],
      businessRules: [
        { id: 'rn1', code: 'RN-01', description: 'Un alumno no puede estar inscrito en más de 5 cursos simultáneos', isActive: true },
        { id: 'rn2', code: 'RN-02', description: 'No se permiten horarios traslapados entre cursos', isActive: true },
      ],
      steps: [
        { id: '1', order: 1, actorId: 'act1', action: 'Solicita matrícula del alumno' },
        { id: '2', order: 2, actorId: 'act3', action: 'Valida existencia del alumno y muestra datos' },
        { id: '3', order: 3, actorId: 'act1', action: 'Selecciona el curso a inscribir' },
        { id: '4', order: 4, actorId: 'act3', action: 'Verifica disponibilidad de cupo y horarios' },
        { id: '5', order: 5, actorId: 'act3', action: 'Registra la inscripción y genera comprobante' },
        { id: '6', order: 6, actorId: 'act1', action: 'Entrega comprobante al alumno' }
      ],
      alternativeFlows: [
        {
          id: 'alt1',
          code: 'A1',
          title: 'Alumno no encontrado',
          steps: [
            { id: 'a1-1', order: 1, actorId: 'act3', action: 'Muestra mensaje de error: "Alumno no registrado"' },
            { id: 'a1-2', order: 2, actorId: 'act1', action: 'Cancela la operación o procede a registrar al alumno' }
          ]
        },
        {
          id: 'alt2',
          code: 'A2',
          title: 'Curso sin cupo',
          steps: [
            { id: 'a2-1', order: 1, actorId: 'act3', action: 'Notifica que el curso seleccionado no tiene plazas disponibles' },
            { id: 'a2-2', order: 2, actorId: 'act1', action: 'Selecciona otro curso o termina el caso de uso' }
          ]
        }
      ],
      exceptions: [
        { id: 'ex1', description: 'Fallo de conexión con la base de datos' }
      ],
    }
  ]);

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


  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white">
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
                <div key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-slate-700 hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>

                  {/* Sub-pasos de Metadatos — visibles solo cuando Metadatos está activo */}
                  {item.id === 'metadatos' && isActive && (
                    <div style={{ marginTop: '4px', marginLeft: '8px', borderLeft: '2px solid rgba(139,92,246,0.2)', paddingLeft: '8px' }}>
                      {META_STEPS.map(step => {
                        // Ocultar pasos de método si el método no está activo
                        const visible = step.siempre || metodosActivos.includes(step.metodo ?? '');
                        if (!visible) return null;
                        return (
                          <button
                            key={step.id}
                            onClick={() => {
                              const el = document.getElementById(step.id);
                              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              color: '#64748b',
                              textAlign: 'left',
                              transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.07)'; e.currentTarget.style.color = '#7c3aed'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
                          >
                            <span style={{
                              width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                              background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
                              color: 'white', fontSize: '0.65rem', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {step.numero}
                            </span>
                            {step.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Center Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'metadatos' ? (
            <MetadatosPage project={project} onMetodosChange={setMetodosActivos} />
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
        {!['requisitos', 'casos-de-uso', 'flujos', 'modelado', 'generacion', 'configuracion', 'auditoria', 'metadatos'].includes(activeTab) && (
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
    </div>,
    document.body
  );
}