import { MetadatosState, MetadatosAction } from '../metadatosReducer';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

const TIPOS = ['Web', 'Mobile', 'Desktop', 'API', 'PWA', 'Microservicios'];
const INDUSTRIAS = ['Fintech', 'Salud', 'Educación', 'Logística', 'E-commerce', 'Gobierno', 'Manufactura', 'Otro'];
const PLATAFORMAS = ['Web', 'iOS', 'Android', 'Windows', 'macOS', 'Linux'];

export default function SeccionInfoGeneral({ state, dispatch }: Props) {
  const set = (field: keyof MetadatosState, value: any) => dispatch({ type: 'SET_FIELD', field, value });

  return (
    <div>
      <div className="module-header">
        <h2>Información General</h2>
        <p>Define el contexto básico del proyecto de software</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '640px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
            Nombre del Proyecto *
          </label>
          <input
            className="cyber-input"
            placeholder="Ej. Sistema de Gestión Hospitalaria"
            value={state.nombreProyecto}
            onChange={e => set('nombreProyecto', e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
            Descripción
          </label>
          <textarea
            className="cyber-textarea"
            placeholder="Describe el objetivo principal, el problema que resuelve y el público objetivo..."
            value={state.descripcionProyecto}
            onChange={e => set('descripcionProyecto', e.target.value)}
            rows={4}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
              Tipo de Aplicación
            </label>
            <select className="cyber-input" value={state.tipoApp} onChange={e => set('tipoApp', e.target.value)}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
              Industria
            </label>
            <select className="cyber-input" value={state.industria} onChange={e => set('industria', e.target.value)}>
              <option value="">Selecciona...</option>
              {INDUSTRIAS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            Plataformas objetivo
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PLATAFORMAS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_PLATAFORMA', plataforma: p })}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: `1.5px solid ${state.plataforma.includes(p) ? '#00abbf' : '#e5e7eb'}`,
                  background: state.plataforma.includes(p) ? 'rgba(0,171,191,0.1)' : '#fff',
                  color: state.plataforma.includes(p) ? '#00abbf' : '#6b7280',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
