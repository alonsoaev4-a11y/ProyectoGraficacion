// SeccionObservacion.tsx — Sección 6: Observación Directa
// Sub-sección A: Configuración (tipo, entorno, aspectos clave, fricciones)
// Sub-sección B: Observaciones realizadas (N cards con upload + detecciones)

import { useState } from 'react';
import {
    MetadatosAction, ObservacionState,
} from '../metadatosReducer';
import { SubidorArchivo, type ResultadoExtraccion } from '../../../components/SubidorArchivo';
import { analizarParaHerman, sugerirFuncionalidades } from '../../../utils/analizadorHerman';
import { useToast } from '../hooks/useToast';
import {
    Info, Zap, Plus, Trash2, ChevronDown, ChevronUp, Eye, Lightbulb, Save,
} from 'lucide-react';

interface Props {
    observacion: ObservacionState;
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

const TIPOS_OBS = [
    { value: 'participante', label: 'Participante', desc: 'El observador participa activamente en el proceso.', color: '#10b981' },
    { value: 'no-participante', label: 'No participante', desc: 'El observador registra sin intervenir en el proceso.', color: '#8b5cf6' },
];

const ENTORNOS = [
    { value: 'presencial', label: 'Presencial', desc: 'Observación en el lugar de trabajo real.', color: '#f59e0b' },
    { value: 'remoto', label: 'Remoto', desc: 'Observación via screenshare o herramienta remota.', color: '#00abbf' },
];

export const SeccionObservacion = ({ observacion: obs, activo, dispatch }: Props) => {
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
    const { toast, guardado } = useToast();

    if (!activo) {
        return (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9090a0' }}>
                <p>Activa el método <strong>"Observación"</strong> en la Sección 2 para configurar esta sección.</p>
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

    const handleArchivo = (obsId: string, resultado: ResultadoExtraccion) => {
        const det = analizarParaHerman(resultado.texto);
        const fricciones = det.fricciones;
        const funcSugeridas = sugerirFuncionalidades(fricciones);

        dispatch({ type: 'UPDATE_OBSERVACION_ITEM', id: obsId, campo: 'archivoNombre', valor: resultado.nombreArchivo });
        dispatch({ type: 'UPDATE_OBSERVACION_ITEM', id: obsId, campo: 'textoExtraido', valor: resultado.texto });
        dispatch({
            type: 'UPDATE_OBSERVACION_ITEM', id: obsId, campo: 'detecciones', valor: {
                entidades: det.entidades, reglas: det.reglas, modulos: det.modulos, actores: det.actores,
                friccionesDetectadas: fricciones,
                procesosIdentificados: det.modulos,
                funcionalidadesSugeridas: funcSugeridas,
            }
        });
    };

    const radioCards = (
        options: { value: string; label: string; desc: string; color: string }[],
        selected: string,
        onChange: (v: string) => void
    ) => (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {options.map(op => {
                const sel = selected === op.value;
                return (
                    <label key={op.value} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', cursor: 'pointer', flex: '1', minWidth: '200px',
                        border: `1.5px solid ${sel ? op.color : 'rgba(0,171,191,0.12)'}`,
                        background: sel ? `${op.color}09` : 'rgba(255,255,255,0.7)', transition: 'all 0.2s',
                    }}>
                        <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, marginTop: '3px',
                            border: `2px solid ${sel ? op.color : '#c0c0d0'}`, background: sel ? op.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{sel && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'white' }} />}</div>
                        <input type="radio" style={{ display: 'none' }} checked={sel}
                            onChange={() => onChange(op.value)} />
                        <div>
                            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.84rem', color: sel ? op.color : '#1a1a2e' }}>{op.label}</p>
                            <p style={{ margin: 0, fontSize: '0.73rem', color: '#7070a0', lineHeight: 1.4 }}>{op.desc}</p>
                        </div>
                    </label>
                );
            })}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ═══ SUB-SECCIÓN A: Configuración ═══ */}
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px', borderBottom: '1px solid rgba(0,171,191,0.08)', paddingBottom: '8px' }}>
                    A · Configuración de la observación
                </h3>

                {/* Tipo y entorno en 2 columnas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="meta-field-group">
                        <label className="meta-field-label">Tipo de observación <span>*</span></label>
                        {radioCards(TIPOS_OBS, obs.tipo, v => dispatch({ type: 'SET_OBSERVACION_FIELD', field: 'tipo', value: v }))}
                    </div>
                    <div className="meta-field-group">
                        <label className="meta-field-label">Entorno <span>*</span></label>
                        {radioCards(ENTORNOS, obs.entorno, v => dispatch({ type: 'SET_OBSERVACION_FIELD', field: 'entorno', value: v }))}
                    </div>
                </div>

                {/* Contexto */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Contexto de la observación</label>
                    <textarea className="cyber-textarea" rows={2} placeholder="Describe el ambiente, departamento, proceso observado..."
                        value={obs.contexto}
                        onChange={ev => dispatch({ type: 'SET_OBSERVACION_FIELD', field: 'contexto', value: ev.target.value })} />
                </div>

                {/* Aspectos clave */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Aspectos clave a observar <span>*</span></label>
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '10px',
                        background: 'linear-gradient(135deg, rgba(0,171,191,0.06), rgba(6,182,212,0.03))',
                        border: '1.5px solid rgba(0,171,191,0.2)',
                    }}>
                        <Info size={15} color="#00abbf" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#005f6b', lineHeight: 1.5 }}>
                            Cada aspecto orienta la observación y se mapea a <strong>funcionalidades potenciales</strong>.
                        </p>
                    </div>
                    <TagInput tags={obs.aspectosClave} onChange={a => dispatch({ type: 'SET_OBSERVACION_ASPECTOS', aspectos: a })} placeholder="Ej: Flujo de atención, Tiempos de espera, Uso del software actual..." />
                </div>

                {/* Duración + Grabación */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="meta-field-group">
                        <label className="meta-field-label">Duración estimada (min)</label>
                        <input type="number" min={5} className="cyber-input" placeholder="Ej: 60"
                            value={obs.duracionMinutos}
                            onChange={ev => dispatch({ type: 'SET_OBSERVACION_FIELD', field: 'duracionMinutos', value: ev.target.value === '' ? '' : Number(ev.target.value) })} />
                    </div>
                    <div className="meta-field-group">
                        <label className="meta-field-label">¿Se grabará la sesión?</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(op => (
                                <button key={String(op.v)} type="button" onClick={() => dispatch({ type: 'SET_OBSERVACION_FIELD', field: 'grabacion', value: op.v })}
                                    style={{
                                        padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                                        border: `1.5px solid ${obs.grabacion === op.v ? '#00abbf' : 'rgba(0,171,191,0.12)'}`,
                                        background: obs.grabacion === op.v ? 'rgba(0,171,191,0.06)' : 'rgba(255,255,255,0.7)',
                                        color: obs.grabacion === op.v ? '#007a8a' : '#5a5a6e', fontWeight: 700, fontSize: '0.82rem',
                                    }}>
                                    {op.l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fricciones manuales */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Fricciones identificadas (manual)</label>
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '10px',
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.03))',
                        border: '1.5px solid rgba(245,158,11,0.2)',
                    }}>
                        <Zap size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#92400e', lineHeight: 1.5 }}>
                            <strong>⚠️ Crítico —</strong> las fricciones se convierten en <strong>oportunidades de mejora</strong> del sistema.
                        </p>
                    </div>
                    <TagInput tags={obs.friccionesIdentificadas} onChange={f => dispatch({ type: 'SET_OBSERVACION_FRICCIONES', fricciones: f })} placeholder="Ej: Proceso manual de copiado, Demora en aprobaciones..." />
                </div>

                {/* Botón Guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                    {toast && <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>✓ {toast}</span>}
                    <button type="button" onClick={guardado} className="meta-save-btn">
                        <Save size={14} /> Guardar configuración
                    </button>
                </div>
            </div>

            {/* ═══ SUB-SECCIÓN B: Observaciones realizadas ═══ */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(0,171,191,0.08)', paddingBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                        B · Observaciones realizadas
                        {obs.observaciones.length > 0 && (
                            <span style={{ marginLeft: '8px', fontSize: '0.73rem', fontWeight: 600, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '8px' }}>
                                {obs.observaciones.length}
                            </span>
                        )}
                    </h3>
                    <button type="button" onClick={() => {
                        dispatch({ type: 'ADD_OBSERVACION_ITEM' });
                        setTimeout(() => {
                            const nextId = `OBS-${String(obs.observaciones.length + 1).padStart(3, '0')}`;
                            setExpandidos(prev => new Set(prev).add(nextId));
                        }, 0);
                    }} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px',
                        borderRadius: '8px', border: '1px solid rgba(0,171,191,0.3)', background: 'rgba(0,171,191,0.05)',
                        color: '#007a8a', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    }}>
                        <Plus size={14} /> Agregar observación
                    </button>
                </div>

                {obs.observaciones.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#b0b0c0', borderRadius: '10px', border: '1.5px dashed rgba(0,171,191,0.15)' }}>
                        <Eye size={28} color="#d0d0e0" style={{ marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontSize: '0.83rem' }}>Agrega observaciones para cargar notas o archivos</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {obs.observaciones.map(item => {
                            const open = expandidos.has(item.id);
                            return (
                                <div key={item.id} style={{
                                    borderRadius: '12px', border: '1.5px solid rgba(0,171,191,0.1)',
                                    background: 'rgba(255,255,255,0.9)', overflow: 'hidden',
                                }}>
                                    {/* Header card */}
                                    <div onClick={() => toggleExpand(item.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                                        cursor: 'pointer', background: open ? 'rgba(0,171,191,0.03)' : 'transparent',
                                    }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                            {item.id}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#1a1a2e', flex: 1 }}>
                                            {item.observador || item.contexto?.substring(0, 40) || 'Sin detalles'}
                                        </span>
                                        {item.fecha && <span style={{ fontSize: '0.73rem', color: '#9090a0' }}>{item.fecha}</span>}
                                        {item.textoExtraido && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>✓ Procesado</span>}
                                        <button type="button" onClick={ev => { ev.stopPropagation(); dispatch({ type: 'REMOVE_OBSERVACION_ITEM', id: item.id }) }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d0d0e0', padding: '2px' }}>
                                            <Trash2 size={14} />
                                        </button>
                                        {open ? <ChevronUp size={16} color="#9090a0" /> : <ChevronDown size={16} color="#9090a0" />}
                                    </div>

                                    {/* Body */}
                                    {open && (
                                        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,171,191,0.08)' }}>
                                            {/* Campos básicos */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 120px', gap: '10px', marginBottom: '14px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Observador</label>
                                                    <input className="cyber-input" placeholder="Nombre..."
                                                        value={item.observador}
                                                        onChange={ev => dispatch({ type: 'UPDATE_OBSERVACION_ITEM', id: item.id, campo: 'observador', valor: ev.target.value })} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Contexto breve</label>
                                                    <input className="cyber-input" placeholder="Ej: Recepción del hospital"
                                                        value={item.contexto}
                                                        onChange={ev => dispatch({ type: 'UPDATE_OBSERVACION_ITEM', id: item.id, campo: 'contexto', valor: ev.target.value })} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Fecha</label>
                                                    <input type="date" className="cyber-input"
                                                        value={item.fecha}
                                                        onChange={ev => dispatch({ type: 'UPDATE_OBSERVACION_ITEM', id: item.id, campo: 'fecha', valor: ev.target.value })} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Min. reales</label>
                                                    <input type="number" min={1} className="cyber-input" placeholder="30"
                                                        value={item.duracionRealMin}
                                                        onChange={ev => dispatch({ type: 'UPDATE_OBSERVACION_ITEM', id: item.id, campo: 'duracionRealMin', valor: ev.target.value === '' ? '' : Number(ev.target.value) })} />
                                                </div>
                                            </div>

                                            {/* Archivo */}
                                            <SubidorArchivo
                                                label="Subir notas de observación"
                                                hint="Archivo .txt, .docx o .pdf con las notas de campo"
                                                formatsAceptados={['.txt', '.docx', '.pdf']}
                                                onExtraccion={res => handleArchivo(item.id, res)}
                                                onError={() => { }}
                                            />

                                            {/* Detecciones */}
                                            {item.textoExtraido && (
                                                <div style={{
                                                    padding: '14px', borderRadius: '10px', marginTop: '12px',
                                                    background: 'linear-gradient(135deg, rgba(245,158,11,0.04), rgba(0,171,191,0.03))',
                                                    border: '1.5px solid rgba(245,158,11,0.15)',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                                        <Zap size={15} color="#d97706" />
                                                        <span style={{ fontWeight: 700, fontSize: '0.83rem', color: '#92400e' }}>⚡ Detecciones</span>
                                                    </div>

                                                    {item.detecciones.friccionesDetectadas.length > 0 && (
                                                        <div style={{ marginBottom: '10px' }}>
                                                            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#dc2626' }}>🔴 Fricciones:</span>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                                {item.detecciones.friccionesDetectadas.map((f, i) => (
                                                                    <span key={i} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', color: '#991b1b', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                                        {f.length > 60 ? f.substring(0, 57) + '...' : f}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {item.detecciones.funcionalidadesSugeridas.length > 0 && (
                                                        <div style={{ marginBottom: '10px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Lightbulb size={13} color="#f59e0b" />
                                                                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#92400e' }}>💡 Funcionalidades sugeridas:</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                                {item.detecciones.funcionalidadesSugeridas.map((f, i) => (
                                                                    <span key={i} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', color: '#065f46', border: '1px solid rgba(16,185,129,0.15)' }}>
                                                                        {f}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {item.detecciones.actores.length > 0 && (
                                                        <div>
                                                            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e' }}>Actores: </span>
                                                            <span style={{ fontSize: '0.76rem', color: '#5a5a6e' }}>{item.detecciones.actores.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Notas */}
                                            <div className="meta-field-group" style={{ marginTop: '12px' }}>
                                                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Notas adicionales</label>
                                                <textarea className="cyber-textarea" rows={2} placeholder="Observaciones del investigador..."
                                                    value={item.notas}
                                                    onChange={ev => dispatch({ type: 'UPDATE_OBSERVACION_ITEM', id: item.id, campo: 'notas', valor: ev.target.value })} />
                                            </div>
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
                <label className="meta-field-label">Hallazgos generales de la observación</label>
                <textarea className="cyber-textarea" rows={3}
                    placeholder="Resume los hallazgos más importantes del conjunto de observaciones..."
                    value={obs.hallazgosObservacion}
                    onChange={ev => dispatch({ type: 'SET_OBSERVACION_FIELD', field: 'hallazgosObservacion', value: ev.target.value })} />
            </div>
        </div>
    );
};
