// SeccionAnalisisDocumental.tsx — Sección 7: Análisis Documental
// Sub-sección A: Configuración (tipos, formatos, origen)
// Sub-sección B: Documentos analizados (N cards con upload + detecciones)
// Panel consolidado final

import { useState } from 'react';
import {
    MetadatosAction, AnalisisDocumentalState, Prioridad, DocumentoAnalizado,
} from '../metadatosReducer';
import { SubidorArchivo, type ResultadoExtraccion } from '../../../components/SubidorArchivo';
import { analizarParaHerman } from '../../../utils/analizadorHerman';
import { useToast } from '../hooks/useToast';
import {
    Zap, Trash2, ChevronDown, ChevronUp, FileText, RefreshCw,
    Database, Scale, Boxes, Users, Save,
} from 'lucide-react';

interface Props {
    analisis: AnalisisDocumentalState;
    activo: boolean;
    dispatch: React.Dispatch<MetadatosAction>;
}

const TagInput = ({ tags, onChange, placeholder, color }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string; color?: string }) => {
    const [val, setVal] = useState('');
    const add = () => { const v = val.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setVal(''); };
    return (
        <div className="meta-tag-input-container">
            {tags.map(t => (
                <span key={t} className="meta-tag" style={color ? { background: `${color}12`, color, borderColor: `${color}30` } : {}}>
                    {t}
                    <button type="button" className="meta-tag-remove" onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
                </span>
            ))}
            <input className="meta-tag-text-input" placeholder={placeholder} value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} />
        </div>
    );
};

const TIPOS_DOCUMENTO = [
    'Manuales de proceso', 'Reglamentos', 'Organigramas',
    'Diagramas existentes', 'Bases de datos', 'Informes',
    'Contratos', 'Minutas', 'Formatos/Plantillas', 'Otros',
];
const FORMATOS_DOC = ['PDF', 'Word (.docx)', 'Excel (.xlsx)', 'CSV', 'TXT', 'Imágenes', 'Otros'];
const ORIGENES = [
    { value: 'interno', label: 'Interno', desc: 'Documentos generados dentro de la organización.', color: '#10b981' },
    { value: 'externo', label: 'Externo', desc: 'Documentos de fuentes externas (regulaciones, proveedores).', color: '#f59e0b' },
    { value: 'mixto', label: 'Mixto', desc: 'Combinación de documentos internos y externos.', color: '#8b5cf6' },
];
const PRIORIDAD_COLOR: Record<Prioridad, string> = { alta: '#ef4444', media: '#f59e0b', baja: '#10b981' };

export const SeccionAnalisisDocumental = ({ analisis: ad, activo, dispatch }: Props) => {
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
    const { toast, guardado } = useToast();

    if (!activo) {
        return (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9090a0' }}>
                <p>Activa el método <strong>"Análisis Documental"</strong> en la Sección 2 para configurar esta sección.</p>
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

    const handleArchivo = (resultado: ResultadoExtraccion) => {
        const det = analizarParaHerman(resultado.texto);
        const campos = resultado.datos?.[0] ? Object.keys(resultado.datos[0]) : [];

        const newDoc: DocumentoAnalizado = {
            id: `DOC-${String(ad.documentos.length + 1).padStart(3, '0')}`,
            nombre: resultado.nombreArchivo.replace(/\.[^/.]+$/, ''),
            tipo: resultado.tipo,
            relevancia: 'media',
            archivoNombre: resultado.nombreArchivo,
            textoExtraido: resultado.texto,
            paginasProcesadas: resultado.paginasProcesadas,
            detecciones: {
                entidades: det.entidades,
                reglas: det.reglas,
                modulos: det.modulos,
                actores: det.actores,
                camposDetectados: campos,
            },
            notas: '',
        };

        dispatch({ type: 'ADD_DOCUMENTO', doc: newDoc });
        setExpandidos(prev => new Set(prev).add(newDoc.id));

        // Recalcular consolidado
        setTimeout(() => dispatch({ type: 'RECALCULAR_CONSOLIDADO' }), 50);
    };

    const checkboxGrid = (items: string[], selected: string[], toggleAction: string) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {items.map(item => {
                const sel = selected.includes(item);
                return (
                    <label key={item} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: sel ? 700 : 500,
                        border: `1.5px solid ${sel ? '#00abbf' : 'rgba(0,171,191,0.12)'}`,
                        background: sel ? 'rgba(0,171,191,0.06)' : 'rgba(255,255,255,0.7)',
                        color: sel ? '#007a8a' : '#5a5a6e', transition: 'all 0.15s',
                    }}>
                        <div style={{
                            width: '14px', height: '14px', borderRadius: '3px',
                            border: `1.5px solid ${sel ? '#00abbf' : '#c0c0d0'}`,
                            background: sel ? '#00abbf' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {sel && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
                        </div>
                        <input type="checkbox" style={{ display: 'none' }} checked={sel}
                            onChange={() => dispatch({ type: toggleAction as any, value: item })} />
                        {item}
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
                    A · Configuración del análisis
                </h3>

                {/* Tipos de documento */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Tipos de documento a analizar <span>*</span></label>
                    {checkboxGrid(TIPOS_DOCUMENTO, ad.tiposDocumento, 'TOGGLE_TIPO_DOCUMENTO')}
                </div>

                {/* Formatos */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Formatos disponibles</label>
                    {checkboxGrid(FORMATOS_DOC, ad.formatos, 'TOGGLE_FORMATO')}
                </div>

                {/* Origen */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Origen de los documentos <span>*</span></label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {ORIGENES.map(op => {
                            const sel = ad.origen === op.value;
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
                                        onChange={() => dispatch({ type: 'SET_ANALISIS_FIELD', field: 'origen', value: op.value })} />
                                    <div>
                                        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.84rem', color: sel ? op.color : '#1a1a2e' }}>{op.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.73rem', color: '#7070a0', lineHeight: 1.4 }}>{op.desc}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Entidades y reglas manuales */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Entidades identificadas</label>
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '10px',
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.03))',
                        border: '1.5px solid rgba(245,158,11,0.2)',
                    }}>
                        <Database size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#92400e', lineHeight: 1.5 }}>
                            <strong>⚠️ Crítico BD —</strong> cada entidad genera una <strong>tabla en la base de datos</strong>.
                        </p>
                    </div>
                    <TagInput tags={ad.entidadesIdentificadas} onChange={e => dispatch({ type: 'SET_ANALISIS_ENTIDADES', entidades: e })} placeholder="Ej: Cliente, Factura, Producto, Pedido..." color="#d97706" />
                </div>

                <div className="meta-field-group">
                    <label className="meta-field-label">Reglas de negocio</label>
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '10px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(0,171,191,0.03))',
                        border: '1.5px solid rgba(139,92,246,0.2)',
                    }}>
                        <Scale size={15} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#6d28d9', lineHeight: 1.5 }}>
                            Las reglas se convierten en <strong>validaciones y restricciones</strong> del sistema.
                        </p>
                    </div>
                    <TagInput tags={ad.reglasNegocio} onChange={r => dispatch({ type: 'SET_ANALISIS_REGLAS', reglas: r })} placeholder="Ej: No se puede facturar sin stock, Descuento máximo 30%..." color="#8b5cf6" />
                </div>

                {/* Restricciones y hallazgos */}
                <div className="meta-field-group">
                    <label className="meta-field-label">Restricciones de acceso</label>
                    <textarea className="cyber-textarea" rows={2} placeholder="Ej: Algunos documentos son confidenciales y requieren aprobación..."
                        value={ad.restricciones}
                        onChange={ev => dispatch({ type: 'SET_ANALISIS_FIELD', field: 'restricciones', value: ev.target.value })} />
                </div>

                <div className="meta-field-group">
                    <label className="meta-field-label">Hallazgos del análisis documental</label>
                    <textarea className="cyber-textarea" rows={3} placeholder="Resume los hallazgos más importantes..."
                        value={ad.hallazgosDocumental}
                        onChange={ev => dispatch({ type: 'SET_ANALISIS_FIELD', field: 'hallazgosDocumental', value: ev.target.value })} />
                </div>

                {/* Botón Guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                    {toast && <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>✓ {toast}</span>}
                    <button type="button" onClick={guardado} className="meta-save-btn">
                        <Save size={14} /> Guardar configuración
                    </button>
                </div>
            </div>

            {/* ═══ SUB-SECCIÓN B: Documentos analizados ═══ */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(0,171,191,0.08)', paddingBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                        B · Documentos analizados
                        {ad.documentos.length > 0 && (
                            <span style={{ marginLeft: '8px', fontSize: '0.73rem', fontWeight: 600, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '8px' }}>
                                {ad.documentos.length}
                            </span>
                        )}
                    </h3>
                </div>

                {/* Uploader */}
                <SubidorArchivo
                    label="📄 Subir documento para análisis"
                    hint="PDF, Word, Excel, CSV o TXT — máx 25 MB"
                    formatsAceptados={['.pdf', '.docx', '.xlsx', '.csv', '.txt']}
                    onExtraccion={handleArchivo}
                    onError={() => { }}
                />

                {/* Lista de documentos */}
                {ad.documentos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                        {ad.documentos.map(doc => {
                            const open = expandidos.has(doc.id);
                            const pc = PRIORIDAD_COLOR[doc.relevancia];
                            return (
                                <div key={doc.id} style={{
                                    borderRadius: '12px', border: '1.5px solid rgba(0,171,191,0.1)',
                                    background: 'rgba(255,255,255,0.9)', overflow: 'hidden',
                                }}>
                                    <div onClick={() => toggleExpand(doc.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                                        cursor: 'pointer', background: open ? 'rgba(0,171,191,0.03)' : 'transparent',
                                    }}>
                                        <FileText size={16} color="#00abbf" />
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                            {doc.id}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#1a1a2e', flex: 1 }}>
                                            {doc.archivoNombre}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: `${pc}15`, color: pc, textTransform: 'uppercase' }}>
                                            {doc.relevancia}
                                        </span>
                                        <span style={{ fontSize: '0.73rem', color: '#9090a0' }}>{doc.paginasProcesadas} pág.</span>
                                        <button type="button" onClick={ev => {
                                            ev.stopPropagation();
                                            dispatch({ type: 'REMOVE_DOCUMENTO', id: doc.id });
                                            setTimeout(() => dispatch({ type: 'RECALCULAR_CONSOLIDADO' }), 50);
                                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d0d0e0', padding: '2px' }}>
                                            <Trash2 size={14} />
                                        </button>
                                        {open ? <ChevronUp size={16} color="#9090a0" /> : <ChevronDown size={16} color="#9090a0" />}
                                    </div>

                                    {open && (
                                        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,171,191,0.08)' }}>
                                            {/* Relevancia selector */}
                                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#5a5a6e' }}>Relevancia:</label>
                                                {(['alta', 'media', 'baja'] as Prioridad[]).map(p => (
                                                    <button key={p} type="button" onClick={() => dispatch({ type: 'UPDATE_DOCUMENTO', id: doc.id, campo: 'relevancia', valor: p })}
                                                        style={{
                                                            padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                                            border: `1.5px solid ${doc.relevancia === p ? PRIORIDAD_COLOR[p] : 'rgba(0,0,0,0.06)'}`,
                                                            background: doc.relevancia === p ? `${PRIORIDAD_COLOR[p]}15` : 'transparent',
                                                            color: doc.relevancia === p ? PRIORIDAD_COLOR[p] : '#9090a0', textTransform: 'capitalize',
                                                        }}>{p}</button>
                                                ))}
                                            </div>

                                            {/* Detecciones */}
                                            <div style={{
                                                padding: '14px', borderRadius: '10px',
                                                background: 'linear-gradient(135deg, rgba(245,158,11,0.04), rgba(0,171,191,0.03))',
                                                border: '1.5px solid rgba(245,158,11,0.15)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                                    <Zap size={15} color="#d97706" />
                                                    <span style={{ fontWeight: 700, fontSize: '0.83rem', color: '#92400e' }}>⚡ Detecciones automáticas</span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#d97706' }}>🗄️ Entidades ({doc.detecciones.entidades.length})</span>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                                                            {doc.detecciones.entidades.map(e => (
                                                                <span key={e} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', color: '#92400e' }}>{e}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#8b5cf6' }}>⚖️ Reglas ({doc.detecciones.reglas.length})</span>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                                                            {doc.detecciones.reglas.slice(0, 5).map((r, i) => (
                                                                <span key={i} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(139,92,246,0.08)', color: '#6d28d9' }}>
                                                                    {r.length > 50 ? r.substring(0, 47) + '...' : r}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#00abbf' }}>📦 Módulos ({doc.detecciones.modulos.length})</span>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                                                            {doc.detecciones.modulos.map(m => (
                                                                <span key={m} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,171,191,0.08)', color: '#007a8a' }}>{m}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#059669' }}>👥 Actores ({doc.detecciones.actores.length})</span>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                                                            {doc.detecciones.actores.map(a => (
                                                                <span key={a} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', color: '#065f46' }}>{a}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {doc.detecciones.camposDetectados.length > 0 && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e' }}>📋 Campos detectados: </span>
                                                        <span style={{ fontSize: '0.73rem', color: '#7070a0' }}>{doc.detecciones.camposDetectados.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notas */}
                                            <div style={{ marginTop: '12px' }}>
                                                <textarea className="cyber-textarea" rows={2} placeholder="Notas sobre este documento..."
                                                    value={doc.notas}
                                                    onChange={ev => dispatch({ type: 'UPDATE_DOCUMENTO', id: doc.id, campo: 'notas', valor: ev.target.value })} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══ PANEL CONSOLIDADO ═══ */}
            {ad.documentos.length > 0 && (
                <div style={{
                    padding: '20px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(0,171,191,0.04), rgba(139,92,246,0.03))',
                    border: '2px solid rgba(0,171,191,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'linear-gradient(135deg, #00abbf, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Zap size={16} color="white" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e' }}>
                                    Consolidado de detecciones
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.73rem', color: '#9090a0' }}>
                                    Fusión de todas las detecciones de {ad.documentos.length} documento{ad.documentos.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={() => dispatch({ type: 'RECALCULAR_CONSOLIDADO' })} style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                            borderRadius: '7px', border: '1px solid rgba(0,171,191,0.3)', background: 'rgba(0,171,191,0.05)',
                            color: '#007a8a', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                        }}>
                            <RefreshCw size={13} /> Recalcular
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <Database size={14} color="#d97706" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>
                                    Entidades ({ad.consolidado.entidades.length})
                                </span>
                            </div>
                            <TagInput tags={ad.consolidado.entidades} onChange={ent => {
                                // Manually update the consolidado entidades
                                dispatch({ type: 'SET_ANALISIS_ENTIDADES', entidades: ent });
                            }} placeholder="Agregar entidad..." color="#d97706" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <Scale size={14} color="#8b5cf6" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>
                                    Reglas ({ad.consolidado.reglas.length})
                                </span>
                            </div>
                            <TagInput tags={ad.consolidado.reglas} onChange={r => {
                                dispatch({ type: 'SET_ANALISIS_REGLAS', reglas: r });
                            }} placeholder="Agregar regla..." color="#8b5cf6" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <Boxes size={14} color="#00abbf" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00abbf' }}>
                                    Módulos ({ad.consolidado.modulos.length})
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {ad.consolidado.modulos.map(m => (
                                    <span key={m} style={{ fontSize: '0.73rem', padding: '3px 10px', borderRadius: '8px', background: 'rgba(0,171,191,0.06)', color: '#007a8a', border: '1px solid rgba(0,171,191,0.12)' }}>{m}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <Users size={14} color="#059669" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                                    Actores ({ad.consolidado.actores.length})
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {ad.consolidado.actores.map(a => (
                                    <span key={a} style={{ fontSize: '0.73rem', padding: '3px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', color: '#065f46', border: '1px solid rgba(16,185,129,0.12)' }}>{a}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
