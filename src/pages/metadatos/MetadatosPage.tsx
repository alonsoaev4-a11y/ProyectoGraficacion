// MetadatosPage — Formulario de metadatos embebido dentro del layout de proyecto
// Sin header propio ni mini-sidebar — usa el layout de DetalleProyecto como contenedor
// La Sección 1 (Información General) se pre-carga con los datos del proyecto existente

import { useReducer, useEffect, useState } from 'react';
import { metadatosReducer, calcularProgresoSecciones, MetadatosState } from './metadatosReducer';

import { SeccionInfoGeneral } from './secciones/SeccionInfoGeneral';
import { SeccionMetodos } from './secciones/SeccionMetodos';
import { SeccionEntrevista } from './secciones/SeccionEntrevista';
import { SeccionEncuesta } from './secciones/SeccionEncuesta';
import { SeccionHistorias } from './secciones/SeccionHistorias';
import { SeccionObservacion } from './secciones/SeccionObservacion';
import { SeccionAnalisisDocumental } from './secciones/SeccionAnalisisDocumental';
import { SeccionResumen } from './secciones/SeccionResumen';
import { ConfiguracionAPIKeys } from '../../components/ConfiguracionAPIKeys';

import './metadatos.css';
import { CheckCircle, AlertCircle, Circle, Settings } from 'lucide-react';

// ─── Datos simulados realistas por tipo de dominio ───────────────────────────
// Infiere el dominio del proyecto y genera una descripción convincente
function inferirDominio(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('hospit') || n.includes('clínic') || n.includes('médic') || n.includes('salud')) return 'salud';
    if (n.includes('educ') || n.includes('escuel') || n.includes('alumno') || n.includes('academ')) return 'educacion';
    if (n.includes('financ') || n.includes('banco') || n.includes('pago') || n.includes('contab')) return 'finanzas';
    if (n.includes('logíst') || n.includes('inventari') || n.includes('almacén') || n.includes('bodega')) return 'logistica';
    return 'otro'; // rrhh no es un DominioNegocio válido — cae en 'otro'
}

function generarDescripcion(nombre: string): string {
    const dom = inferirDominio(nombre);
    const descs: Record<string, string> = {
        salud: `Sistema integral para la gestión de procesos hospitalarios, incluyendo admisión de pacientes, gestión de camas, control de medicamentos y registro histórico de expedientes clínicos. Orientado a personal médico, administrativo y de enfermería.`,
        educacion: `Plataforma para la administración académica y gestión de recursos educativos. Automatiza procesos de inscripción, seguimiento de calificaciones, control de asistencia y generación de reportes para coordinadores y docentes.`,
        finanzas: `Módulo de gestión financiera y contable para el registro de transacciones, control presupuestal, generación de estados de cuenta y reportes regulatorios. Diseñado para equipos de finanzas y administración.`,
        logistica: `Sistema de control de inventario y logística de distribución. Gestiona entradas, salidas, trazabilidad de productos, pedidos a proveedores y alertas de stock mínimo en tiempo real.`,
        rrhh: `Plataforma de recursos humanos para la gestión del ciclo de vida del empleado: contratación, nómina, control de asistencia, evaluaciones de desempeño y generación de reportes de plantilla.`,
        otro: `${nombre}: sistema de software diseñado para digitalizar y automatizar procesos operativos clave de la organización, mejorando la eficiencia, trazabilidad y toma de decisiones basada en datos.`,
    };
    return descs[dom] || descs.otro;
}

// Crea el estado inicial del reducer a partir del proyecto del dashboard
function crearEstadoInicial(project: any): MetadatosState {
    const nombre: string = project?.name || '';
    const dominio = inferirDominio(nombre);

    return {
        proyecto: {
            nombre,
            descripcion: generarDescripcion(nombre),
            tipoSistema: ['web'],
            dominio: dominio as any,
            dominioPersonalizado: '',
            equipo: 'Equipo de Desarrollo Herman',
            fechaInicio: '2026-02-13',
        },
        metodosActivos: [],
        levantamiento: {
            entrevista: {
                tipo: 'estructurada', roles: [], numEntrevistados: '',
                duracionMinutos: '', temasClave: [], grabada: false, hallazgos: '',
                entrevistas: [],
            },
            encuesta: {
                objetivo: '', publicoObjetivo: [], numRespuestas: '',
                tipoPreguntas: 'cerradas', plataforma: '', plataformaPersonalizada: '',
                fechaLimite: '', hallazgosEncuesta: '', patronesIdentificados: [],
                resultados: [],
            },
            historiasDeUsuario: { roles: [], historias: [], criteriosGenerales: '' },
            observacion: {
                tipo: 'no-participante', entorno: 'presencial', contexto: '',
                aspectosClave: [], duracionMinutos: '', grabacion: false,
                hallazgosObservacion: '', friccionesIdentificadas: [],
                observaciones: [],
            },
            analisisDocumental: {
                tiposDocumento: [], origen: 'interno', numDocumentos: '',
                formatos: [], restricciones: '', documentosRevisados: [],
                entidadesIdentificadas: [], reglasNegocio: [], hallazgosDocumental: '',
                documentos: [],
                consolidado: { entidades: [], reglas: [], modulos: [], actores: [] },
            },
        },
    };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    project?: any; // datos del proyecto provenientes de DetalleProyecto
    onMetodosChange?: (metodos: string[]) => void;
}

// ─── Sub-componentes de presentación ─────────────────────────────────────────

// Etiqueta visual de progreso de sección
const BadgeProgreso = ({ estado }: { estado: 0 | 1 | 2 }) => {
    if (estado === 2) return <span className="meta-badge complete"><CheckCircle size={12} /> Completa</span>;
    if (estado === 1) return <span className="meta-badge partial"><AlertCircle size={12} /> Incompleta</span>;
    return <span className="meta-badge empty"><Circle size={12} /> Sin llenar</span>;
};

// Wrapper visual de sección con número, título y badge de progreso
const SeccionPanel = ({
    numero,
    titulo,
    subtitulo,
    estado,
    id,
    children,
}: {
    numero: number;
    titulo: string;
    subtitulo?: string;
    estado?: 0 | 1 | 2;
    id: string;
    children: React.ReactNode;
}) => (
    <section id={id} className="meta-section-flat">
        {/* Cabecera de la sección */}
        <div className="meta-section-flat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div className="meta-section-number">{numero}</div>
                <div>
                    <h2 className="meta-section-title">{titulo}</h2>
                    {subtitulo && <p className="meta-section-subtitle">{subtitulo}</p>}
                </div>
            </div>
            {estado !== undefined && <BadgeProgreso estado={estado} />}
        </div>

        {/* Contenido de la sección */}
        <div className="meta-section-flat-body">
            {children}
        </div>
    </section>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const MetadatosPage = ({ project, onMetodosChange }: Props) => {
    const [state, dispatch] = useReducer(metadatosReducer, project, crearEstadoInicial);
    const [configAbierta, setConfigAbierta] = useState(false);

    useEffect(() => {
        onMetodosChange?.(state.metodosActivos);
    }, [state.metodosActivos]);

    const progreso = calcularProgresoSecciones(state);

    return (
        <div className="meta-flat-layout">

            {/* Botón de configuración de API keys */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
                <button onClick={() => setConfigAbierta(true)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                    borderRadius: '8px', border: '1px solid rgba(0,171,191,0.2)', background: 'rgba(0,171,191,0.04)',
                    color: '#007a8a', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                }}>
                    <Settings size={14} /> Configurar Groq API
                </button>
            </div>

            <ConfiguracionAPIKeys abierto={configAbierta} onCerrar={() => setConfigAbierta(false)} />

            {/* Sección 1 — Información General (pre-cargada con datos del proyecto) */}
            <SeccionPanel
                id="meta-s1"
                numero={1}
                titulo="Información General del Proyecto"
                subtitulo="Datos capturados al crear el proyecto — puedes editarlos"
                estado={progreso.seccion1}
            >
                <SeccionInfoGeneral proyecto={state.proyecto} dispatch={dispatch} />
            </SeccionPanel>

            {/* Sección 2 — Métodos de Levantamiento */}
            <SeccionPanel
                id="meta-s2"
                numero={2}
                titulo="Métodos de Levantamiento de Información"
                subtitulo="Activa las técnicas que usarás para capturar los requerimientos"
                estado={progreso.seccion2}
            >
                <SeccionMetodos metodosActivos={state.metodosActivos} dispatch={dispatch} levantamiento={state.levantamiento} />
            </SeccionPanel>

            {/* Sección 3 — Entrevista */}
            <SeccionPanel
                id="meta-s3"
                numero={3}
                titulo="Configuración: Entrevista"
                estado={state.metodosActivos.includes('entrevista') ? progreso.seccion3 : undefined}
            >
                <SeccionEntrevista
                    entrevista={state.levantamiento.entrevista}
                    activo={state.metodosActivos.includes('entrevista')}
                    dispatch={dispatch}
                    onAbrirConfig={() => setConfigAbierta(true)}
                />
            </SeccionPanel>

            {/* Sección 4 — Encuesta */}
            <SeccionPanel
                id="meta-s4"
                numero={4}
                titulo="Configuración: Encuesta"
                estado={state.metodosActivos.includes('encuesta') ? progreso.seccion4 : undefined}
            >
                <SeccionEncuesta
                    encuesta={state.levantamiento.encuesta}
                    activo={state.metodosActivos.includes('encuesta')}
                    dispatch={dispatch}
                />
            </SeccionPanel>

            {/* Sección 5 — Historias de Usuario */}
            <SeccionPanel
                id="meta-s5"
                numero={5}
                titulo="Configuración: Historias de Usuario"
                estado={state.metodosActivos.includes('historiasDeUsuario') ? progreso.seccion5 : undefined}
            >
                <SeccionHistorias
                    historias={state.levantamiento.historiasDeUsuario}
                    activo={state.metodosActivos.includes('historiasDeUsuario')}
                    dispatch={dispatch}
                />
            </SeccionPanel>

            {/* Sección 6 — Observación */}
            <SeccionPanel
                id="meta-s6"
                numero={6}
                titulo="Configuración: Observación"
                estado={state.metodosActivos.includes('observacion') ? progreso.seccion6 : undefined}
            >
                <SeccionObservacion
                    observacion={state.levantamiento.observacion}
                    activo={state.metodosActivos.includes('observacion')}
                    dispatch={dispatch}
                />
            </SeccionPanel>

            {/* Sección 7 — Análisis Documental */}
            <SeccionPanel
                id="meta-s7"
                numero={7}
                titulo="Configuración: Análisis Documental"
                estado={state.metodosActivos.includes('analisisDocumental') ? progreso.seccion7 : undefined}
            >
                <SeccionAnalisisDocumental
                    analisis={state.levantamiento.analisisDocumental}
                    activo={state.metodosActivos.includes('analisisDocumental')}
                    dispatch={dispatch}
                />
            </SeccionPanel>

            {/* Sección 8 — Resumen JSON */}
            <SeccionPanel
                id="meta-s8"
                numero={8}
                titulo="Resumen de Metadatos"
                subtitulo="JSON generado para alimentar el motor de generación de código"
            >
                <SeccionResumen state={state} />
            </SeccionPanel>

        </div>
    );
};
