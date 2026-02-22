// Sección 8 — Resumen de Metadatos
// Panel de solo lectura que consolida todo en tiempo real + botón Generar Proyecto

import { MetadatosState, buildOutputJson, calcularProgresoSecciones } from '../metadatosReducer';
import { JsonPreview } from '../components/JsonPreview';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    state: MetadatosState;
}

// Mapeo de secciones para la lista de completitud
const SECCIONES_INFO = [
    { key: 'seccion1', label: 'Información General' },
    { key: 'seccion2', label: 'Métodos de Levantamiento' },
    { key: 'seccion3', label: 'Entrevista' },
    { key: 'seccion4', label: 'Encuesta' },
    { key: 'seccion5', label: 'Historias de Usuario' },
    { key: 'seccion6', label: 'Observación' },
    { key: 'seccion7', label: 'Análisis Documental' },
] as const;

export const SeccionResumen = ({ state }: Props) => {
    // Construye el JSON de salida en tiempo real
    const outputJson = buildOutputJson(state);

    // Calcula el progreso de todas las secciones
    const progreso = calcularProgresoSecciones(state);

    // Cuenta secciones activas (filtradas por metodosActivos)
    const { metodosActivos } = state;
    const seccionesAplicables = [
        progreso.seccion1,  // siempre aplica
        progreso.seccion2,  // siempre aplica
        metodosActivos.includes('entrevista') ? progreso.seccion3 : null,
        metodosActivos.includes('encuesta') ? progreso.seccion4 : null,
        metodosActivos.includes('historiasDeUsuario') ? progreso.seccion5 : null,
        metodosActivos.includes('observacion') ? progreso.seccion6 : null,
        metodosActivos.includes('analisisDocumental') ? progreso.seccion7 : null,
    ].filter(s => s !== null) as (0 | 1 | 2)[];

    const totalAplicables = seccionesAplicables.length;
    const completadas = seccionesAplicables.filter(s => s === 2).length;
    const porcentaje = totalAplicables > 0 ? Math.round((completadas / totalAplicables) * 100) : 0;

    // Descarga el JSON como archivo .json en el navegador
    const handleExportarJson = () => {
        const json = JSON.stringify(outputJson, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metadatos-${state.proyecto.nombre.replace(/\s+/g, '-').toLowerCase() || 'proyecto'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            {/* Indicador de completitud */}
            <div className="cyber-card" style={{ padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e' }}>
                        Completitud del formulario
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#00abbf' }}>
                        {completadas} de {totalAplicables} secciones completas
                    </span>
                </div>
                <div className="meta-progreso-bar">
                    <div
                        className="meta-progreso-fill"
                        style={{ width: `${porcentaje}%` }}
                    />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.77rem', color: '#9090a0' }}>
                    {porcentaje}% completado
                </p>

                {/* Lista de secciones con estado */}
                <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SECCIONES_INFO.map(sec => {
                        const estado = progreso[sec.key];
                        const esAplicable =
                            sec.key === 'seccion1' || sec.key === 'seccion2' ||
                            (sec.key === 'seccion3' && metodosActivos.includes('entrevista')) ||
                            (sec.key === 'seccion4' && metodosActivos.includes('encuesta')) ||
                            (sec.key === 'seccion5' && metodosActivos.includes('historiasDeUsuario')) ||
                            (sec.key === 'seccion6' && metodosActivos.includes('observacion')) ||
                            (sec.key === 'seccion7' && metodosActivos.includes('analisisDocumental'));

                        if (!esAplicable) return null;

                        const color = estado === 2 ? '#10b981' : estado === 1 ? '#f59e0b' : '#9090a0';
                        const Icono = estado === 2 ? CheckCircle : AlertCircle;

                        return (
                            <div
                                key={sec.key}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    fontSize: '0.78rem', color,
                                    padding: '4px 10px', borderRadius: '12px',
                                    background: `${color}12`, border: `1px solid ${color}30`,
                                }}
                            >
                                <Icono size={13} />
                                {sec.label}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Botón Exportar JSON — descarga real del archivo */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    type="button"
                    onClick={handleExportarJson}
                    className="cyber-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', padding: '11px 24px' }}
                >
                    <Download size={17} />
                    Exportar JSON
                </button>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                    maxWidth: '420px',
                }}>
                    <span style={{ fontSize: '0.78rem', color: '#92400e' }}>
                        ⚠️ La <strong>generación automática de código</strong> estará disponible cuando el backend esté listo.
                        Por ahora puedes exportar el JSON y usarlo manualmente.
                    </span>
                </div>
            </div>

            {/* Vista previa del JSON */}
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px' }}>
                    JSON de metadatos generado
                </h3>
                <JsonPreview
                    data={outputJson}
                    filename={`proyecto-${state.proyecto.nombre.replace(/\s+/g, '-').toLowerCase() || 'sin-nombre'}`}
                />
            </div>
        </div>
    );
};
