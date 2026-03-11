import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsApi, Project } from '../lib/api';
import { ModalCrearProyecto } from '../app/components/dashboard/ModalCrearProyecto';
import { DetalleProyecto } from '../app/components/dashboard/DetalleProyecto';
import { Sidebar } from '../app/components/layout/sidebar/BarraLateral';
import { Toaster, toast } from 'sonner';
import {
  Plus, Search, LayoutGrid, List, Sparkles, LogOut,
  Clock, CheckCircle2, Archive, FolderOpen, Settings, Users,
  BarChart3, Brain, Code2, Database, Zap, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GRADIENT_PALETTES = [
  'linear-gradient(135deg,#9d22e6,#00abbf)',
  'linear-gradient(135deg,#e91e8c,#9d22e6)',
  'linear-gradient(135deg,#00abbf,#0090a0)',
  'linear-gradient(135deg,#6366f1,#9d22e6)',
  'linear-gradient(135deg,#00abbf,#6366f1)',
  'linear-gradient(135deg,#f59e0b,#e91e8c)',
];

function getProjectColor(id: number) {
  return GRADIENT_PALETTES[id % GRADIENT_PALETTES.length];
}

function getProjectProgress(project: Project): number {
  // Derived from settings or a mock heuristic from timestamps
  if (project.settings && typeof (project.settings as any).progress === 'number') {
    return (project.settings as any).progress;
  }
  // Heuristic: how old is the project (0-100%)
  const created = new Date(project.created_at).getTime();
  const now = Date.now();
  const age = (now - created) / (1000 * 60 * 60 * 24); // days
  return Math.min(Math.floor(age * 5), 95); // 5% per day, max 95
}

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Load real projects from backend
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectsApi.list();
      setProjects(data);
    } catch (err: any) {
      toast.error(err.message || 'No se pudieron cargar los proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedProject) {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <DetalleProyecto project={selectedProject} onClose={() => { setSelectedProject(null); loadProjects(); }} />
      </>
    );
  }

  const filtered = projects.filter(p =>
    p.status !== 'deleted' &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     (p.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = projects.filter(p => p.status === 'active').length;
  const archivedCount = projects.filter(p => p.status === 'archived').length;

  const handleCreate = async (data: any) => {
    try {
      const newProject = await projectsApi.create({
        name: data.name,
        description: data.description,
        settings: { color: GRADIENT_PALETTES[projects.length % GRADIENT_PALETTES.length] },
      });
      setProjects(prev => [newProject, ...prev]);
      toast.success(`Proyecto "${data.name}" creado`, {
        action: { label: 'Abrir', onClick: () => setSelectedProject(newProject) },
      });
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el proyecto');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await projectsApi.delete(Number(id));
      setProjects(prev => prev.filter(p => p.id !== Number(id)));
      toast.success('Proyecto archivado');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? '64px' : '220px', flexShrink: 0, transition: 'width 0.2s ease', background: '#0f0f1a', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: sidebarCollapsed ? '1.25rem 0' : '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#00abbf,#9d22e6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={18} style={{ color: '#fff' }} />
          </div>
          {!sidebarCollapsed && (
            <span style={{ fontSize: '1rem', fontWeight: 700, background: 'linear-gradient(90deg,#00abbf,#9d22e6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', whiteSpace: 'nowrap' }}>
              HERMAN
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
            { id: 'equipos', label: 'Equipos', icon: <Users size={18} />, path: '/equipos' },
            { id: 'configuracion', label: 'Config.', icon: <Settings size={18} />, path: '/configuracion' },
          ].map(item => (
            <button key={item.id}
              onClick={() => item.path ? navigate(item.path) : setActiveSection(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: sidebarCollapsed ? '0.625rem' : '0.625rem 0.75rem',
                borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                background: activeSection === item.id ? 'rgba(0,171,191,0.12)' : 'transparent',
                color: activeSection === item.id ? '#00abbf' : 'rgba(255,255,255,0.5)',
                fontSize: '0.875rem', fontWeight: activeSection === item.id ? 600 : 400,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!sidebarCollapsed && user && (
            <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.375rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          )}
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <LogOut size={16} />
            {!sidebarCollapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '56px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem', flexShrink: 0 }}>
          <button onClick={() => setSidebarCollapsed(c => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.375rem' }}>
            <LayoutGrid size={18} />
          </button>
          <div style={{ height: '20px', width: '1px', background: '#e5e7eb' }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <span style={{ fontWeight: 600, color: '#111827' }}>Dashboard</span>
          </div>
          <button className="cyber-btn cyber-btn-primary" style={{ height: '34px', fontSize: '0.8125rem' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={14} /> Nuevo proyecto
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem 2rem' }}>
          {/* Page title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
              Bienvenido, {user?.name?.split(' ')[0] || 'usuario'} 👋
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
              Gestiona tus proyectos de software asistidos por IA
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Proyectos activos', value: activeCount, icon: <FolderOpen size={18} />, color: '#00abbf' },
              { label: 'Archivados', value: archivedCount, icon: <Archive size={18} />, color: '#9d22e6' },
              { label: 'Pipeline IA', value: 'Listo', icon: <Brain size={18} />, color: '#10b981' },
              { label: 'BD conectada', value: 'soft_evolved', icon: <Database size={18} />, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search + view toggle */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                className="cyber-input"
                placeholder="Buscar proyectos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.875rem' }}
              />
            </div>
            <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden', background: '#fff' }}>
              {(['grid', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '0.4rem 0.625rem', background: viewMode === mode ? '#f3f4f6' : '#fff', border: 'none', cursor: 'pointer', color: viewMode === mode ? '#111827' : '#9ca3af' }}>
                  {mode === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                </button>
              ))}
            </div>
            <button onClick={loadProjects} style={{ padding: '0.4rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', color: '#6b7280', fontSize: '0.8125rem' }}>
              ↻ Actualizar
            </button>
          </div>

          {/* Section title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
              Mis proyectos
              <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                ({filtered.length})
              </span>
            </h2>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid #e5e7eb', height: '180px', animation: 'pulse 1.5s ease infinite' }}>
                  <div style={{ height: '80px', background: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1rem' }} />
                  <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '4px', width: '60%', marginBottom: '0.5rem' }} />
                  <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '80%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,171,191,0.1),rgba(157,34,230,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Sparkles size={36} style={{ color: '#9d22e6' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                {search ? 'Sin resultados' : 'Crea tu primer proyecto'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                {search ? `No se encontraron proyectos para "${search}"` : 'Comienza construyendo software asistido por IA desde cero'}
              </p>
              {!search && (
                <button className="cyber-btn cyber-btn-primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} /> Crear proyecto
                </button>
              )}
            </div>
          )}

          {/* Projects grid / list */}
          {!isLoading && filtered.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(300px,1fr))' : '1fr',
              gap: '1rem',
            }}>
              {filtered.map(project => {
                const progress = getProjectProgress(project);
                const color = getProjectColor(project.id);
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject({ ...project, color })}
                    style={{ background: '#fff', borderRadius: '0.875rem', border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s ease', position: 'relative' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; }}
                  >
                    {/* Color header */}
                    <div style={{ height: '72px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Code2 size={28} style={{ color: 'rgba(255,255,255,0.5)' }} />
                      <div style={{ position: 'absolute', top: '0.625rem', right: '0.625rem', display: 'flex', gap: '0.375rem' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                          {project.status === 'active' ? 'Activo' : 'Archivado'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.name}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                        {project.description || 'Sin descripción'}
                      </p>

                      {/* Progress bar */}
                      <div style={{ marginBottom: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                          <span>Progreso</span>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{progress}%</span>
                        </div>
                        <div style={{ height: '5px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: color, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} />
                          {formatRelativeDate(project.updated_at)}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(project.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                        >
                          Archivar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <ModalCrearProyecto isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
