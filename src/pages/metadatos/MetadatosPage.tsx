import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { metadatosReducer, metadatosInitialState, buildOutputJson, MetadatosState, MetadatosAction } from './metadatosReducer';
import { toast } from 'sonner';
import { FileText, Users, ClipboardList, BookOpen, Eye, BarChart3, FileSearch, CheckSquare } from 'lucide-react';

// Importar secciones
import SeccionInfoGeneral from './secciones/SeccionInfoGeneral';
import SeccionEntrevista from './secciones/SeccionEntrevista';
import SeccionEncuesta from './secciones/SeccionEncuesta';
import SeccionHistorias from './secciones/SeccionHistorias';
import SeccionObservacion from './secciones/SeccionObservacion';
import SeccionAnalisisDocumental from './secciones/SeccionAnalisisDocumental';
import SeccionResumen from './secciones/SeccionResumen';

const SECCIONES = [
  { id: 'info', label: 'Info General', icon: <FileText size={16} /> },
  { id: 'entrevista', label: 'Entrevistas', icon: <Users size={16} /> },
  { id: 'encuesta', label: 'Encuestas', icon: <ClipboardList size={16} /> },
  { id: 'historias', label: 'Historias', icon: <BookOpen size={16} /> },
  { id: 'observacion', label: 'Observación', icon: <Eye size={16} /> },
  { id: 'analisis', label: 'Análisis Documental', icon: <FileSearch size={16} /> },
  { id: 'resumen', label: 'Resumen', icon: <CheckSquare size={16} /> },
];

interface MetadatosPageProps {
  initialData?: object;
  onDataChange?: (data: object) => void;
}

export default function MetadatosPage({ initialData, onDataChange }: MetadatosPageProps) {
  const [state, dispatch] = useReducer(metadatosReducer, metadatosInitialState);
  const [activeSection, setActiveSection] = useState('info');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Forzamos la reinicialización completa del reducer saltando las validaciones parciales
      dispatch({ type: 'UPDATE_ALL', payload: initialData } as any);
    }
    // Set timeout to avoid immediate sync back of the initial/loaded state causing unnecessary writes
    setTimeout(() => setIsInitialized(true), 100);
  }, [initialData]);

  const handleDispatch = useCallback((action: MetadatosAction) => {
    dispatch(action);
  }, []);

  // Sync with parent on every state change (debounced manually if needed, or rely on parent debounce)
  useEffect(() => {
    if (onDataChange && isInitialized) {
      const timer = setTimeout(() => {
        onDataChange(state);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state, onDataChange, isInitialized]);

  const handleExportJson = () => {
    const data = buildOutputJson(state);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadatos-${state.nombreProyecto || 'proyecto'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exportado correctamente');
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar de secciones */}
      <div style={{ width: '200px', flexShrink: 0, borderRight: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 0.75rem 0.5rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>
          Secciones
        </div>
        {SECCIONES.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: activeSection === s.id ? 600 : 400,
              color: activeSection === s.id ? '#00abbf' : '#374151',
              background: activeSection === s.id ? 'rgba(0,171,191,0.06)' : 'transparent',
              border: 'none', borderLeft: `2px solid ${activeSection === s.id ? '#00abbf' : 'transparent'}`,
              cursor: 'pointer', textAlign: 'left', width: '100%',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '0.75rem' }}>
          <button
            className="cyber-btn cyber-btn-secondary"
            style={{ width: '100%', fontSize: '0.75rem' }}
            onClick={handleExportJson}
          >
            Exportar JSON
          </button>
        </div>
      </div>

      {/* Contenido de la sección activa */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        {activeSection === 'info' && <SeccionInfoGeneral state={state} dispatch={dispatch} />}
        {activeSection === 'entrevista' && <SeccionEntrevista state={state} dispatch={dispatch} />}
        {activeSection === 'encuesta' && <SeccionEncuesta state={state} dispatch={dispatch} />}
        {activeSection === 'historias' && <SeccionHistorias state={state} dispatch={dispatch} />}
        {activeSection === 'observacion' && <SeccionObservacion state={state} dispatch={dispatch} />}
        {activeSection === 'analisis' && <SeccionAnalisisDocumental state={state} dispatch={dispatch} />}
        {activeSection === 'resumen' && <SeccionResumen state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}

// Fix: useState not imported

