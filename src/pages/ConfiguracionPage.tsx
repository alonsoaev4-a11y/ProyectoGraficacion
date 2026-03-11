import { useState } from 'react';
import { Settings, Users, Shield, Globe, Bell, Key, Plus, Check } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const tabs = [
  { id: 'info', label: 'Información', icon: <Settings size={16} /> },
  { id: 'team', label: 'Equipo', icon: <Users size={16} /> },
  { id: 'integrations', label: 'Integraciones', icon: <Globe size={16} /> },
  { id: 'security', label: 'Seguridad', icon: <Shield size={16} /> },
  { id: 'preferences', label: 'Preferencias', icon: <Bell size={16} /> },
];

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Toaster position="top-right" richColors />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Configuración</h1>
          <p style={{ color: '#6b7280' }}>Gestiona la configuración del proyecto y del equipo</p>
        </div>

        <div className="cyber-tab-list cyber-tabs-list" style={{ marginBottom: '1.5rem' }}>
          {tabs.map(t => (
            <button key={t.id} className={`cyber-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="cyber-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 600, marginBottom: '1.25rem', color: '#111827' }}>Información del proyecto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Nombre del proyecto</label>
                <input className="cyber-input" defaultValue="Herman Platform" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Descripción</label>
                <textarea className="cyber-textarea" defaultValue="Plataforma Meta-CASE / Low-Code / No-Code para automatización de ingeniería de software asistida por IA." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Industria</label>
                <select className="cyber-input" defaultValue="software">
                  <option value="software">Software / Tecnología</option>
                  <option value="fintech">Fintech</option>
                  <option value="health">Salud</option>
                  <option value="edu">Educación</option>
                </select>
              </div>
              <button className="cyber-btn cyber-btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => toast.success('Configuración guardada')}>
                <Check size={16} /> Guardar cambios
              </button>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="cyber-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 600, color: '#111827' }}>Usuarios y equipo</h2>
              <button className="cyber-btn cyber-btn-primary cyber-btn-sm" onClick={() => toast.info('Invitación próximamente')}>
                <Plus size={14} /> Invitar
              </button>
            </div>
            {[{ name: 'Admin', email: 'admin@herman.com', role: 'Admin' }, { name: 'Dev 1', email: 'dev1@herman.com', role: 'Developer' }].map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg,#00abbf,#9d22e6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#111827' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{u.email}</div>
                  </div>
                </div>
                <span className={`cyber-badge ${u.role === 'Admin' ? 'cyber-badge-cyan' : 'cyber-badge-purple'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="cyber-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 600, color: '#111827', marginBottom: '1.25rem' }}>Integraciones</h2>
            {[
              { name: 'GitHub', desc: 'Push automático del código generado', color: '#333', connected: false },
              { name: 'GitLab', desc: 'Integración con repositorios GitLab', color: '#fc6d26', connected: false },
              { name: 'Webhooks', desc: 'Notificaciones HTTP personalizadas', color: '#6366f1', connected: false },
            ].map((int, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{int.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{int.desc}</div>
                </div>
                <button className="cyber-btn cyber-btn-ghost cyber-btn-sm" onClick={() => toast.info(`Integración ${int.name} próximamente`)}>
                  Conectar
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="cyber-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 600, color: '#111827', marginBottom: '1.25rem' }}>Seguridad</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 500, color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={16} /> API Keys
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="cyber-input" type="password" placeholder="Groq API Key (se guarda en localStorage)" style={{ flex: 1 }}
                  defaultValue={localStorage.getItem('herman_groq_key') || ''}
                  onChange={e => localStorage.setItem('herman_groq_key', e.target.value)}
                />
                <button className="cyber-btn cyber-btn-primary" onClick={() => toast.success('API Key guardada')}>Guardar</button>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.5rem' }}>La Groq API Key se usa para transcripción de audio vía Whisper.</p>
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#374151', marginBottom: '0.75rem' }}>Roles RBAC</div>
              {['Admin — acceso completo', 'Developer — editar y generar', 'Viewer — solo lectura'].map((r, i) => (
                <div key={i} style={{ padding: '0.625rem 0.875rem', background: '#f9fafb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#374151', marginBottom: '0.375rem' }}>
                  {r}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="cyber-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 600, color: '#111827', marginBottom: '1.25rem' }}>Idioma y notificaciones</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Idioma</label>
                <select className="cyber-input" defaultValue="es">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Notificaciones de pipeline completado
                </label>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Alertas de errores en generación
                </label>
              </div>
              <button className="cyber-btn cyber-btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => toast.success('Preferencias guardadas')}>
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
