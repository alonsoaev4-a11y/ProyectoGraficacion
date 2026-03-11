import { MetadatosState, MetadatosAction, HistoriaUsuario } from '../metadatosReducer';
import { Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

const PRIORIDADES: HistoriaUsuario['prioridad'][] = ['Alta', 'Media', 'Baja'];
const ESTADOS: HistoriaUsuario['estado'][] = ['Pendiente', 'En progreso', 'Completada'];
const PRIO_COLORS: Record<string, string> = { Alta: '#ef4444', Media: '#f59e0b', Baja: '#10b981' };
const EST_COLORS: Record<string, string> = { Pendiente: '#6b7280', 'En progreso': '#00abbf', Completada: '#10b981' };

export default function SeccionHistorias({ state, dispatch }: Props) {
  const handleExportCSV = () => {
    const header = 'ID,Como un,Necesito,Para poder,Prioridad,Estado';
    const rows = state.historias.map((h, i) => `H${i+1},"${h.comoUnA}","${h.necesito}","${h.paraPoder}",${h.prioridad},${h.estado}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historias-usuario.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  return (
    <div>
      <div className="module-header">
        <h2>Historias de Usuario</h2>
        <p>Captura y gestiona las historias de usuario en formato Como/Necesito/Para poder</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', maxWidth: '760px' }}>
        <button className="cyber-btn cyber-btn-primary" onClick={() => dispatch({ type: 'ADD_HISTORIA' })}>
          <Plus size={15} /> Nueva historia
        </button>
        <button className="cyber-btn cyber-btn-ghost" onClick={handleExportCSV}>
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '760px' }}>
        {state.historias.map((h, i) => (
          <div key={h.id} className="cyber-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>H{i+1}</span>
                <select
                  value={h.prioridad}
                  onChange={e => dispatch({ type: 'UPDATE_HISTORIA', id: h.id, field: 'prioridad', value: e.target.value })}
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: PRIO_COLORS[h.prioridad], background: 'transparent', border: `1px solid ${PRIO_COLORS[h.prioridad]}30`, borderRadius: '4px', padding: '0.125rem 0.375rem', cursor: 'pointer' }}
                >
                  {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  value={h.estado}
                  onChange={e => dispatch({ type: 'UPDATE_HISTORIA', id: h.id, field: 'estado', value: e.target.value })}
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: EST_COLORS[h.estado], background: 'transparent', border: `1px solid ${EST_COLORS[h.estado]}30`, borderRadius: '4px', padding: '0.125rem 0.375rem', cursor: 'pointer' }}
                >
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <button onClick={() => dispatch({ type: 'REMOVE_HISTORIA', id: h.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db' }}>
                <Trash2 size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#6b7280', minWidth: '80px', fontStyle:'italic' }}>Como un/a</span>
                <input className="cyber-input" placeholder="rol o tipo de usuario" value={h.comoUnA} style={{ flex: 1, fontSize: '0.875rem' }} onChange={e => dispatch({ type: 'UPDATE_HISTORIA', id: h.id, field: 'comoUnA', value: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#6b7280', minWidth: '80px', fontStyle:'italic' }}>Necesito</span>
                <input className="cyber-input" placeholder="funcionalidad o acción" value={h.necesito} style={{ flex: 1, fontSize: '0.875rem' }} onChange={e => dispatch({ type: 'UPDATE_HISTORIA', id: h.id, field: 'necesito', value: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#6b7280', minWidth: '80px', fontStyle:'italic' }}>Para poder</span>
                <input className="cyber-input" placeholder="beneficio o resultado esperado" value={h.paraPoder} style={{ flex: 1, fontSize: '0.875rem' }} onChange={e => dispatch({ type: 'UPDATE_HISTORIA', id: h.id, field: 'paraPoder', value: e.target.value })} />
              </div>
            </div>
          </div>
        ))}

        {(!state.historias || state.historias.length === 0) && (
          <div className="cyber-empty-state">
            <p>No hay historias de usuario. Agrega una para comenzar.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', maxWidth: '760px', padding: '1rem', background: 'rgba(0,171,191,0.04)', borderRadius: '0.625rem', border: '1px solid rgba(0,171,191,0.15)' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Criterios generales de aceptación</label>
        <textarea className="cyber-textarea" rows={3} value={state.criteriosGeneralesAceptacion} onChange={e => dispatch({ type: 'SET_FIELD', field: 'criteriosGeneralesAceptacion', value: e.target.value })} placeholder="Define los criterios de calidad y aceptación comunes para todas las historias..." />
        <button className="cyber-btn cyber-btn-secondary cyber-btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => toast.success('Criterios guardados')}>Guardar criterios</button>
      </div>
    </div>
  );
}
