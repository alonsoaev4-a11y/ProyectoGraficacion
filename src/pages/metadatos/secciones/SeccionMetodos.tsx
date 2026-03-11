import { MetadatosState, MetadatosAction } from '../metadatosReducer';
import { Users, ClipboardList, BookOpen, Eye, FileSearch, BarChart3 } from 'lucide-react';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

const METODOS = [
  { id: 'entrevista', label: 'Entrevistas', desc: 'Sesiones individuales o grupales para capturar necesidades', icon: <Users size={20} />, color: '#00abbf' },
  { id: 'encuesta', label: 'Encuestas', desc: 'Cuestionarios estructurados con distintos tipos de preguntas', icon: <ClipboardList size={20} />, color: '#9d22e6' },
  { id: 'historias', label: 'Historias de Usuario', desc: 'Narrativas de usuario para capturar funcionalidad esperada', icon: <BookOpen size={20} />, color: '#e91e8c' },
  { id: 'observacion', label: 'Observación', desc: 'Observación directa del contexto y flujos de trabajo', icon: <Eye size={20} />, color: '#f59e0b' },
  { id: 'documental', label: 'Análisis Documental', desc: 'Revisión de documentos, procesos existentes y sistemas legado', icon: <FileSearch size={20} />, color: '#10b981' },
];

export default function SeccionMetodos({ state, dispatch }: Props) {
  return (
    <div>
      <div className="module-header">
        <h2>Métodos de Recolección</h2>
        <p>Selecciona los métodos que usarás para levantar los requisitos del sistema</p>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '640px' }}>
        {METODOS.map(m => {
          const selected = state.metodosSeleccionados.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_METODO', metodo: m.id })}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem', textAlign: 'left',
                border: `2px solid ${selected ? m.color : '#e5e7eb'}`,
                borderRadius: '0.75rem',
                background: selected ? `${m.color}08` : '#fff',
                cursor: 'pointer', width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: selected ? m.color : '#111827', marginBottom: '0.125rem' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{m.desc}</div>
              </div>
              <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', border: `2px solid ${selected ? m.color : '#d1d5db'}`, background: selected ? m.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
              </div>
            </button>
          );
        })}
      </div>

      {state.metodosSeleccionados.length > 0 && (
        <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', background: 'rgba(0,171,191,0.06)', borderRadius: '0.5rem', border: '1px solid rgba(0,171,191,0.2)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#00abbf', marginBottom: '0.25rem' }}>
            {state.metodosSeleccionados.length} método{state.metodosSeleccionados.length !== 1 ? 's' : ''} seleccionado{state.metodosSeleccionados.length !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#374151' }}>
            {state.metodosSeleccionados.map(id => METODOS.find(m => m.id === id)?.label).filter(Boolean).join(' · ')}
          </div>
        </div>
      )}
    </div>
  );
}
