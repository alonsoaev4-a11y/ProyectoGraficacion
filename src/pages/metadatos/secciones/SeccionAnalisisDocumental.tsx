import { MetadatosState, MetadatosAction, buildOutputJson } from '../metadatosReducer';
import { toast } from 'sonner';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

export default function SeccionAnalisisDocumental({ state, dispatch }: Props) {
  const consolidated = [
    state.hallazgosEntrevista && `## Hallazgos de Entrevistas\n${state.hallazgosEntrevista}`,
    state.hallazgosEncuesta && `## Hallazgos de Encuestas\n${state.hallazgosEncuesta}`,
    (state.historias?.length || 0) > 0 && `## Historias de Usuario\n${state.historias.map((h, i) => `- H${i+1}: Como ${h.comoUnA}, necesito ${h.necesito}, para poder ${h.paraPoder} [${h.prioridad}]`).join('\n')}`,
    state.hallazgosObservacion && `## Hallazgos de Observación\n${state.hallazgosObservacion}`,
  ].filter(Boolean).join('\n\n');

  const loadConsolidated = () => {
    if (!state.resumenConsolidado && consolidated) {
      dispatch({ type: 'SET_FIELD', field: 'resumenConsolidado', value: consolidated });
      toast.success('Datos consolidados cargados');
    } else {
      toast.info('El resumen ya tiene contenido');
    }
  };

  return (
    <div>
      <div className="module-header">
        <h2>Análisis Documental</h2>
        <p>Vista consolidada editable de todos los hallazgos de levantamiento de información</p>
      </div>

      <div style={{ maxWidth: '760px' }}>
        <div style={{ marginBottom: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Datos disponibles: {[
              state.hallazgosEntrevista && `${state.entrevistas?.length || 0} entrevista(s)`,
              state.hallazgosEncuesta && `${state.encuestas?.length || 0} encuesta(s)`,
              (state.historias?.length || 0) > 0 && `${state.historias.length} historia(s)`,
              state.hallazgosObservacion && `${state.sesionesObservacion?.length || 0} sesión(es) de observación`,
            ].filter(Boolean).join(', ') || 'Ninguno todavía'}
          </div>
          <button className="cyber-btn cyber-btn-secondary cyber-btn-sm" onClick={loadConsolidated} disabled={!consolidated}>
            Cargar datos automáticamente
          </button>
        </div>

        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
          Resumen consolidado del levantamiento
        </label>
        <textarea
          className="cyber-textarea"
          rows={16}
          value={state.resumenConsolidado}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'resumenConsolidado', value: e.target.value })}
          placeholder={'Edita libremente el resumen consolidado de toda la información levantada...\n\nPuedes usar el botón "Cargar datos automáticamente" para pre-popular este campo con los hallazgos de las otras secciones.'}
          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            {state.resumenConsolidado?.length || 0} caracteres
          </div>
          <button className="cyber-btn cyber-btn-primary cyber-btn-sm" onClick={() => toast.success('Análisis guardado')}>
            Guardar análisis
          </button>
        </div>
      </div>
    </div>
  );
}
