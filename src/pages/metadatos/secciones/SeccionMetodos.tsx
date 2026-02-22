// Sección 2 — Selección de Métodos de Levantamiento
// 5 cards visuales con toggle de activación para cada método

import { MetadatosAction, MetodoActivo, MetadatosState } from '../metadatosReducer';
import { MessageSquare, ClipboardList, BookOpen, Eye, FileSearch } from 'lucide-react';

interface Props {
    metodosActivos: MetodoActivo[];
    dispatch: React.Dispatch<MetadatosAction>;
    levantamiento: MetadatosState['levantamiento'];
}

// Definición de los 5 métodos de levantamiento
const METODOS: {
    id: MetodoActivo;
    nombre: string;
    descripcion: string;
    icono: React.ReactNode;
}[] = [
        {
            id: 'entrevista',
            nombre: 'Entrevista',
            descripcion: 'Conversaciones directas con stakeholders y usuarios finales para extraer requerimientos.',
            icono: <MessageSquare size={20} />,
        },
        {
            id: 'encuesta',
            nombre: 'Encuesta',
            descripcion: 'Recolección masiva de requisitos o preferencias mediante formularios estructurados.',
            icono: <ClipboardList size={20} />,
        },
        {
            id: 'historiasDeUsuario',
            nombre: 'Historias de Usuario',
            descripcion: 'Definición de funcionalidades desde la perspectiva del usuario del sistema.',
            icono: <BookOpen size={20} />,
        },
        {
            id: 'observacion',
            nombre: 'Observación',
            descripcion: 'Análisis del comportamiento real del usuario en su entorno de trabajo.',
            icono: <Eye size={20} />,
        },
        {
            id: 'analisisDocumental',
            nombre: 'Análisis Documental',
            descripcion: 'Revisión de documentos existentes como manuales, reportes y normativas.',
            icono: <FileSearch size={20} />,
        },
    ];

export const SeccionMetodos = ({ metodosActivos, dispatch, levantamiento }: Props) => {

    const tieneDatos = (id: MetodoActivo): boolean => {
        const l = levantamiento;
        switch (id) {
            case 'entrevista':
                return l.entrevista.roles.length > 0 || l.entrevista.temasClave.length > 0 || !!l.entrevista.hallazgos || l.entrevista.entrevistas.length > 0;
            case 'encuesta':
                return !!l.encuesta.objetivo || l.encuesta.publicoObjetivo.length > 0 || l.encuesta.resultados.length > 0;
            case 'historiasDeUsuario':
                return l.historiasDeUsuario.historias.length > 0 || l.historiasDeUsuario.roles.length > 0;
            case 'observacion':
                return l.observacion.aspectosClave.length > 0 || l.observacion.observaciones.length > 0 || !!l.observacion.hallazgosObservacion;
            case 'analisisDocumental':
                return l.analisisDocumental.documentos.length > 0 || l.analisisDocumental.entidadesIdentificadas.length > 0;
            default: return false;
        }
    };

    const toggleMetodo = (metodo: MetodoActivo) => {
        const estaActivo = metodosActivos.includes(metodo);
        if (estaActivo && tieneDatos(metodo)) {
            const ok = window.confirm(`El método "${metodo}" tiene datos ingresados. Si lo desactivas, los datos se ocultarán pero se mantendrán. ¿Continuar?`);
            if (!ok) return;
        }
        dispatch({ type: 'TOGGLE_METODO', metodo });
    };

    return (
        <div>
            <p style={{ fontSize: '0.85rem', color: '#7070a0', marginBottom: '18px', lineHeight: '1.5' }}>
                Selecciona los métodos que usarás para capturar los requerimientos de este proyecto.
                Al activar un método, su sección de configuración se desbloqueará más abajo.
            </p>

            <div className="meta-methods-grid">
                {METODOS.map(metodo => {
                    const estaActivo = metodosActivos.includes(metodo.id);
                    return (
                        <div
                            key={metodo.id}
                            className={`meta-method-card ${estaActivo ? 'active' : ''}`}
                            onClick={() => toggleMetodo(metodo.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && toggleMetodo(metodo.id)}
                            aria-pressed={estaActivo}
                        >
                            {/* Toggle visual */}
                            <button
                                type="button"
                                className="meta-method-toggle"
                                aria-label={`${estaActivo ? 'Desactivar' : 'Activar'} ${metodo.nombre}`}
                                onClick={e => { e.stopPropagation(); toggleMetodo(metodo.id); }}
                            />

                            {/* Ícono */}
                            <div className="meta-method-icon">
                                {metodo.icono}
                            </div>

                            {/* Nombre y descripción */}
                            <p className="meta-method-name">{metodo.nombre}</p>
                            <p className="meta-method-desc">{metodo.descripcion}</p>
                        </div>
                    );
                })}
            </div>

            {/* Resumen de métodos activos */}
            {metodosActivos.length > 0 && (
                <div style={{
                    marginTop: '18px',
                    padding: '10px 16px',
                    background: 'rgba(0, 171, 191, 0.04)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 171, 191, 0.12)',
                    fontSize: '0.82rem',
                    color: '#007a8a',
                }}>
                    ✓ {metodosActivos.length} método{metodosActivos.length > 1 ? 's' : ''} activo{metodosActivos.length > 1 ? 's' : ''}.
                    {' '}Las secciones correspondientes se encuentran desbloqueadas abajo.
                </div>
            )}
        </div>
    );
};
