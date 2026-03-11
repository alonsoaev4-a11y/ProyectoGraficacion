import { MetadatosState, MetadatosAction } from '../metadatosReducer';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

export default function SeccionObservacion({ state, dispatch }: Props) {
  return (
    <div>
      <div className="module-header">
        <h2>Observación</h2>
        <p>Registra las sesiones de observación directa con usuarios en su contexto real</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
        {state.sesionesObservacion.map((s, i) => (
          <div key={s.id} className="cyber-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <div style={{ fontWeight: 600, color: '#111827' }}>Sesión {i + 1}</div>
              <button onClick={() => dispatch({ type: 'REMOVE_SESION_OBSERVACION', id: s.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db' }}>
                <Trash2 size={15} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Fecha</label>
                <input type="date" className="cyber-input" value={s.fecha} onChange={e => dispatch({ type: 'UPDATE_SESION_OBSERVACION', id: s.id, field: 'fecha', value: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Duración estimada</label>
                <input className="cyber-input" placeholder="60 min" value={s.duracion} onChange={e => dispatch({ type: 'UPDATE_SESION_OBSERVACION', id: s.id, field: 'duracion', value: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Lugar / Contexto</label>
                <input className="cyber-input" placeholder="Oficina, entorno remoto..." value={s.lugar} onChange={e => dispatch({ type: 'UPDATE_SESION_OBSERVACION', id: s.id, field: 'lugar', value: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Participantes observados</label>
                <input className="cyber-input" placeholder="Nombres o roles" value={s.participantes} onChange={e => dispatch({ type: 'UPDATE_SESION_OBSERVACION', id: s.id, field: 'participantes', value: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Objetivo de la sesión</label>
                <textarea className="cyber-textarea" rows={2} value={s.objetivo} onChange={e => dispatch({ type: 'UPDATE_SESION_OBSERVACION', id: s.id, field: 'objetivo', value: e.target.value })} placeholder="¿Qué se quería observar o aprender?" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Comportamiento observado</label>
                <textarea className="cyber-textarea" rows={2} value={s.comportamientoObservado} onChange={e => dispatch({ type: 'UPDATE_SESION_OBSERVACION', id: s.id, field: 'comportamientoObservado', value: e.target.value })} placeholder="¿Qué hizo el usuario? ¿Cómo interactuó con el sistema actual?" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Dolores / Fricciones observadas</label>
                <textarea className="cyber-textarea" rows={2} value={s.dolorObservado} onChange={e => dispatch({ type: 'UPDATE_SESION_OBSERVACION', id: s.id, field: 'dolorObservado', value: e.target.value })} placeholder="¿Dónde tuvo dificultades? ¿Qué procesos son lentos o confusos?" />
              </div>
            </div>
          </div>
        ))}

        <button className="cyber-btn cyber-btn-secondary" style={{ width: '100%' }} onClick={() => dispatch({ type: 'ADD_SESION_OBSERVACION' })}>
          <Plus size={15} /> Agregar sesión de observación
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', maxWidth: '720px', padding: '1rem', background: 'rgba(0,171,191,0.04)', borderRadius: '0.625rem', border: '1px solid rgba(0,171,191,0.15)' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Hallazgos generales de observación</label>
        <textarea className="cyber-textarea" rows={4} value={state.hallazgosObservacion} onChange={e => dispatch({ type: 'SET_FIELD', field: 'hallazgosObservacion', value: e.target.value })} placeholder="Síntesis de patrones de comportamiento y pain points encontrados..." />
        <button className="cyber-btn cyber-btn-secondary cyber-btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => toast.success('Hallazgos guardados')}>Guardar hallazgos</button>
      </div>
    </div>
  );
}
