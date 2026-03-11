// ============================================================
// metadatosReducer.ts — Estado global del módulo Metadatos
// ============================================================

export interface EncuestaPregunta {
  id: string;
  tipo: 'abierta' | 'multiple' | 'escala' | 'sino';
  texto: string;
  opciones?: string[];
  respuesta?: string;
  respuestas?: string[];
  valorEscala?: number;
  valorSiNo?: boolean;
}

export interface Encuesta {
  id: string;
  titulo: string;
  descripcion: string;
  preguntas: EncuestaPregunta[];
}

export interface PreguntaEntrevista {
  id: string;
  texto: string;
  categoria: string;
  respuesta: string;
}

export interface EntrevistaItem {
  id: string;
  nombre: string;
  rol: string;
  fecha: string;
  duracion: string;
  lugar: string;
  preguntas: PreguntaEntrevista[];
  hallazgos: string;
}

export interface HistoriaUsuario {
  id: string;
  comoUnA: string;
  necesito: string;
  paraPoder: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En progreso' | 'Completada';
  criteriosAceptacion: string[];
}

export interface SessionObservacion {
  id: string;
  fecha: string;
  duracion: string;
  lugar: string;
  participantes: string;
  objetivo: string;
  hallazgos: string;
  comportamientoObservado: string;
  dolorObservado: string;
}

export interface MetadatosState {
  // Info General
  nombreProyecto: string;
  descripcionProyecto: string;
  tipoApp: string;
  industria: string;
  plataforma: string[];
  // Entrevistas
  entrevistas: EntrevistaItem[];
  hallazgosEntrevista: string;
  // Encuestas
  encuestas: Encuesta[];
  hallazgosEncuesta: string;
  // Historias
  historias: HistoriaUsuario[];
  criteriosGeneralesAceptacion: string;
  // Observación
  sesionesObservacion: SessionObservacion[];
  hallazgosObservacion: string;
  // Análisis documental
  resumenConsolidado: string;
}

export const metadatosInitialState: MetadatosState = {
  nombreProyecto: '',
  descripcionProyecto: '',
  tipoApp: 'Web',
  industria: '',
  plataforma: ['Web'],
  entrevistas: [],
  hallazgosEntrevista: '',
  encuestas: [],
  hallazgosEncuesta: '',
  historias: [],
  criteriosGeneralesAceptacion: '',
  sesionesObservacion: [],
  hallazgosObservacion: '',
  resumenConsolidado: '',
};

export type MetadatosAction =
  | { type: 'UPDATE_ALL'; payload: any }
  | { type: 'SET_FIELD'; field: keyof MetadatosState; value: any }
  | { type: 'TOGGLE_PLATAFORMA'; plataforma: string }
  // Entrevistas
  | { type: 'ADD_ENTREVISTA' }
  | { type: 'UPDATE_ENTREVISTA'; id: string; field: keyof EntrevistaItem; value: any }
  | { type: 'REMOVE_ENTREVISTA'; id: string }
  | { type: 'ADD_PREGUNTA_ENTREVISTA'; entrevistaId: string }
  | { type: 'UPDATE_PREGUNTA_ENTREVISTA'; entrevistaId: string; preguntaId: string; field: keyof PreguntaEntrevista; value: any }
  | { type: 'REMOVE_PREGUNTA_ENTREVISTA'; entrevistaId: string; preguntaId: string }
  // Encuestas
  | { type: 'ADD_ENCUESTA' }
  | { type: 'UPDATE_ENCUESTA'; id: string; field: keyof Encuesta; value: any }
  | { type: 'REMOVE_ENCUESTA'; id: string }
  | { type: 'ADD_PREGUNTA_ENCUESTA'; encuestaId: string }
  | { type: 'UPDATE_PREGUNTA_ENCUESTA'; encuestaId: string; preguntaId: string; field: keyof EncuestaPregunta; value: any }
  | { type: 'REMOVE_PREGUNTA_ENCUESTA'; encuestaId: string; preguntaId: string }
  // Historias
  | { type: 'ADD_HISTORIA' }
  | { type: 'UPDATE_HISTORIA'; id: string; field: keyof HistoriaUsuario; value: any }
  | { type: 'REMOVE_HISTORIA'; id: string }
  // Observación
  | { type: 'ADD_SESION_OBSERVACION' }
  | { type: 'UPDATE_SESION_OBSERVACION'; id: string; field: keyof SessionObservacion; value: any }
  | { type: 'REMOVE_SESION_OBSERVACION'; id: string }
  | { type: 'RESET' };

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function metadatosReducer(state: MetadatosState, action: MetadatosAction): MetadatosState {
  switch (action.type) {
    case 'UPDATE_ALL':
      return { ...metadatosInitialState, ...action.payload };

    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'TOGGLE_PLATAFORMA':
      return {
        ...state,
        plataforma: state.plataforma.includes(action.plataforma)
          ? state.plataforma.filter(p => p !== action.plataforma)
          : [...state.plataforma, action.plataforma],
      };

    // Entrevistas
    case 'ADD_ENTREVISTA':
      return {
        ...state,
        entrevistas: [...state.entrevistas, { id: uid(), nombre: '', rol: '', fecha: '', duracion: '60 min', lugar: '', preguntas: [], hallazgos: '' }],
      };
    case 'UPDATE_ENTREVISTA':
      return { ...state, entrevistas: state.entrevistas.map(e => e.id === action.id ? { ...e, [action.field]: action.value } : e) };
    case 'REMOVE_ENTREVISTA':
      return { ...state, entrevistas: state.entrevistas.filter(e => e.id !== action.id) };
    case 'ADD_PREGUNTA_ENTREVISTA':
      return { ...state, entrevistas: state.entrevistas.map(e => e.id === action.entrevistaId ? { ...e, preguntas: [...e.preguntas, { id: uid(), texto: '', categoria: 'General', respuesta: '' }] } : e) };
    case 'UPDATE_PREGUNTA_ENTREVISTA':
      return { ...state, entrevistas: state.entrevistas.map(e => e.id === action.entrevistaId ? { ...e, preguntas: e.preguntas.map(p => p.id === action.preguntaId ? { ...p, [action.field]: action.value } : p) } : e) };
    case 'REMOVE_PREGUNTA_ENTREVISTA':
      return { ...state, entrevistas: state.entrevistas.map(e => e.id === action.entrevistaId ? { ...e, preguntas: e.preguntas.filter(p => p.id !== action.preguntaId) } : e) };

    // Encuestas
    case 'ADD_ENCUESTA':
      return { ...state, encuestas: [...state.encuestas, { id: uid(), titulo: '', descripcion: '', preguntas: [] }] };
    case 'UPDATE_ENCUESTA':
      return { ...state, encuestas: state.encuestas.map(e => e.id === action.id ? { ...e, [action.field]: action.value } : e) };
    case 'REMOVE_ENCUESTA':
      return { ...state, encuestas: state.encuestas.filter(e => e.id !== action.id) };
    case 'ADD_PREGUNTA_ENCUESTA':
      return { ...state, encuestas: state.encuestas.map(e => e.id === action.encuestaId ? { ...e, preguntas: [...e.preguntas, { id: uid(), tipo: 'abierta', texto: '' }] } : e) };
    case 'UPDATE_PREGUNTA_ENCUESTA':
      return { ...state, encuestas: state.encuestas.map(e => e.id === action.encuestaId ? { ...e, preguntas: e.preguntas.map(p => p.id === action.preguntaId ? { ...p, [action.field]: action.value } : p) } : e) };
    case 'REMOVE_PREGUNTA_ENCUESTA':
      return { ...state, encuestas: state.encuestas.map(e => e.id === action.encuestaId ? { ...e, preguntas: e.preguntas.filter(p => p.id !== action.preguntaId) } : e) };

    // Historias
    case 'ADD_HISTORIA':
      return { ...state, historias: [...state.historias, { id: uid(), comoUnA: '', necesito: '', paraPoder: '', prioridad: 'Media', estado: 'Pendiente', criteriosAceptacion: [] }] };
    case 'UPDATE_HISTORIA':
      return { ...state, historias: state.historias.map(h => h.id === action.id ? { ...h, [action.field]: action.value } : h) };
    case 'REMOVE_HISTORIA':
      return { ...state, historias: state.historias.filter(h => h.id !== action.id) };

    // Observación
    case 'ADD_SESION_OBSERVACION':
      return { ...state, sesionesObservacion: [...state.sesionesObservacion, { id: uid(), fecha: '', duracion: '60 min', lugar: '', participantes: '', objetivo: '', hallazgos: '', comportamientoObservado: '', dolorObservado: '' }] };
    case 'UPDATE_SESION_OBSERVACION':
      return { ...state, sesionesObservacion: state.sesionesObservacion.map(s => s.id === action.id ? { ...s, [action.field]: action.value } : s) };
    case 'REMOVE_SESION_OBSERVACION':
      return { ...state, sesionesObservacion: state.sesionesObservacion.filter(s => s.id !== action.id) };

    case 'RESET':
      return metadatosInitialState;

    default:
      return state;
  }
}

export function buildOutputJson(state: MetadatosState): object {
  return {
    proyecto: {
      nombre: state.nombreProyecto,
      descripcion: state.descripcionProyecto,
      tipo: state.tipoApp,
      industria: state.industria,
      plataformas: state.plataforma,
    },
    entrevistas: state.entrevistas,
    hallazgosEntrevista: state.hallazgosEntrevista,
    encuestas: state.encuestas,
    hallazgosEncuesta: state.hallazgosEncuesta,
    historias: state.historias,
    criteriosGenerales: state.criteriosGeneralesAceptacion,
    observacion: {
      sesiones: state.sesionesObservacion,
      hallazgos: state.hallazgosObservacion,
    },
    resumenConsolidado: state.resumenConsolidado,
  };
}
