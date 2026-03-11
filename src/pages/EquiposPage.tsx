import { useState } from 'react';
import { Users, Plus, Mail, Shield, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BarraSuperior } from '../app/components/layout/topbar/BarraSuperior';
import { toast, Toaster } from 'sonner';

const mockTeams = [
  { id: '1', name: 'Equipo Frontend', members: 4, role: 'Admin', color: '#00abbf' },
  { id: '2', name: 'Equipo Backend', members: 3, role: 'Miembro', color: '#9d22e6' },
  { id: '3', name: 'Diseño UX', members: 2, role: 'Invitado', color: '#e91e8c' },
];

export default function EquiposPage() {
  const { logout } = useAuth();
  const [teams, setTeams] = useState(mockTeams);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    setTeams([...teams, { id: Date.now().toString(), name: newTeamName.trim(), members: 1, role: 'Admin', color: '#00abbf' }]);
    setNewTeamName('');
    setIsCreating(false);
    toast.success('Equipo creado exitosamente');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Toaster position="top-right" richColors />
      <header style={{ height: '56px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem' }}>
        <BarraSuperior onPublish={() => {}} onShare={logout} />
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Equipos</h1>
            <p style={{ color: '#6b7280' }}>Gestiona los equipos de tu organización</p>
          </div>
          <button className="cyber-btn cyber-btn-primary" onClick={() => setIsCreating(true)}>
            <Plus size={16} /> Nuevo equipo
          </button>
        </div>

        {isCreating && (
          <div className="cyber-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Crear nuevo equipo</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="cyber-input" style={{ flex: 1 }} placeholder="Nombre del equipo..." value={newTeamName} onChange={e => setNewTeamName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateTeam()} autoFocus />
              <button className="cyber-btn cyber-btn-primary" onClick={handleCreateTeam}>Crear</button>
              <button className="cyber-btn cyber-btn-ghost" onClick={() => setIsCreating(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {teams.map(team => (
            <div key={team.id} className="cyber-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', background: `${team.color}18`, border: `1px solid ${team.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: team.color }}>
                  <Users size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{team.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{team.members} miembro{team.members !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`cyber-badge cyber-badge-${team.role === 'Admin' ? 'cyan' : team.role === 'Miembro' ? 'purple' : 'gray'}`}>
                  {team.role}
                </span>
                <button className="cyber-btn cyber-btn-ghost cyber-btn-sm" onClick={() => toast.info('Invitar próximamente')}>
                  <Mail size={14} /> Invitar
                </button>
                <button className="cyber-btn cyber-btn-ghost cyber-btn-sm">
                  <Settings size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="cyber-empty-state">
            <Shield size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
            <p>No tienes equipos todavía</p>
            <button className="cyber-btn cyber-btn-primary" onClick={() => setIsCreating(true)}>
              <Plus size={16} /> Crear primer equipo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
