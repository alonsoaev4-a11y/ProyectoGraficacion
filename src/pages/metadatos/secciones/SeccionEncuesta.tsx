// SeccionEncuesta.tsx — Sección 4 del formulario de Metadatos
// Sub-sección A: Configuración (objetivo, público, tipo preguntas, plataforma)
// Sub-sección B: Resultados importados (N cards con CSV/Excel uploaders)

import { useState } from 'react';
import {
    MetadatosAction, EncuestaState, ResultadoEncuesta,
} from '../metadatosReducer';
import { SubidorArchivo, type ResultadoExtraccion } from '../../../components/SubidorArchivo';
import { analizarParaHerman } from '../../../utils/analizadorHerman';
import { useToast } from '../hooks/useToast';
import {
    Zap, Trash2, ChevronDown, ChevronUp, BarChart2, Save,
} from 'lucide-react';

interface Props {
    encuesta: EncuestaState;
    activo: boolean;
    dispatch: React.Dispatch<MetadatosAction>;
}

const TagInput = ({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) => {
    const [val, setVal] = useState('');
    const add = () => { const v = val.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setVal(''); };
    return (
        <div className="meta-tag-input-container">
            {tags.map(t => (
                <span key={t} className="meta-tag">{t}
                    <button type="button" className="meta-tag-remove" onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
                </span>
            ))}
            <input className="meta-tag-text-input" placeholder={placeholder} value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} />
        </div>
    );
};

const TIPO_PREGUNTAS = [
    { value: 'cerradas', label: 'Cerradas', desc: 'Opción múltiple, escalas, sí/no. Datos cuantitativos.', color: '#10b981' },
    { value: 'abiertas', label: 'Abiertas', desc: 'Texto libre. Captura opiniones y sugerencias detalladas.', color: '#f59e0b' },
    { value: 'mixtas', label: 'Mixtas', desc: 'Combinación de ambas. Balance entre datos y descubrimiento.', color: '#8b5cf6' },
];

const PLATAFORMAS = ['Google Forms', 'Microsoft Forms', 'SurveyMonkey', 'Typeform', 'Formulario propio', 'Otra'];

export const SeccionEncuesta = ({ encuesta: enc, activo, dispatch }: Props) => {
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
    const { toast, guardado } = useToast();

    if (!activo) {
        return (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9090a0' }}>
                <p>Activa el método <strong>"Encuesta"</strong> en la Sección 2 para configurar esta sección.</p>
            </div>
        );
    }

    const toggleExpand = (id: string) => {
        setExpandidos(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleResultado = (resultado: ResultadoExtraccion) => {
        const det = analizarParaHerman(resultado.texto);
        const newResult: ResultadoEncuesta = {
            id: `ENC-${String(enc.resultados.length + 1).padStart(3, '0')}`,
            nombreArchivo: resultado.nombreArchivo,
            plataformaOrigen: enc.plataforma || '',
            numFilas: resultado.datos?.length ?? 0,
            columnas: resultado.datos?.[0] ? Object.keys(resultado.datos[0]) : [],
            muestra: resultado.datos?.slice(0, 5) ?? [],
            detecciones: {
                patronesFrecuentes: det.modulos.slice(0, 5),
                actores: det.actores,
                modulos: det.modulos,
            },
            notas: '',
        };
        dispatch({ type: 'ADD_ENCUESTA_RESULTADO', resultado: newResult });
        setExpandidos(prev => new Set(prev).add(newResult.id));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ═══ SUB-SECCIÓN A: Configuración ═══ */}
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px', borderBottom: '1px solid rgba(0,171,191,0.08)', paddingBottom: '8px' }}>
                    A · Configuración de la encuesta
                </h3>

                {/* Objetivo */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Objetivo de la encuesta <span>*</span></label>
                    <textarea className="cyber-textarea" rows={2} placeholder="¿Qué información se busca obtener?"
                        value={enc.objetivo}
                        onChange={ev => dispatch({ type: 'SET_ENCUESTA_FIELD', field: 'objetivo', value: ev.target.value })} />
                </div>

                {/* Público objetivo */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Público objetivo <span>*</span></label>
                    <TagInput tags={enc.publicoObjetivo} onChange={p => dispatch({ type: 'SET_ENCUESTA_PUBLICO', publico: p })} placeholder="Ej: Estudiantes, Empleados, Clientes..." />
                </div>

                {/* Num respuestas + Fecha límite */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="meta-field-group">
                        <label className="meta-field-label">Número de respuestas esperado</label>
                        <input type="number" min={1} className="cyber-input" placeholder="Ej: 100"
                            value={enc.numRespuestas}
                            onChange={ev => dispatch({ type: 'SET_ENCUESTA_FIELD', field: 'numRespuestas', value: ev.target.value === '' ? '' : Number(ev.target.value) })} />
                    </div>
                    <div className="meta-field-group">
                        <label className="meta-field-label">Fecha límite</label>
                        <input type="date" className="cyber-input"
                            value={enc.fechaLimite}
                            onChange={ev => dispatch({ type: 'SET_ENCUESTA_FIELD', field: 'fechaLimite', value: ev.target.value })} />
                    </div>
                </div>

                {/* Tipo de preguntas */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Tipo de preguntas <span>*</span></label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {TIPO_PREGUNTAS.map(op => {
                            const sel = enc.tipoPreguntas === op.value;
                            return (
                                <label key={op.value} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                                    borderRadius: '10px', cursor: 'pointer', flex: '1', minWidth: '180px',
                                    border: `1.5px solid ${sel ? op.color : 'rgba(0,171,191,0.12)'}`,
                                    background: sel ? `${op.color}09` : 'rgba(255,255,255,0.7)', transition: 'all 0.2s',
                                }}>
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, marginTop: '3px',
                                        border: `2px solid ${sel ? op.color : '#c0c0d0'}`, background: sel ? op.color : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>{sel && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'white' }} />}</div>
                                    <input type="radio" style={{ display: 'none' }} checked={sel}
                                        onChange={() => dispatch({ type: 'SET_ENCUESTA_FIELD', field: 'tipoPreguntas', value: op.value })} />
                                    <div>
                                        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.84rem', color: sel ? op.color : '#1a1a2e' }}>{op.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.73rem', color: '#7070a0', lineHeight: 1.4 }}>{op.desc}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Plataforma */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Plataforma utilizada</label>
                    <select className="cyber-select"
                        value={enc.plataforma}
                        onChange={ev => dispatch({ type: 'SET_ENCUESTA_FIELD', field: 'plataforma', value: ev.target.value })}>
                        <option value="">Seleccionar...</option>
                        {PLATAFORMAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {enc.plataforma === 'Otra' && (
                        <input className="cyber-input" placeholder="Especifica la plataforma..."
                            style={{ marginTop: '8px' }}
                            value={enc.plataformaPersonalizada}
                            onChange={ev => dispatch({ type: 'SET_ENCUESTA_FIELD', field: 'plataformaPersonalizada', value: ev.target.value })} />
                    )}
                </div>

                {/* Patrones identificados */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Patrones identificados</label>
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '10px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(0,171,191,0.03))',
                        border: '1.5px solid rgba(139,92,246,0.2)',
                    }}>
                        <Zap size={15} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#6d28d9', lineHeight: 1.5 }}>
                            Herman usa estos patrones para inferir <strong>módulos y funcionalidades</strong> del software.
                        </p>
                    </div>
                    <TagInput tags={enc.patronesIdentificados} onChange={p => dispatch({ type: 'SET_ENCUESTA_PATRONES', patrones: p })} placeholder="Ej: 80% reporta lentitud en reportes..." />
                </div>

                {/* Botón Guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                    {toast && <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>✓ {toast}</span>}
                    <button type="button" onClick={guardado} className="meta-save-btn">
                        <Save size={14} /> Guardar configuración
                    </button>
                </div>
            </div>

            {/* ═══ SUB-SECCIÓN B: Resultados importados ═══ */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(0,171,191,0.08)', paddingBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                        B · Resultados importados
                        {enc.resultados.length > 0 && (
                            <span style={{ marginLeft: '8px', fontSize: '0.73rem', fontWeight: 600, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '8px' }}>
                                {enc.resultados.length}
                            </span>
                        )}
                    </h3>
                </div>

                {/* Uploader */}
                <SubidorArchivo
                    label="Importar resultados de encuesta"
                    hint="Sube un archivo .csv o .xlsx con las respuestas"
                    formatsAceptados={['.csv', '.xlsx', '.xls']}
                    onExtraccion={handleResultado}
                    onError={() => { }}
                />

                {/* Lista de resultados importados */}
                {enc.resultados.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                        {enc.resultados.map(res => {
                            const open = expandidos.has(res.id);
                            return (
                                <div key={res.id} style={{
                                    borderRadius: '12px', border: '1.5px solid rgba(0,171,191,0.1)',
                                    background: 'rgba(255,255,255,0.9)', overflow: 'hidden',
                                }}>
                                    <div onClick={() => toggleExpand(res.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                                        cursor: 'pointer', background: open ? 'rgba(0,171,191,0.03)' : 'transparent',
                                    }}>
                                        <BarChart2 size={16} color="#00abbf" />
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                            {res.id}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#1a1a2e', flex: 1 }}>
                                            {res.nombreArchivo}
                                        </span>
                                        <span style={{ fontSize: '0.73rem', color: '#9090a0' }}>
                                            {res.numFilas} filas · {res.columnas.length} columnas
                                        </span>
                                        <button type="button" onClick={ev => { ev.stopPropagation(); dispatch({ type: 'REMOVE_ENCUESTA_RESULTADO', id: res.id }) }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d0d0e0', padding: '2px' }}>
                                            <Trash2 size={14} />
                                        </button>
                                        {open ? <ChevronUp size={16} color="#9090a0" /> : <ChevronDown size={16} color="#9090a0" />}
                                    </div>

                                    {open && (
                                        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,171,191,0.08)' }}>
                                            {/* Columnas */}
                                            <div style={{ marginBottom: '10px' }}>
                                                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e' }}>Columnas detectadas:</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                    {res.columnas.map(c => (
                                                        <span key={c} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,171,191,0.06)', color: '#007a8a', fontWeight: 600 }}>
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Muestra */}
                                            {res.muestra.length > 0 && (
                                                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e0e0e8', marginBottom: '10px' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f8f8fc' }}>
                                                                {res.columnas.slice(0, 5).map(c => (
                                                                    <th key={c} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#1a1a2e', borderBottom: '1px solid #e0e0e8' }}>{c}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {res.muestra.slice(0, 3).map((row, i) => (
                                                                <tr key={i}>
                                                                    {res.columnas.slice(0, 5).map(c => (
                                                                        <td key={c} style={{ padding: '5px 8px', borderBottom: '1px solid #f0f0f0', color: '#5a5a6e' }}>
                                                                            {String(row[c] || '').substring(0, 50)}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Detecciones */}
                                            {res.detecciones.actores.length > 0 && (
                                                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#92400e' }}>⚡ Actores detectados: </span>
                                                    <span style={{ fontSize: '0.76rem', color: '#5a5a6e' }}>{res.detecciones.actores.join(', ')}</span>
                                                </div>
                                            )}

                                            {/* Notas */}
                                            <textarea className="cyber-textarea" rows={2} placeholder="Notas sobre este resultado..."
                                                value={res.notas}
                                                onChange={ev => dispatch({ type: 'UPDATE_ENCUESTA_RESULTADO', id: res.id, campo: 'notas', valor: ev.target.value })} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══ Hallazgos generales ═══ */}
            <div className="meta-field-group">
                <label className="meta-field-label">Hallazgos generales de la encuesta</label>
                <textarea className="cyber-textarea" rows={3}
                    placeholder="Resume los patrones y hallazgos más significativos..."
                    value={enc.hallazgosEncuesta}
                    onChange={ev => dispatch({ type: 'SET_ENCUESTA_FIELD', field: 'hallazgosEncuesta', value: ev.target.value })} />
            </div>
        </div>
    );
};
