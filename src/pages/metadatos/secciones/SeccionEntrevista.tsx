import { MetadatosState, MetadatosAction } from '../metadatosReducer';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

export default function SeccionEntrevista({ state, dispatch }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEntrevista = () => {
    dispatch({ type: 'ADD_ENTREVISTA' });
  };

  const addPregunta = (entrevistaId: string) => {
    dispatch({ type: 'ADD_PREGUNTA_ENTREVISTA', entrevistaId });
  };

  return (
    <div>
      <div className="module-header">
        <h2>Entrevistas</h2>
        <p>Registra las entrevistas realizadas con stakeholders y usuarios clave</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
        {state.entrevistas.map(ent => (
          <div key={ent.id} className="cyber-card" style={{ padding: '1rem' }}>
            {/* Header del accordéon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === ent.id ? null : ent.id)}>
              {expandedId === ent.id ? <ChevronDown size={16} style={{ color: '#6b7280' }} /> : <ChevronRight size={16} style={{ color: '#6b7280' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111827' }}>{ent.nombre || 'Entrevistado sin nombre'}</div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{ent.rol || 'Sin rol'} {ent.fecha ? `— ${ent.fecha}` : ''}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_ENTREVISTA', id: ent.id }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '0.25rem' }}>
                <Trash2 size={15} />
              </button>
            </div>

            {expandedId === ent.id && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Nombre del entrevistado</label>
                    <input className="cyber-input" value={ent.nombre} onChange={e => dispatch({ type: 'UPDATE_ENTREVISTA', id: ent.id, field: 'nombre', value: e.target.value })} placeholder="Juan García" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Rol</label>
                    <input className="cyber-input" value={ent.rol} onChange={e => dispatch({ type: 'UPDATE_ENTREVISTA', id: ent.id, field: 'rol', value: e.target.value })} placeholder="Product Manager, Desarrollador..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Fecha</label>
                    <input type="date" className="cyber-input" value={ent.fecha} onChange={e => dispatch({ type: 'UPDATE_ENTREVISTA', id: ent.id, field: 'fecha', value: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Duración</label>
                    <input className="cyber-input" value={ent.duracion} onChange={e => dispatch({ type: 'UPDATE_ENTREVISTA', id: ent.id, field: 'duracion', value: e.target.value })} placeholder="60 min" />
                  </div>
                </div>

                {/* Preguntas */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Preguntas y Respuestas</div>
                    <button className="cyber-btn cyber-btn-secondary cyber-btn-sm" onClick={() => addPregunta(ent.id)}>
                      <Plus size={12} /> Pregunta
                    </button>
                  </div>
                  {ent.preguntas.map((p, i) => (
                    <div key={p.id} style={{ marginBottom: '0.625rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00abbf', marginTop: '0.125rem', minWidth: '1.5rem' }}>P{i + 1}</div>
                        <input className="cyber-input" style={{ flex: 1, fontSize: '0.8125rem' }} value={p.texto} onChange={e => dispatch({ type: 'UPDATE_PREGUNTA_ENTREVISTA', entrevistaId: ent.id, preguntaId: p.id, field: 'texto', value: e.target.value })} placeholder="¿Cuál es el mayor reto que enfrenta actualmente...?" />
                        <button onClick={() => dispatch({ type: 'REMOVE_PREGUNTA_ENTREVISTA', entrevistaId: ent.id, preguntaId: p.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', flexShrink: 0 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div style={{ paddingLeft: '1.75rem' }}>
                        <textarea className="cyber-textarea" style={{ minHeight: '52px', fontSize: '0.8125rem' }} value={p.respuesta} onChange={e => dispatch({ type: 'UPDATE_PREGUNTA_ENTREVISTA', entrevistaId: ent.id, preguntaId: p.id, field: 'respuesta', value: e.target.value })} placeholder="Respuesta del entrevistado..." />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hallazgos */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Hallazgos generales</label>
                  <textarea className="cyber-textarea" rows={3} value={ent.hallazgos} onChange={e => dispatch({ type: 'UPDATE_ENTREVISTA', id: ent.id, field: 'hallazgos', value: e.target.value })} placeholder="Síntesis de los puntos más relevantes..." />
                  <button className="cyber-btn cyber-btn-secondary cyber-btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => toast.success('Hallazgos guardados')}>
                    Guardar hallazgos
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button className="cyber-btn cyber-btn-secondary" style={{ width: '100%' }} onClick={addEntrevista}>
          <Plus size={15} /> Agregar entrevista
        </button>
      </div>
    </div>
  );
}
