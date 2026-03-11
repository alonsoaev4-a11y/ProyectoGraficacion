import { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Globe,
  Link as LinkIcon,
  Plus,
  Mail,
  Trash2,
  Edit2,
  Check,
  X,
  Github,
  GitBranch,
  Key,
  Bell,
  Clock,
  UserCheck,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  status: 'active' | 'pending';
  joinedAt: string;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'María García', email: 'maria@ejemplo.com', role: 'Owner', status: 'active', joinedAt: '2026-01-10' },
  { id: '2', name: 'Juan Pérez', email: 'juan@ejemplo.com', role: 'Editor', status: 'active', joinedAt: '2026-01-15' },
  { id: '3', name: 'Ana López', email: 'ana@ejemplo.com', role: 'Viewer', status: 'pending', joinedAt: '2026-02-12' },
];

const auditLogs: AuditLog[] = [
  { id: '1', user: 'María García', action: 'Invitó a usuario', timestamp: '2026-02-15 10:30', details: 'ana@ejemplo.com como Viewer' },
  { id: '2', user: 'Juan Pérez', action: 'Cambió rol', timestamp: '2026-02-14 16:45', details: 'Ana López de Editor a Viewer' },
  { id: '3', user: 'María García', action: 'Conectó GitHub', timestamp: '2026-02-14 09:20', details: 'Repositorio: org/proyecto' },
];

export function PanelConfiguracion() {
  const [activeTab, setActiveTab] = useState<'project' | 'users' | 'integrations' | 'security' | 'language'>('project');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Editor' | 'Viewer'>('Viewer');
  const [projectName, setProjectName] = useState('Sistema de Gestión Escolar');
  const [projectLanguage, setProjectLanguage] = useState('es');

  const handleInviteUser = () => {
    if (inviteEmail) {
      const newUser: User = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleChangeRole = (userId: string, newRole: 'Owner' | 'Editor' | 'Viewer') => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm('¿Eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Owner': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Editor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Viewer': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const tabs = [
    { id: 'project', label: 'Proyecto', icon: Settings },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'integrations', label: 'Integraciones', icon: LinkIcon },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'language', label: 'Idioma', icon: Globe },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-600 mt-1">Gestiona tu proyecto, usuarios e integraciones</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Project Tab */}
          {activeTab === 'project' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Proyecto</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Proyecto</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Describe tu proyecto..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all">
                      Guardar Cambios
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Zona de Peligro</h3>
                <p className="text-sm text-red-700 mb-4">Las siguientes acciones son irreversibles</p>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all">
                  Eliminar Proyecto
                </button>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Miembros del Equipo</h3>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                  >
                    <Plus size={18} />
                    Invitar Usuario
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Usuario</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rol</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                                {user.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value as any)}
                              disabled={user.role === 'Owner'}
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)} ${user.role === 'Owner' ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                              <option value="Owner">Owner</option>
                              <option value="Editor">Editor</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                              {user.status === 'active' ? 'Activo' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemoveUser(user.id)}
                              disabled={user.role === 'Owner'}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={18} />
                  Logs de Auditoría
                </h3>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <UserCheck size={18} className="text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{log.user}</span>
                          <span className="text-xs text-slate-500">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-600">{log.action}: {log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Repositorios Git</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Github size={24} className="text-slate-700" />
                      <div>
                        <p className="font-medium text-slate-900">GitHub</p>
                        <p className="text-sm text-slate-600">Conecta tu repositorio de GitHub</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all">
                      Conectar
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <GitBranch size={24} className="text-orange-600" />
                      <div>
                        <p className="font-medium text-slate-900">GitLab</p>
                        <p className="text-sm text-slate-600">Conecta tu repositorio de GitLab</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all">
                      Conectar
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Webhooks</h3>
                <p className="text-sm text-slate-600 mb-4">Configura webhooks para recibir notificaciones en tiempo real</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                  <div>POST https://api.tu-proyecto.com/webhooks</div>
                  <div className="mt-2 text-slate-500">{'{'}</div>
                  <div className="ml-4 text-slate-500">"event": "generation.completed",</div>
                  <div className="ml-4 text-slate-500">"timestamp": "2026-02-15T10:30:00Z"</div>
                  <div className="text-slate-500">{'}'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Roles y Permisos</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <h4 className="font-semibold text-purple-900 mb-2">Owner</h4>
                    <ul className="text-sm text-purple-700 space-y-1 ml-4">
                      <li>• Acceso completo al proyecto</li>
                      <li>• Gestionar usuarios y permisos</li>
                      <li>• Eliminar proyecto</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">Editor</h4>
                    <ul className="text-sm text-blue-700 space-y-1 ml-4">
                      <li>• Crear y editar requisitos</li>
                      <li>• Generar código</li>
                      <li>• Ver configuración</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <h4 className="font-semibold text-slate-900 mb-2">Viewer</h4>
                    <ul className="text-sm text-slate-700 space-y-1 ml-4">
                      <li>• Ver requisitos</li>
                      <li>• Ver diagramas</li>
                      <li>• Exportar documentación</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">SSO / Single Sign-On</h3>
                <p className="text-sm text-slate-600 mb-4">Configura autenticación empresarial</p>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all">
                  Configurar SSO
                </button>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Idioma de la Interfaz</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="language"
                      value="es"
                      checked={projectLanguage === 'es'}
                      onChange={(e) => setProjectLanguage(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-slate-900">Español</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={projectLanguage === 'en'}
                      onChange={(e) => setProjectLanguage(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-slate-900">English</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="language"
                      value="fr"
                      checked={projectLanguage === 'fr'}
                      onChange={(e) => setProjectLanguage(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-slate-900">Français</span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Notificaciones</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-purple-600" />
                      <span className="text-slate-900">Notificaciones por email</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-purple-600" />
                      <span className="text-slate-900">Notificaciones push</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-purple-600" />
              Invitar Usuario
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="usuario@ejemplo.com"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleInviteUser}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                Enviar Invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
