// SeccionEntrevista.tsx — Sección 3 del formulario de Metadatos
// Sub-sección A: Configuración (tipo, roles, temas, etc.)
// Sub-sección B: Entrevistas realizadas (N cards expandibles con audio/transcripción)

import { useState } from 'react';
import {
    MetadatosAction, EntrevistaState, Detecciones,
} from '../metadatosReducer';
import { SubidorAudio } from '../../../components/SubidorAudio';
import { SubidorArchivo, type ResultadoExtraccion } from '../../../components/SubidorArchivo';
import { analizarParaHerman } from '../../../utils/analizadorHerman';
import { useToast } from '../hooks/useToast';
import {
    Zap, Plus, Trash2, ChevronDown, ChevronUp, FileText, Save,
} from 'lucide-react';

interface Props {
    entrevista: EntrevistaState;
    activo: boolean;
    dispatch: React.Dispatch<MetadatosAction>;
    onAbrirConfig?: () => void;
}

// ── TagInput reutilizable local ──
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

// ── Panel de detecciones de Herman ──
const PanelDetecciones = ({
    detecciones,
    onChange,
}: {
    detecciones: Detecciones;
    onChange: (d: Detecciones) => void;
}) => (
    <div style={{
        padding: '14px', borderRadius: '10px', marginTop: '12px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.04), rgba(0,171,191,0.03))',
        border: '1.5px solid rgba(245,158,11,0.15)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Zap size={15} color="#d97706" />
            <span style={{ fontWeight: 700, fontSize: '0.83rem', color: '#92400e' }}>
                ⚡ Detecciones de Herman
            </span>
        </div>
        <p style={{ fontSize: '0.73rem', color: '#9090a0', margin: '0 0 12px' }}>
            Herman detectó estos elementos automáticamente. Revísalos y ajusta antes de continuar.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e', marginBottom: '4px', display: 'block' }}>Actores</label>
                <TagInput tags={detecciones.actores} onChange={a => onChange({ ...detecciones, actores: a })} placeholder="Agregar actor..." />
            </div>
            <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e', marginBottom: '4px', display: 'block' }}>Módulos</label>
                <TagInput tags={detecciones.modulos} onChange={m => onChange({ ...detecciones, modulos: m })} placeholder="Agregar módulo..." />
            </div>
            <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e', marginBottom: '4px', display: 'block' }}>Reglas de negocio</label>
                <TagInput tags={detecciones.reglas} onChange={r => onChange({ ...detecciones, reglas: r })} placeholder="Agregar regla..." />
            </div>
            <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e', marginBottom: '4px', display: 'block' }}>Entidades</label>
                <TagInput tags={detecciones.entidades} onChange={ent => onChange({ ...detecciones, entidades: ent })} placeholder="Agregar entidad..." />
            </div>
        </div>
    </div>
);

const TIPOS_ENTREVISTA = [
    { value: 'estructurada', label: 'Estructurada', desc: 'Preguntas predefinidas en orden fijo. Ideal para datos cuantitativos comparables.', color: '#10b981' },
    { value: 'semi-estructurada', label: 'Semi-estructurada', desc: 'Guía de temas con flexibilidad para profundizar. Balance entre estructura y descubrimiento.', color: '#f59e0b' },
    { value: 'no-estructurada', label: 'No estructurada', desc: 'Conversación libre guiada por el contexto. Máxima exploración de necesidades.', color: '#8b5cf6' },
];

export const SeccionEntrevista = ({ entrevista: e, activo, dispatch, onAbrirConfig }: Props) => {
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
    const [tabActiva, setTabActiva] = useState<Record<string, 'audio' | 'archivo'>>({});
    const { toast, guardado } = useToast();

    if (!activo) {
        return (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9090a0' }}>
                <p>Activa el método <strong>"Entrevista"</strong> en la Sección 2 para configurar esta sección.</p>
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

    const getTab = (id: string) => tabActiva[id] || 'audio';

    const handleTranscripcion = (entId: string, texto: string, nombreArchivo: string) => {
        dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: entId, campo: 'transcripcion', valor: texto });
        dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: entId, campo: 'fuenteAudio', valor: nombreArchivo });
        // Auto-detectar
        const det = analizarParaHerman(texto);
        dispatch({
            type: 'SET_ENTREVISTA_DETECCIONES', id: entId, detecciones: {
                entidades: det.entidades, reglas: det.reglas, modulos: det.modulos, actores: det.actores,
            }
        });
    };

    const handleArchivoTranscripcion = (entId: string, resultado: ResultadoExtraccion) => {
        dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: entId, campo: 'transcripcion', valor: resultado.texto });
        dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: entId, campo: 'fuenteAudio', valor: resultado.nombreArchivo });
        dispatch({
            type: 'SET_ENTREVISTA_DETECCIONES', id: entId, detecciones: {
                entidades: resultado.detecciones.entidades,
                reglas: resultado.detecciones.reglas,
                modulos: resultado.detecciones.modulos,
                actores: resultado.detecciones.actores,
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ═══ SUB-SECCIÓN A: Configuración ═══ */}
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px', borderBottom: '1px solid rgba(0,171,191,0.08)', paddingBottom: '8px' }}>
                    A · Configuración de entrevistas
                </h3>

                {/* Tipo */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Tipo de entrevista <span>*</span></label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {TIPOS_ENTREVISTA.map(op => {
                            const sel = e.tipo === op.value;
                            return (
                                <label key={op.value} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                                    borderRadius: '10px', cursor: 'pointer', flex: '1', minWidth: '180px',
                                    border: `1.5px solid ${sel ? op.color : 'rgba(0,171,191,0.12)'}`,
                                    background: sel ? `${op.color}09` : 'rgba(255,255,255,0.7)',
                                    transition: 'all 0.2s',
                                }}>
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, marginTop: '3px',
                                        border: `2px solid ${sel ? op.color : '#c0c0d0'}`, background: sel ? op.color : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {sel && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'white' }} />}
                                    </div>
                                    <input type="radio" style={{ display: 'none' }} checked={sel}
                                        onChange={() => dispatch({ type: 'SET_ENTREVISTA_FIELD', field: 'tipo', value: op.value })} />
                                    <div>
                                        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.84rem', color: sel ? op.color : '#1a1a2e' }}>{op.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.73rem', color: '#7070a0', lineHeight: 1.4 }}>{op.desc}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Roles */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Roles de los entrevistados <span>*</span></label>
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '10px',
                        background: 'linear-gradient(135deg, rgba(0,171,191,0.06), rgba(0,171,191,0.02))',
                        border: '1.5px solid rgba(0,171,191,0.15)',
                    }}>
                        <Info size={15} color="#00abbf" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#005f6b', lineHeight: 1.5 }}>
                            Cada rol se convierte en un <strong>actor del sistema</strong>. Ej: Gerente, Analista, Cliente.
                        </p>
                    </div>
                    <TagInput tags={e.roles} onChange={r => dispatch({ type: 'SET_ENTREVISTA_ROLES', roles: r })} placeholder="Escribe un rol + Enter" />
                </div>

                {/* Num entrevistados + Duración */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="meta-field-group">
                        <label className="meta-field-label">Número de entrevistados</label>
                        <input type="number" min={1} className="cyber-input" placeholder="Ej: 5"
                            value={e.numEntrevistados}
                            onChange={ev => dispatch({ type: 'SET_ENTREVISTA_FIELD', field: 'numEntrevistados', value: ev.target.value === '' ? '' : Number(ev.target.value) })} />
                    </div>
                    <div className="meta-field-group">
                        <label className="meta-field-label">Duración estimada (min)</label>
                        <input type="number" min={5} className="cyber-input" placeholder="Ej: 30"
                            value={e.duracionMinutos}
                            onChange={ev => dispatch({ type: 'SET_ENTREVISTA_FIELD', field: 'duracionMinutos', value: ev.target.value === '' ? '' : Number(ev.target.value) })} />
                    </div>
                </div>

                {/* Temas clave */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Temas clave <span>*</span></label>
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '10px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(0,171,191,0.03))',
                        border: '1.5px solid rgba(139,92,246,0.2)',
                    }}>
                        <Zap size={15} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#6d28d9', lineHeight: 1.5 }}>
                            <strong>⚡ Crítico</strong> — el backend convierte cada tema en un <strong>módulo del software</strong>.
                        </p>
                    </div>
                    <TagInput tags={e.temasClave} onChange={t => dispatch({ type: 'SET_ENTREVISTA_TEMAS', temas: t })} placeholder="Ej: Gestión de pedidos, Facturación, Control de accesos..." />
                </div>

                {/* Grabada toggle */}
                <div className="meta-field-group">
                    <label className="meta-field-label">¿Entrevistas grabadas?</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(op => (
                            <button key={String(op.v)} type="button" onClick={() => dispatch({ type: 'SET_ENTREVISTA_FIELD', field: 'grabada', value: op.v })}
                                style={{
                                    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                                    border: `1.5px solid ${e.grabada === op.v ? '#00abbf' : 'rgba(0,171,191,0.12)'}`,
                                    background: e.grabada === op.v ? 'rgba(0,171,191,0.06)' : 'rgba(255,255,255,0.7)',
                                    color: e.grabada === op.v ? '#007a8a' : '#5a5a6e', fontWeight: 700, fontSize: '0.82rem',
                                    transition: 'all 0.15s',
                                }}>
                                {op.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Botón Guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                    {toast && <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>✓ {toast}</span>}
                    <button type="button" onClick={guardado} className="meta-save-btn">
                        <Save size={14} /> Guardar configuración
                    </button>
                </div>
            </div>

            {/* ═══ SUB-SECCIÓN B: Entrevistas realizadas ═══ */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(0,171,191,0.08)', paddingBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                        B · Entrevistas realizadas
                        {e.entrevistas.length > 0 && (
                            <span style={{ marginLeft: '8px', fontSize: '0.73rem', fontWeight: 600, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '8px' }}>
                                {e.entrevistas.length}
                            </span>
                        )}
                    </h3>
                    <button type="button" onClick={() => {
                        dispatch({ type: 'ADD_ENTREVISTA_ITEM' });
                        // auto-expand the new item
                        setTimeout(() => {
                            const nextId = `ENT-${String(e.entrevistas.length + 1).padStart(3, '0')}`;
                            setExpandidos(prev => new Set(prev).add(nextId));
                        }, 0);
                    }} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px',
                        borderRadius: '8px', border: '1px solid rgba(0,171,191,0.3)', background: 'rgba(0,171,191,0.05)',
                        color: '#007a8a', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    }}>
                        <Plus size={14} /> Agregar entrevista
                    </button>
                </div>

                {e.entrevistas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#b0b0c0', borderRadius: '10px', border: '1.5px dashed rgba(0,171,191,0.15)' }}>
                        <FileText size={28} color="#d0d0e0" style={{ marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontSize: '0.83rem' }}>Agrega entrevistas para cargar audio o transcripciones</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {e.entrevistas.map(item => {
                            const open = expandidos.has(item.id);
                            return (
                                <div key={item.id} style={{
                                    borderRadius: '12px', border: '1.5px solid rgba(0,171,191,0.1)',
                                    background: 'rgba(255,255,255,0.9)', overflow: 'hidden',
                                }}>
                                    {/* Header */}
                                    <div onClick={() => toggleExpand(item.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                                        cursor: 'pointer', background: open ? 'rgba(0,171,191,0.03)' : 'transparent',
                                    }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                            {item.id}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#1a1a2e', flex: 1 }}>
                                            {item.entrevistado || 'Sin nombre'}
                                        </span>
                                        {item.rol && <span style={{ fontSize: '0.73rem', color: '#00abbf', fontWeight: 600 }}>{item.rol}</span>}
                                        {item.fecha && <span style={{ fontSize: '0.73rem', color: '#9090a0' }}>{item.fecha}</span>}
                                        {item.transcripcion && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>✓ Transcrito</span>}
                                        <button type="button" onClick={ev => { ev.stopPropagation(); dispatch({ type: 'REMOVE_ENTREVISTA_ITEM', id: item.id }) }}
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
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Nombre / Alias</label>
                                                    <input className="cyber-input" placeholder="Ej: Juan Pérez"
                                                        value={item.entrevistado}
                                                        onChange={ev => dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: item.id, campo: 'entrevistado', valor: ev.target.value })} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Rol</label>
                                                    <select className="cyber-select"
                                                        value={item.rol}
                                                        onChange={ev => dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: item.id, campo: 'rol', valor: ev.target.value })}>
                                                        <option value="">Seleccionar...</option>
                                                        {e.roles.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Fecha</label>
                                                    <input type="date" className="cyber-input"
                                                        value={item.fecha}
                                                        onChange={ev => dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: item.id, campo: 'fecha', valor: ev.target.value })} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Min. reales</label>
                                                    <input type="number" min={1} className="cyber-input" placeholder="30"
                                                        value={item.duracionRealMin}
                                                        onChange={ev => dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: item.id, campo: 'duracionRealMin', valor: ev.target.value === '' ? '' : Number(ev.target.value) })} />
                                                </div>
                                            </div>

                                            {/* Tabs: Audio / Archivo */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,171,191,0.08)', marginBottom: '12px' }}>
                                                    {([['audio', '🎵 Subir audio (Groq)'], ['archivo', '📄 Subir transcripción']] as ['audio' | 'archivo', string][]).map(([t, l]) => (
                                                        <button key={t} type="button" onClick={() => setTabActiva(prev => ({ ...prev, [item.id]: t }))}
                                                            style={{
                                                                padding: '8px 14px', border: 'none', background: 'none',
                                                                borderBottom: `2px solid ${getTab(item.id) === t ? '#00abbf' : 'transparent'}`,
                                                                fontSize: '0.78rem', fontWeight: getTab(item.id) === t ? 700 : 500,
                                                                color: getTab(item.id) === t ? '#007a8a' : '#9090a0', cursor: 'pointer',
                                                            }}>
                                                            {l}
                                                        </button>
                                                    ))}
                                                </div>

                                                {getTab(item.id) === 'audio' && (
                                                    <SubidorAudio
                                                        label="Sube el audio de la entrevista"
                                                        onTranscripcion={res => handleTranscripcion(item.id, res.texto, res.nombreArchivo)}
                                                        onError={() => { }}
                                                        onAbrirConfig={onAbrirConfig}
                                                    />
                                                )}
                                                {getTab(item.id) === 'archivo' && (
                                                    <SubidorArchivo
                                                        label="Sube la transcripción"
                                                        hint="Útil si el audio ya fue transcrito externamente"
                                                        formatsAceptados={['.txt', '.docx', '.pdf']}
                                                        onExtraccion={res => handleArchivoTranscripcion(item.id, res)}
                                                        onError={() => { }}
                                                    />
                                                )}
                                            </div>

                                            {/* Detecciones */}
                                            {item.transcripcion && (
                                                <PanelDetecciones
                                                    detecciones={item.detecciones}
                                                    onChange={d => dispatch({ type: 'SET_ENTREVISTA_DETECCIONES', id: item.id, detecciones: d })}
                                                />
                                            )}

                                            {/* Notas */}
                                            <div className="meta-field-group" style={{ marginTop: '12px' }}>
                                                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Notas del entrevistador</label>
                                                <textarea className="cyber-textarea" rows={2} placeholder="Observaciones adicionales..."
                                                    value={item.notas}
                                                    onChange={ev => dispatch({ type: 'UPDATE_ENTREVISTA_ITEM', id: item.id, campo: 'notas', valor: ev.target.value })} />
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
                <label className="meta-field-label">Hallazgos generales de las entrevistas</label>
                <textarea className="cyber-textarea" rows={4}
                    placeholder="Resume los hallazgos más importantes que surgieron del conjunto de entrevistas..."
                    value={e.hallazgos}
                    onChange={ev => dispatch({ type: 'SET_ENTREVISTA_FIELD', field: 'hallazgos', value: ev.target.value })} />
                <div style={{ textAlign: 'right', fontSize: '0.73rem', color: '#b0b0c0', marginTop: '4px' }}>
                    {e.hallazgos.length} caracteres
                    {e.hallazgos.length >= 100 && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ Listo para análisis</span>}
                </div>
            </div>
        </div>
    );
};
