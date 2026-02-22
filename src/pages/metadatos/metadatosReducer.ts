// =============================================================
// TIPOS — definen la forma del estado global del formulario
// =============================================================

export type TipoSistema = 'web' | 'movil' | 'desktop' | 'hibrido';
export type DominioNegocio = 'salud' | 'educacion' | 'finanzas' | 'logistica' | 'otro';
export type TipoEntrevista = 'estructurada' | 'semi-estructurada' | 'no-estructurada' | '';
export type TipoPreguntas = 'cerradas' | 'abiertas' | 'mixtas' | '';
export type TipoObservacion = 'participante' | 'no-participante' | '';
export type EntornoObservacion = 'presencial' | 'remoto' | '';
export type OrigenDocumento = 'interno' | 'externo' | 'mixto' | '';
export type MetodoActivo = 'entrevista' | 'encuesta' | 'historiasDeUsuario' | 'observacion' | 'analisisDocumental';
export type Prioridad = 'alta' | 'media' | 'baja';

// ─── Detecciones genéricas de Herman ──────────────────────────
export interface Detecciones {
  entidades: string[];
  reglas: string[];
  modulos: string[];
  actores: string[];
}

// ─── Entrevista individual ────────────────────────────────────
export interface EntrevistaItem {
  id: string;                  // 'ENT-001'
  entrevistado: string;
  rol: string;
  fecha: string;
  duracionRealMin: number | '';
  fuenteAudio: string;
  transcripcion: string;
  detecciones: Detecciones;
  notas: string;
}

// ─── Resultado de encuesta importado ──────────────────────────
export interface ResultadoEncuesta {
  id: string;                  // 'ENC-001'
  nombreArchivo: string;
  plataformaOrigen: string;
  numFilas: number;
  columnas: string[];
  muestra: Record<string, string>[];
  detecciones: {
    patronesFrecuentes: string[];
    actores: string[];
    modulos: string[];
  };
  notas: string;
}

// ─── Observación individual ──────────────────────────────────
export interface ObservacionItem {
  id: string;                   // 'OBS-001'
  contexto: string;
  fecha: string;
  duracionRealMin: number | '';
  observador: string;
  archivoNombre: string;
  textoExtraido: string;
  detecciones: Detecciones & {
    friccionesDetectadas: string[];
    procesosIdentificados: string[];
    funcionalidadesSugeridas: string[];
  };
  notas: string;
}

// ─── Documento analizado ──────────────────────────────────────
export interface DocumentoAnalizado {
  id: string;                   // 'DOC-001'
  nombre: string;
  tipo: string;
  relevancia: Prioridad;
  archivoNombre: string;
  textoExtraido: string;
  paginasProcesadas: number;
  detecciones: Detecciones & { camposDetectados: string[] };
  notas: string;
}

// ─── Consolidado de detecciones ───────────────────────────────
export interface ConsolidadoDetecciones {
  entidades: string[];
  reglas: string[];
  modulos: string[];
  actores: string[];
}

// ─── Historia de usuario ──────────────────────────────────────
export interface HistoriaUsuario {
  id: string;
  rol: string;
  accion: string;
  beneficio: string;
  criteriosAceptacion: string;
  prioridad: Prioridad;
}

// ─── Documento revisado (legacy, para la config) ──────────────
export interface DocumentoRevisado {
  id: string;
  nombre: string;
  tipo: string;
  relevancia: Prioridad;
  notas: string;
}

// =============================================================
// ESTADOS de cada sección
// =============================================================
export interface ProyectoState {
  nombre: string;
  descripcion: string;
  tipoSistema: TipoSistema[];
  dominio: DominioNegocio | '';
  dominioPersonalizado: string;
  equipo: string;
  fechaInicio: string;
}

export interface EntrevistaState {
  tipo: TipoEntrevista;
  roles: string[];
  numEntrevistados: number | '';
  duracionMinutos: number | '';
  temasClave: string[];
  grabada: boolean;
  hallazgos: string;
  entrevistas: EntrevistaItem[];
}

export interface EncuestaState {
  objetivo: string;
  publicoObjetivo: string[];
  numRespuestas: number | '';
  tipoPreguntas: TipoPreguntas;
  plataforma: string;
  plataformaPersonalizada: string;
  fechaLimite: string;
  hallazgosEncuesta: string;
  patronesIdentificados: string[];
  resultados: ResultadoEncuesta[];
}

export interface HistoriasUsuarioState {
  roles: string[];
  historias: HistoriaUsuario[];
  criteriosGenerales: string;
}

export interface ObservacionState {
  tipo: TipoObservacion;
  entorno: EntornoObservacion;
  contexto: string;
  aspectosClave: string[];
  duracionMinutos: number | '';
  grabacion: boolean;
  hallazgosObservacion: string;
  friccionesIdentificadas: string[];
  observaciones: ObservacionItem[];
}

export interface AnalisisDocumentalState {
  tiposDocumento: string[];
  origen: OrigenDocumento;
  numDocumentos: number | '';
  formatos: string[];
  restricciones: string;
  documentosRevisados: DocumentoRevisado[];
  entidadesIdentificadas: string[];
  reglasNegocio: string[];
  hallazgosDocumental: string;
  documentos: DocumentoAnalizado[];
  consolidado: ConsolidadoDetecciones;
}

// Estado global
export interface MetadatosState {
  proyecto: ProyectoState;
  metodosActivos: MetodoActivo[];
  levantamiento: {
    entrevista: EntrevistaState;
    encuesta: EncuestaState;
    historiasDeUsuario: HistoriasUsuarioState;
    observacion: ObservacionState;
    analisisDocumental: AnalisisDocumentalState;
  };
}

// =============================================================
// ACCIONES
// =============================================================
export type MetadatosAction =
  // Proyecto
  | { type: 'SET_PROYECTO_FIELD'; field: keyof ProyectoState; value: ProyectoState[keyof ProyectoState] }
  | { type: 'TOGGLE_TIPO_SISTEMA'; value: TipoSistema }
  // Métodos activos
  | { type: 'TOGGLE_METODO'; metodo: MetodoActivo }
  // Entrevista — config
  | { type: 'SET_ENTREVISTA_FIELD'; field: keyof EntrevistaState; value: any }
  | { type: 'SET_ENTREVISTA_ROLES'; roles: string[] }
  | { type: 'SET_ENTREVISTA_TEMAS'; temas: string[] }
  // Entrevista — items
  | { type: 'ADD_ENTREVISTA_ITEM' }
  | { type: 'UPDATE_ENTREVISTA_ITEM'; id: string; campo: string; valor: any }
  | { type: 'REMOVE_ENTREVISTA_ITEM'; id: string }
  | { type: 'SET_ENTREVISTA_DETECCIONES'; id: string; detecciones: Detecciones }
  // Encuesta — config
  | { type: 'SET_ENCUESTA_FIELD'; field: keyof EncuestaState; value: any }
  | { type: 'SET_ENCUESTA_PUBLICO'; publico: string[] }
  | { type: 'SET_ENCUESTA_PATRONES'; patrones: string[] }
  // Encuesta — resultados
  | { type: 'ADD_ENCUESTA_RESULTADO'; resultado: ResultadoEncuesta }
  | { type: 'UPDATE_ENCUESTA_RESULTADO'; id: string; campo: string; valor: any }
  | { type: 'REMOVE_ENCUESTA_RESULTADO'; id: string }
  // Historias de usuario
  | { type: 'SET_HISTORIAS_FIELD'; field: keyof HistoriasUsuarioState; value: any }
  | { type: 'SET_HISTORIAS_ROLES'; roles: string[] }
  | { type: 'ADD_HISTORIA'; historia: HistoriaUsuario }
  | { type: 'REMOVE_HISTORIA'; id: string }
  | { type: 'UPDATE_HISTORIA'; historia: HistoriaUsuario }
  | { type: 'IMPORT_HISTORIAS'; historias: HistoriaUsuario[] }
  // Observación — config
  | { type: 'SET_OBSERVACION_FIELD'; field: keyof ObservacionState; value: any }
  | { type: 'SET_OBSERVACION_ASPECTOS'; aspectos: string[] }
  | { type: 'SET_OBSERVACION_FRICCIONES'; fricciones: string[] }
  // Observación — items
  | { type: 'ADD_OBSERVACION_ITEM' }
  | { type: 'UPDATE_OBSERVACION_ITEM'; id: string; campo: string; valor: any }
  | { type: 'REMOVE_OBSERVACION_ITEM'; id: string }
  // Análisis documental — config
  | { type: 'SET_ANALISIS_FIELD'; field: keyof AnalisisDocumentalState; value: any }
  | { type: 'TOGGLE_TIPO_DOCUMENTO'; value: string }
  | { type: 'TOGGLE_FORMATO'; value: string }
  | { type: 'ADD_DOCUMENTO_REVISADO'; doc: DocumentoRevisado }
  | { type: 'REMOVE_DOCUMENTO_REVISADO'; id: string }
  | { type: 'SET_ANALISIS_ENTIDADES'; entidades: string[] }
  | { type: 'SET_ANALISIS_REGLAS'; reglas: string[] }
  // Análisis documental — documentos analizados
  | { type: 'ADD_DOCUMENTO'; doc: DocumentoAnalizado }
  | { type: 'UPDATE_DOCUMENTO'; id: string; campo: string; valor: any }
  | { type: 'REMOVE_DOCUMENTO'; id: string }
  | { type: 'SET_DOCUMENTO_DETECCIONES'; id: string; detecciones: DocumentoAnalizado['detecciones'] }
  | { type: 'RECALCULAR_CONSOLIDADO' };

// =============================================================
// ESTADO INICIAL
// =============================================================
export const initialMetadatosState: MetadatosState = {
  proyecto: {
    nombre: '', descripcion: '', tipoSistema: [],
    dominio: '', dominioPersonalizado: '', equipo: '', fechaInicio: '',
  },
  metodosActivos: [],
  levantamiento: {
    entrevista: {
      tipo: '', roles: [], numEntrevistados: '', duracionMinutos: '',
      temasClave: [], grabada: false, hallazgos: '', entrevistas: [],
    },
    encuesta: {
      objetivo: '', publicoObjetivo: [], numRespuestas: '',
      tipoPreguntas: '', plataforma: '', plataformaPersonalizada: '',
      fechaLimite: '', hallazgosEncuesta: '', patronesIdentificados: [],
      resultados: [],
    },
    historiasDeUsuario: { roles: [], historias: [], criteriosGenerales: '' },
    observacion: {
      tipo: '', entorno: '', contexto: '', aspectosClave: [],
      duracionMinutos: '', grabacion: false, hallazgosObservacion: '',
      friccionesIdentificadas: [], observaciones: [],
    },
    analisisDocumental: {
      tiposDocumento: [], origen: '', numDocumentos: '', formatos: [],
      restricciones: '', documentosRevisados: [],
      entidadesIdentificadas: [], reglasNegocio: [], hallazgosDocumental: '',
      documentos: [],
      consolidado: { entidades: [], reglas: [], modulos: [], actores: [] },
    },
  },
};

// =============================================================
// HELPERS para IDs incrementales
// =============================================================
function nextId(prefix: string, items: { id: string }[]): string {
  const nums = items.map(i => {
    const n = parseInt(i.id.replace(`${prefix}-`, ''), 10);
    return isNaN(n) ? 0 : n;
  });
  return `${prefix}-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
}

const emptyDetecciones: Detecciones = { entidades: [], reglas: [], modulos: [], actores: [] };

// =============================================================
// REDUCER
// =============================================================
export function metadatosReducer(state: MetadatosState, action: MetadatosAction): MetadatosState {
  const { levantamiento: lev } = state;

  switch (action.type) {

    // ── Proyecto ───────────────────────────────────────────────
    case 'SET_PROYECTO_FIELD':
      return { ...state, proyecto: { ...state.proyecto, [action.field]: action.value } };

    case 'TOGGLE_TIPO_SISTEMA': {
      const existe = state.proyecto.tipoSistema.includes(action.value);
      return {
        ...state,
        proyecto: {
          ...state.proyecto,
          tipoSistema: existe
            ? state.proyecto.tipoSistema.filter(t => t !== action.value)
            : [...state.proyecto.tipoSistema, action.value],
        },
      };
    }

    // ── Métodos activos ───────────────────────────────────────
    case 'TOGGLE_METODO': {
      const activo = state.metodosActivos.includes(action.metodo);
      return {
        ...state,
        metodosActivos: activo
          ? state.metodosActivos.filter(m => m !== action.metodo)
          : [...state.metodosActivos, action.metodo],
      };
    }

    // ── Entrevista — config ───────────────────────────────────
    case 'SET_ENTREVISTA_FIELD':
      return { ...state, levantamiento: { ...lev, entrevista: { ...lev.entrevista, [action.field]: action.value } } };
    case 'SET_ENTREVISTA_ROLES':
      return { ...state, levantamiento: { ...lev, entrevista: { ...lev.entrevista, roles: action.roles } } };
    case 'SET_ENTREVISTA_TEMAS':
      return { ...state, levantamiento: { ...lev, entrevista: { ...lev.entrevista, temasClave: action.temas } } };

    // ── Entrevista — items ────────────────────────────────────
    case 'ADD_ENTREVISTA_ITEM': {
      const newItem: EntrevistaItem = {
        id: nextId('ENT', lev.entrevista.entrevistas),
        entrevistado: '', rol: '', fecha: '', duracionRealMin: '',
        fuenteAudio: '', transcripcion: '', detecciones: { ...emptyDetecciones }, notas: '',
      };
      return { ...state, levantamiento: { ...lev, entrevista: { ...lev.entrevista, entrevistas: [...lev.entrevista.entrevistas, newItem] } } };
    }
    case 'UPDATE_ENTREVISTA_ITEM': {
      const entrevistas = lev.entrevista.entrevistas.map(e =>
        e.id === action.id ? { ...e, [action.campo]: action.valor } : e
      );
      return { ...state, levantamiento: { ...lev, entrevista: { ...lev.entrevista, entrevistas } } };
    }
    case 'REMOVE_ENTREVISTA_ITEM': {
      const entrevistas = lev.entrevista.entrevistas.filter(e => e.id !== action.id);
      return { ...state, levantamiento: { ...lev, entrevista: { ...lev.entrevista, entrevistas } } };
    }
    case 'SET_ENTREVISTA_DETECCIONES': {
      const entrevistas = lev.entrevista.entrevistas.map(e =>
        e.id === action.id ? { ...e, detecciones: action.detecciones } : e
      );
      return { ...state, levantamiento: { ...lev, entrevista: { ...lev.entrevista, entrevistas } } };
    }

    // ── Encuesta — config ─────────────────────────────────────
    case 'SET_ENCUESTA_FIELD':
      return { ...state, levantamiento: { ...lev, encuesta: { ...lev.encuesta, [action.field]: action.value } } };
    case 'SET_ENCUESTA_PUBLICO':
      return { ...state, levantamiento: { ...lev, encuesta: { ...lev.encuesta, publicoObjetivo: action.publico } } };
    case 'SET_ENCUESTA_PATRONES':
      return { ...state, levantamiento: { ...lev, encuesta: { ...lev.encuesta, patronesIdentificados: action.patrones } } };

    // ── Encuesta — resultados ─────────────────────────────────
    case 'ADD_ENCUESTA_RESULTADO':
      return { ...state, levantamiento: { ...lev, encuesta: { ...lev.encuesta, resultados: [...lev.encuesta.resultados, action.resultado] } } };
    case 'UPDATE_ENCUESTA_RESULTADO': {
      const resultados = lev.encuesta.resultados.map(r =>
        r.id === action.id ? { ...r, [action.campo]: action.valor } : r
      );
      return { ...state, levantamiento: { ...lev, encuesta: { ...lev.encuesta, resultados } } };
    }
    case 'REMOVE_ENCUESTA_RESULTADO': {
      const resultados = lev.encuesta.resultados.filter(r => r.id !== action.id);
      return { ...state, levantamiento: { ...lev, encuesta: { ...lev.encuesta, resultados } } };
    }

    // ── Historias de usuario ───────────────────────────────────
    case 'SET_HISTORIAS_FIELD':
      return { ...state, levantamiento: { ...lev, historiasDeUsuario: { ...lev.historiasDeUsuario, [action.field]: action.value } } };
    case 'SET_HISTORIAS_ROLES':
      return { ...state, levantamiento: { ...lev, historiasDeUsuario: { ...lev.historiasDeUsuario, roles: action.roles } } };
    case 'ADD_HISTORIA':
      return { ...state, levantamiento: { ...lev, historiasDeUsuario: { ...lev.historiasDeUsuario, historias: [...lev.historiasDeUsuario.historias, action.historia] } } };
    case 'REMOVE_HISTORIA':
      return { ...state, levantamiento: { ...lev, historiasDeUsuario: { ...lev.historiasDeUsuario, historias: lev.historiasDeUsuario.historias.filter(h => h.id !== action.id) } } };
    case 'UPDATE_HISTORIA': {
      const historias = lev.historiasDeUsuario.historias.map(h =>
        h.id === action.historia.id ? action.historia : h
      );
      return { ...state, levantamiento: { ...lev, historiasDeUsuario: { ...lev.historiasDeUsuario, historias } } };
    }
    case 'IMPORT_HISTORIAS':
      return { ...state, levantamiento: { ...lev, historiasDeUsuario: { ...lev.historiasDeUsuario, historias: [...lev.historiasDeUsuario.historias, ...action.historias] } } };

    // ── Observación — config ──────────────────────────────────
    case 'SET_OBSERVACION_FIELD':
      return { ...state, levantamiento: { ...lev, observacion: { ...lev.observacion, [action.field]: action.value } } };
    case 'SET_OBSERVACION_ASPECTOS':
      return { ...state, levantamiento: { ...lev, observacion: { ...lev.observacion, aspectosClave: action.aspectos } } };
    case 'SET_OBSERVACION_FRICCIONES':
      return { ...state, levantamiento: { ...lev, observacion: { ...lev.observacion, friccionesIdentificadas: action.fricciones } } };

    // ── Observación — items ───────────────────────────────────
    case 'ADD_OBSERVACION_ITEM': {
      const newItem: ObservacionItem = {
        id: nextId('OBS', lev.observacion.observaciones),
        contexto: '', fecha: '', duracionRealMin: '', observador: '',
        archivoNombre: '', textoExtraido: '',
        detecciones: {
          ...emptyDetecciones,
          friccionesDetectadas: [], procesosIdentificados: [], funcionalidadesSugeridas: [],
        },
        notas: '',
      };
      return { ...state, levantamiento: { ...lev, observacion: { ...lev.observacion, observaciones: [...lev.observacion.observaciones, newItem] } } };
    }
    case 'UPDATE_OBSERVACION_ITEM': {
      const observaciones = lev.observacion.observaciones.map(o =>
        o.id === action.id ? { ...o, [action.campo]: action.valor } : o
      );
      return { ...state, levantamiento: { ...lev, observacion: { ...lev.observacion, observaciones } } };
    }
    case 'REMOVE_OBSERVACION_ITEM': {
      const observaciones = lev.observacion.observaciones.filter(o => o.id !== action.id);
      return { ...state, levantamiento: { ...lev, observacion: { ...lev.observacion, observaciones } } };
    }

    // ── Análisis documental — config ──────────────────────────
    case 'SET_ANALISIS_FIELD':
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, [action.field]: action.value } } };
    case 'TOGGLE_TIPO_DOCUMENTO': {
      const existe = lev.analisisDocumental.tiposDocumento.includes(action.value);
      return {
        ...state, levantamiento: {
          ...lev, analisisDocumental: {
            ...lev.analisisDocumental,
            tiposDocumento: existe
              ? lev.analisisDocumental.tiposDocumento.filter(d => d !== action.value)
              : [...lev.analisisDocumental.tiposDocumento, action.value],
          }
        },
      };
    }
    case 'TOGGLE_FORMATO': {
      const existe = lev.analisisDocumental.formatos.includes(action.value);
      return {
        ...state, levantamiento: {
          ...lev, analisisDocumental: {
            ...lev.analisisDocumental,
            formatos: existe
              ? lev.analisisDocumental.formatos.filter(f => f !== action.value)
              : [...lev.analisisDocumental.formatos, action.value],
          }
        },
      };
    }
    case 'ADD_DOCUMENTO_REVISADO':
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, documentosRevisados: [...lev.analisisDocumental.documentosRevisados, action.doc] } } };
    case 'REMOVE_DOCUMENTO_REVISADO':
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, documentosRevisados: lev.analisisDocumental.documentosRevisados.filter(d => d.id !== action.id) } } };
    case 'SET_ANALISIS_ENTIDADES':
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, entidadesIdentificadas: action.entidades } } };
    case 'SET_ANALISIS_REGLAS':
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, reglasNegocio: action.reglas } } };

    // ── Análisis documental — documentos analizados ───────────
    case 'ADD_DOCUMENTO':
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, documentos: [...lev.analisisDocumental.documentos, action.doc] } } };
    case 'UPDATE_DOCUMENTO': {
      const documentos = lev.analisisDocumental.documentos.map(d =>
        d.id === action.id ? { ...d, [action.campo]: action.valor } : d
      );
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, documentos } } };
    }
    case 'REMOVE_DOCUMENTO': {
      const documentos = lev.analisisDocumental.documentos.filter(d => d.id !== action.id);
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, documentos } } };
    }
    case 'SET_DOCUMENTO_DETECCIONES': {
      const documentos = lev.analisisDocumental.documentos.map(d =>
        d.id === action.id ? { ...d, detecciones: action.detecciones } : d
      );
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, documentos } } };
    }
    case 'RECALCULAR_CONSOLIDADO': {
      const all = lev.analisisDocumental.documentos;
      const consolidado: ConsolidadoDetecciones = {
        entidades: [...new Set(all.flatMap(d => d.detecciones.entidades))],
        reglas: [...new Set(all.flatMap(d => d.detecciones.reglas))],
        modulos: [...new Set(all.flatMap(d => d.detecciones.modulos))],
        actores: [...new Set(all.flatMap(d => d.detecciones.actores))],
      };
      return { ...state, levantamiento: { ...lev, analisisDocumental: { ...lev.analisisDocumental, consolidado } } };
    }

    default:
      return state;
  }
}

// =============================================================
// HELPER — buildOutputJson
// =============================================================
function omit<T extends Record<string, any>>(obj: T, keys: string[]): Partial<T> {
  const result = { ...obj };
  for (const k of keys) delete (result as any)[k];
  return result;
}

function calcularInferenciasGlobales(state: MetadatosState) {
  const todas = {
    entidades: new Set<string>(),
    reglas: new Set<string>(),
    modulos: new Set<string>(),
    actores: new Set<string>(),
  };

  // De entrevistas
  state.levantamiento.entrevista.entrevistas.forEach(e => {
    e.detecciones.entidades.forEach(x => todas.entidades.add(x));
    e.detecciones.reglas.forEach(x => todas.reglas.add(x));
    e.detecciones.modulos.forEach(x => todas.modulos.add(x));
    e.detecciones.actores.forEach(x => todas.actores.add(x));
  });

  // Del consolidado de análisis documental (el más rico)
  const cons = state.levantamiento.analisisDocumental.consolidado;
  cons.entidades.forEach(x => todas.entidades.add(x));
  cons.reglas.forEach(x => todas.reglas.add(x));
  cons.modulos.forEach(x => todas.modulos.add(x));
  cons.actores.forEach(x => todas.actores.add(x));

  // De observaciones
  state.levantamiento.observacion.observaciones.forEach(o => {
    o.detecciones.actores.forEach(x => todas.actores.add(x));
    o.detecciones.entidades.forEach(x => todas.entidades.add(x));
    o.detecciones.procesosIdentificados.forEach(x => todas.modulos.add(x));
  });

  // De encuestas
  state.levantamiento.encuesta.resultados.forEach(r => {
    r.detecciones.actores.forEach(x => todas.actores.add(x));
    r.detecciones.modulos.forEach(x => todas.modulos.add(x));
  });

  // Actores de historias de usuario
  state.levantamiento.historiasDeUsuario.roles.forEach(r => todas.actores.add(r));

  // Entidades y reglas manuales de análisis documental
  state.levantamiento.analisisDocumental.entidadesIdentificadas.forEach(x => todas.entidades.add(x));
  state.levantamiento.analisisDocumental.reglasNegocio.forEach(x => todas.reglas.add(x));

  return {
    entidadesUnificadas: [...todas.entidades],
    reglasUnificadas: [...todas.reglas],
    modulosUnificados: [...todas.modulos],
    actoresUnificados: [...todas.actores],
  };
}

export function buildOutputJson(state: MetadatosState) {
  const { proyecto, metodosActivos, levantamiento } = state;
  const lev: Record<string, unknown> = {};

  if (metodosActivos.includes('entrevista')) {
    lev.entrevista = {
      configuracion: omit(levantamiento.entrevista, ['entrevistas']),
      entrevistas: levantamiento.entrevista.entrevistas.map(e => ({
        id: e.id, entrevistado: e.entrevistado, rol: e.rol,
        fecha: e.fecha, duracionRealMin: e.duracionRealMin,
        detecciones: e.detecciones, notas: e.notas,
        transcripcion: e.transcripcion.length < 10000
          ? e.transcripcion
          : e.transcripcion.substring(0, 5000) + '\n[...truncado...]',
      })),
    };
  }

  if (metodosActivos.includes('encuesta')) {
    lev.encuesta = {
      configuracion: omit(levantamiento.encuesta, ['resultados']),
      resultados: levantamiento.encuesta.resultados,
    };
  }

  if (metodosActivos.includes('historiasDeUsuario')) {
    lev.historiasDeUsuario = levantamiento.historiasDeUsuario;
  }

  if (metodosActivos.includes('observacion')) {
    lev.observacion = {
      configuracion: omit(levantamiento.observacion, ['observaciones']),
      observaciones: levantamiento.observacion.observaciones.map(o => ({
        ...o,
        textoExtraido: undefined, // no incluir texto completo
      })),
    };
  }

  if (metodosActivos.includes('analisisDocumental')) {
    lev.analisisDocumental = {
      configuracion: omit(levantamiento.analisisDocumental, ['documentos', 'consolidado']),
      documentos: levantamiento.analisisDocumental.documentos.map(d => ({
        ...d,
        textoExtraido: undefined, // no incluir texto completo
      })),
      consolidado: levantamiento.analisisDocumental.consolidado,
    };
  }

  return {
    proyecto: {
      nombre: proyecto.nombre, descripcion: proyecto.descripcion,
      tipoSistema: proyecto.tipoSistema,
      dominio: proyecto.dominio === 'otro' ? proyecto.dominioPersonalizado : proyecto.dominio,
      equipo: proyecto.equipo, fechaInicio: proyecto.fechaInicio,
    },
    metodosActivos,
    levantamiento: lev,
    inferenciasGlobales: calcularInferenciasGlobales(state),
  };
}

// =============================================================
// HELPER — progreso de secciones (0=vacía, 1=incompleta, 2=completa)
// =============================================================
export function calcularProgresoSecciones(state: MetadatosState) {
  const { proyecto, metodosActivos, levantamiento } = state;

  const llenos = (campos: unknown[]) =>
    campos.filter(c => {
      if (Array.isArray(c)) return c.length > 0;
      if (typeof c === 'boolean') return true;
      return c !== '' && c !== undefined && c !== null;
    }).length;

  const estado = (n: number, max: number, activo = true): 0 | 1 | 2 => {
    if (!activo) return 0;
    if (n === 0) return 0;
    if (n >= max) return 2;
    return 1;
  };

  const e = levantamiento.entrevista;
  const enc = levantamiento.encuesta;
  const h = levantamiento.historiasDeUsuario;
  const o = levantamiento.observacion;
  const d = levantamiento.analisisDocumental;

  const s1 = llenos([proyecto.nombre, proyecto.descripcion, proyecto.dominio, proyecto.equipo, proyecto.fechaInicio]) + (proyecto.tipoSistema.length > 0 ? 1 : 0);

  return {
    seccion1: estado(s1, 6),
    seccion2: estado(metodosActivos.length, 1),
    seccion3: estado(llenos([e.tipo, e.roles, e.numEntrevistados, e.temasClave, e.entrevistas]), 5, metodosActivos.includes('entrevista')),
    seccion4: estado(llenos([enc.objetivo, enc.publicoObjetivo, enc.tipoPreguntas, enc.patronesIdentificados]), 4, metodosActivos.includes('encuesta')),
    seccion5: estado(llenos([h.roles, h.historias]), 2, metodosActivos.includes('historiasDeUsuario')),
    seccion6: estado(llenos([o.tipo, o.entorno, o.contexto, o.aspectosClave, o.observaciones]), 5, metodosActivos.includes('observacion')),
    seccion7: estado(llenos([d.tiposDocumento, d.origen, d.entidadesIdentificadas, d.documentos]), 4, metodosActivos.includes('analisisDocumental')),
    seccion8: 0 as 0 | 1 | 2,
  };
}
