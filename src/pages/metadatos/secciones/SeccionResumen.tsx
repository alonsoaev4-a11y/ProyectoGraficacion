import { MetadatosState, MetadatosAction, buildOutputJson } from '../metadatosReducer';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props { state: MetadatosState; dispatch: React.Dispatch<MetadatosAction>; }

export default function SeccionResumen({ state, dispatch }: Props) {
  const [copied, setCopied] = useState(false);
  const json = buildOutputJson(state);
  const jsonStr = JSON.stringify(json, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast.success('JSON copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const completeness = [
    { label: 'Nombre del proyecto', done: !!state.nombreProyecto },
    { label: 'Descripción', done: !!state.descripcionProyecto },
    { label: 'Al menos una entrevista', done: (state.entrevistas?.length || 0) > 0 },
    { label: 'Hallazgos de entrevistas', done: !!state.hallazgosEntrevista },
    { label: 'Historias de usuario', done: (state.historias?.length || 0) > 0 },
    { label: 'Resumen consolidado', done: !!state.resumenConsolidado },
  ];
  const progress = Math.round((completeness.filter(c => c.done).length / completeness.length) * 100);

  return (
    <div>
      <div className="module-header">
        <h2>Resumen y Exportación</h2>
        <p>Vista de completitud de los metadatos y JSON generado listo para el pipeline de IA</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '900px' }}>
        {/* Completitud */}
        <div className="cyber-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Completitud de metadatos</div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              <span style={{ color: '#6b7280' }}>Progreso</span>
              <span style={{ fontWeight: 700, color: progress === 100 ? '#10b981' : '#00abbf' }}>{progress}%</span>
            </div>
            <div className="cyber-progress-bar">
              <div className="cyber-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {completeness.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: c.done ? '#10b981' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.done && <Check size={10} style={{ color: '#fff' }} />}
                </div>
                <span style={{ color: c.done ? '#374151' : '#9ca3af' }}>{c.label}</span>
              </div>
            ))}
          </div>

          {progress === 100 && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.5rem', fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>
              ✓ Metadatos completos — listos para el pipeline IA
            </div>
          )}
        </div>

        {/* JSON Preview */}
        <div className="cyber-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 600, color: '#111827' }}>JSON de metadatos</div>
            <button className="cyber-btn cyber-btn-ghost cyber-btn-sm" onClick={handleCopy}>
              {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
            </button>
          </div>
          <pre style={{
            background: '#0f0f1a', color: '#a5f3fc', borderRadius: '0.5rem', padding: '0.875rem',
            fontSize: '0.75rem', overflow: 'auto', maxHeight: '340px', lineHeight: 1.6,
          }}>
            {jsonStr}
          </pre>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem', marginTop: '1.5rem', maxWidth: '900px' }}>
        {[
          { label: 'Entrevistas', value: state.entrevistas?.length || 0, color: '#00abbf' },
          { label: 'Encuestas', value: state.encuestas?.length || 0, color: '#9d22e6' },
          { label: 'Historias', value: state.historias?.length || 0, color: '#e91e8c' },
          { label: 'Observaciones', value: state.sesionesObservacion?.length || 0, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
