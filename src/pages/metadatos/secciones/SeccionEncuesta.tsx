import { MetadatosState, MetadatosAction } from '../metadatosReducer';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

const TIPOS_PREGUNTA = [
  { value: 'abierta', label: 'Abierta' },
  { value: 'multiple', label: 'Opción múltiple' },
  { value: 'escala', label: 'Escala 1-10' },
  { value: 'sino', label: 'Sí / No' },
];

export default function SeccionEncuesta({ state, dispatch }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div>
      <div className="module-header">
        <h2>Encuestas</h2>
        <p>Diseña cuestionarios estructurados con distintos tipos de preguntas</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', maxWidth: '880px', height: '600px' }}>
        {/* Lista de encuestas */}
        <div style={{ width: '220px', flexShrink: 0, overflowY: 'auto' }}>
          {state.encuestas.map(enc => (
            <button
              key={enc.id}
              onClick={() => setActiveId(enc.id)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${activeId === enc.id ? '#00abbf' : '#e5e7eb'}`, background: activeId === enc.id ? 'rgba(0,171,191,0.06)' : '#fff', marginBottom: '0.5rem', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: activeId === enc.id ? '#00abbf' : '#111827', marginBottom: '0.125rem' }}>{enc.titulo || 'Sin título'}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{enc.preguntas.length} pregunta{enc.preguntas.length !== 1 ? 's' : ''}</div>
            </button>
          ))}
          <button className="cyber-btn cyber-btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }} onClick={() => { dispatch({ type: 'ADD_ENCUESTA' }); }}>
            <Plus size={14} /> Nueva encuesta
          </button>
        </div>

        {/* Editor de encuesta activa */}
        {activeId ? (() => {
          const enc = state.encuestas.find(e => e.id === activeId);
          if (!enc) return null;
          return (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="cyber-input" style={{ flex: 1 }} placeholder="Título de la encuesta" value={enc.titulo} onChange={e => dispatch({ type: 'UPDATE_ENCUESTA', id: enc.id, field: 'titulo', value: e.target.value })} />
                <button onClick={() => { dispatch({ type: 'REMOVE_ENCUESTA', id: enc.id }); setActiveId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
              </div>
              <textarea className="cyber-textarea" rows={2} placeholder="Descripción del objetivo..." value={enc.descripcion} onChange={e => dispatch({ type: 'UPDATE_ENCUESTA', id: enc.id, field: 'descripcion', value: e.target.value })} />

              {/* Preguntas */}
              {enc.preguntas.map((p, i) => (
                <div key={p.id} style={{ padding: '0.875rem', background: '#f9fafb', borderRadius: '0.625rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9d22e6', minWidth: '1.5rem' }}>P{i + 1}</span>
                    <select className="cyber-input" style={{ width: '160px', fontSize: '0.8125rem' }} value={p.tipo} onChange={e => dispatch({ type: 'UPDATE_PREGUNTA_ENCUESTA', encuestaId: enc.id, preguntaId: p.id, field: 'tipo', value: e.target.value })}>
                      {TIPOS_PREGUNTA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <button onClick={() => dispatch({ type: 'REMOVE_PREGUNTA_ENCUESTA', encuestaId: enc.id, preguntaId: p.id })} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db' }}><Trash2 size={13} /></button>
                  </div>
                  <input className="cyber-input" style={{ fontSize: '0.875rem' }} placeholder="Escribe la pregunta..." value={p.texto} onChange={e => dispatch({ type: 'UPDATE_PREGUNTA_ENCUESTA', encuestaId: enc.id, preguntaId: p.id, field: 'texto', value: e.target.value })} />
                  {p.tipo === 'abierta' && (
                    <textarea className="cyber-textarea" style={{ minHeight: '52px', fontSize: '0.8125rem' }} placeholder="Respuesta..." value={p.respuesta || ''} onChange={e => dispatch({ type: 'UPDATE_PREGUNTA_ENCUESTA', encuestaId: enc.id, preguntaId: p.id, field: 'respuesta', value: e.target.value })} />
                  )}
                  {p.tipo === 'escala' && (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} onClick={() => dispatch({ type: 'UPDATE_PREGUNTA_ENCUESTA', encuestaId: enc.id, preguntaId: p.id, field: 'valorEscala', value: n })} style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: `1.5px solid ${p.valorEscala === n ? '#9d22e6' : '#e5e7eb'}`, background: p.valorEscala === n ? '#9d22e6' : '#fff', color: p.valorEscala === n ? '#fff' : '#374151', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{n}</button>
                      ))}
                    </div>
                  )}
                  {p.tipo === 'sino' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[true, false].map(val => (
                        <button key={String(val)} onClick={() => dispatch({ type: 'UPDATE_PREGUNTA_ENCUESTA', encuestaId: enc.id, preguntaId: p.id, field: 'valorSiNo', value: val })} style={{ padding: '0.375rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${p.valorSiNo === val ? '#00abbf' : '#e5e7eb'}`, background: p.valorSiNo === val ? '#00abbf' : '#fff', color: p.valorSiNo === val ? '#fff' : '#374151', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>{val ? 'Sí' : 'No'}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button className="cyber-btn cyber-btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => dispatch({ type: 'ADD_PREGUNTA_ENCUESTA', encuestaId: enc.id })}>
                <Plus size={14} /> Agregar pregunta
              </button>
            </div>
          );
        })() : (
          <div className="cyber-empty-state" style={{ flex: 1 }}>
            <p>Selecciona o crea una encuesta para comenzar</p>
          </div>
        )}
      </div>

      {/* Hallazgos */}
      <div style={{ marginTop: '1.5rem', maxWidth: '720px' }}>
        <div style={{ padding: '1rem', background: 'rgba(0,171,191,0.04)', borderRadius: '0.625rem', border: '1px solid rgba(0,171,191,0.15)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            Hallazgos generales de encuestas
          </label>
          <textarea className="cyber-textarea" rows={4} value={state.hallazgosEncuesta} onChange={e => dispatch({ type: 'SET_FIELD', field: 'hallazgosEncuesta', value: e.target.value })} placeholder="Síntesis de los patrones y tendencias encontrados..." />
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', textAlign: 'right' }}>{state.hallazgosEncuesta.length} caracteres</div>
          {state.hallazgosEncuesta.length > 10 && <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.125rem' }}>✓ Listo para análisis</div>}
          <button className="cyber-btn cyber-btn-secondary cyber-btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => toast.success('Hallazgos guardados')}>Guardar hallazgos</button>
        </div>
      </div>
    </div>
  );
}
