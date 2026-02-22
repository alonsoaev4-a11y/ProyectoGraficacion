// SeccionHistorias.tsx — Sección 5: Historias de Usuario
// Constructor inline con preview, CRUD cards, import/export, role validation

import { useState } from 'react';
import {
    MetadatosAction, HistoriasUsuarioState, HistoriaUsuario, Prioridad,
} from '../metadatosReducer';
import { SubidorArchivo, type ResultadoExtraccion } from '../../../components/SubidorArchivo';
import { useToast } from '../hooks/useToast';
import {
    Plus, Trash2, Edit3, Check, X, Download, Upload, Save,
} from 'lucide-react';

interface Props {
    historias: HistoriasUsuarioState;
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

const PRIORIDAD_COLOR: Record<Prioridad, { bg: string; text: string; border: string }> = {
    alta: { bg: 'rgba(239,68,68,0.08)', text: '#dc2626', border: 'rgba(239,68,68,0.2)' },
    media: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)' },
    baja: { bg: 'rgba(16,185,129,0.08)', text: '#059669', border: 'rgba(16,185,129,0.2)' },
};

const PRIORIDAD_ORDEN: Record<Prioridad, number> = { alta: 1, media: 2, baja: 3 };

export const SeccionHistorias = ({ historias: hu, activo, dispatch }: Props) => {
    const { toast, guardado } = useToast();
    // Constructor inline
    const [rol, setRol] = useState('');
    const [accion, setAccion] = useState('');
    const [beneficio, setBeneficio] = useState('');
    const [prioridad, setPrioridad] = useState<Prioridad>('media');
    const [criterios, setCriterios] = useState('');

    // Edit mode
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState<HistoriaUsuario | null>(null);

    // Import
    const [importOpen, setImportOpen] = useState(false);

    if (!activo) {
        return (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9090a0' }}>
                <p>Activa el método <strong>"Historias de Usuario"</strong> en la Sección 2 para configurar esta sección.</p>
            </div>
        );
    }

    const nextId = () => `HU-${String(hu.historias.length + 1).padStart(3, '0')}`;

    const addHistoria = () => {
        if (!rol.trim() || !accion.trim()) return;
        dispatch({
            type: 'ADD_HISTORIA',
            historia: { id: nextId(), rol: rol.trim(), accion: accion.trim(), beneficio: beneficio.trim(), criteriosAceptacion: criterios.trim(), prioridad },
        });
        setRol(''); setAccion(''); setBeneficio(''); setCriterios(''); setPrioridad('media');
    };

    const previewText = rol || accion
        ? `Como ${rol || '___'}, quiero ${accion || '___'}${beneficio ? `, para ${beneficio}` : ''}`
        : '';

    const sortedHistorias = [...hu.historias].sort((a, b) => PRIORIDAD_ORDEN[a.prioridad] - PRIORIDAD_ORDEN[b.prioridad]);

    // Import from file
    const handleImport = (resultado: ResultadoExtraccion) => {
        const nuevas: HistoriaUsuario[] = [];
        const textoLines = resultado.texto.split('\n').filter(l => l.trim());
        const regex = /[Cc]omo\s+(.+?),?\s+quiero\s+(.+?)(?:,?\s+para\s+(.+))?$/;
        let idx = hu.historias.length;

        // If CSV/Excel with data, try mapping columns
        if (resultado.datos && resultado.datos.length > 0) {
            const cols = Object.keys(resultado.datos[0]).map(c => c.toLowerCase());
            const rolCol = cols.find(c => c.includes('rol') || c.includes('actor') || c.includes('who'));
            const accionCol = cols.find(c => c.includes('accion') || c.includes('quiero') || c.includes('want') || c.includes('story'));
            const beneficioCol = cols.find(c => c.includes('beneficio') || c.includes('para') || c.includes('benefit') || c.includes('value'));
            const prioridadCol = cols.find(c => c.includes('prioridad') || c.includes('priority'));
            const criteriosCol = cols.find(c => c.includes('criterio') || c.includes('acceptance') || c.includes('criteria'));

            for (const row of resultado.datos) {
                const rowLower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
                const rRol = rolCol ? rowLower[rolCol] : '';
                const rAcc = accionCol ? rowLower[accionCol] : '';
                if (rAcc) {
                    idx++;
                    nuevas.push({
                        id: `HU-${String(idx).padStart(3, '0')}`,
                        rol: rRol || 'Usuario',
                        accion: rAcc,
                        beneficio: beneficioCol ? rowLower[beneficioCol] || '' : '',
                        prioridad: prioridadCol ? (rowLower[prioridadCol]?.toLowerCase() as Prioridad) || 'media' : 'media',
                        criteriosAceptacion: criteriosCol ? rowLower[criteriosCol] || '' : '',
                    });
                }
            }
        } else {
            // Parse from text
            for (const line of textoLines) {
                const match = regex.exec(line.trim());
                if (match) {
                    idx++;
                    nuevas.push({
                        id: `HU-${String(idx).padStart(3, '0')}`,
                        rol: match[1].trim(),
                        accion: match[2].trim(),
                        beneficio: match[3]?.trim() || '',
                        prioridad: 'media',
                        criteriosAceptacion: '',
                    });
                }
            }
        }

        if (nuevas.length > 0) {
            dispatch({ type: 'IMPORT_HISTORIAS', historias: nuevas });
        }
        setImportOpen(false);
    };

    // Export to CSV
    const exportCSV = () => {
        const header = 'ID,Rol,Acción,Beneficio,Prioridad,Criterios de Aceptación';
        const rows = hu.historias.map(h =>
            `"${h.id}","${h.rol}","${h.accion}","${h.beneficio}","${h.prioridad}","${h.criteriosAceptacion}"`
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'historias-usuario.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ═══ Roles ═══ */}
            <div className="meta-field-group">
                <label className="meta-field-label">Roles del sistema <span>*</span></label>
                <TagInput tags={hu.roles} onChange={r => dispatch({ type: 'SET_HISTORIAS_ROLES', roles: r })} placeholder="Ej: Administrador, Cliente, Gerente..." />

                {/* Botón Guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                    {toast && <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>✓ {toast}</span>}
                    <button type="button" onClick={guardado} className="meta-save-btn">
                        <Save size={14} /> Guardar configuración
                    </button>
                </div>
            </div>

            {/* ═══ Constructor inline ═══ */}
            <div style={{
                padding: '16px', borderRadius: '12px', border: '1.5px solid rgba(0,171,191,0.15)',
                background: 'rgba(248,250,252,0.95)',
            }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
                    ✏️ Nueva historia de usuario
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                        <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Rol</label>
                        <select className="cyber-select" value={rol} onChange={ev => setRol(ev.target.value)}>
                            <option value="">Seleccionar...</option>
                            {hu.roles.map(r => <option key={r} value={r}>{r}</option>)}
                            <option value="__otro__">Otro...</option>
                        </select>
                        {rol === '__otro__' && (
                            <input className="cyber-input" placeholder="Escribe el rol..." style={{ marginTop: '4px' }}
                                onChange={ev => setRol(ev.target.value)} />
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Quiero... <span style={{ color: '#ef4444' }}>*</span></label>
                        <input className="cyber-input" placeholder="Ej: poder generar reportes mensuales"
                            value={accion} onChange={ev => setAccion(ev.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Para...</label>
                        <input className="cyber-input" placeholder="Ej: tomar decisiones informadas"
                            value={beneficio} onChange={ev => setBeneficio(ev.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                        <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Prioridad</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {(['alta', 'media', 'baja'] as Prioridad[]).map(p => {
                                const c = PRIORIDAD_COLOR[p];
                                return (
                                    <button key={p} type="button" onClick={() => setPrioridad(p)} style={{
                                        padding: '5px 14px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                                        border: `1.5px solid ${prioridad === p ? c.border : 'rgba(0,0,0,0.06)'}`,
                                        background: prioridad === p ? c.bg : 'transparent',
                                        color: prioridad === p ? c.text : '#9090a0', textTransform: 'capitalize',
                                    }}>{p}</button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#5a5a6e', display: 'block', marginBottom: '4px' }}>Criterios de aceptación</label>
                        <input className="cyber-input" placeholder="Ej: El reporte debe incluir gráficas y ser exportable a PDF"
                            value={criterios} onChange={ev => setCriterios(ev.target.value)} />
                    </div>
                </div>

                {/* Preview */}
                {previewText && (
                    <div style={{
                        padding: '10px 14px', borderRadius: '8px', marginBottom: '10px',
                        background: 'rgba(0,171,191,0.04)', border: '1px solid rgba(0,171,191,0.1)',
                        fontSize: '0.82rem', color: '#1a1a2e', fontStyle: 'italic',
                    }}>
                        "{previewText}"
                    </div>
                )}

                <button type="button" onClick={addHistoria} disabled={!rol.trim() || !accion.trim()} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                    borderRadius: '8px', border: 'none', cursor: !rol.trim() || !accion.trim() ? 'not-allowed' : 'pointer',
                    background: !rol.trim() || !accion.trim() ? '#e0e0e8' : 'linear-gradient(135deg, #00abbf, #007a8a)',
                    color: !rol.trim() || !accion.trim() ? '#9090a0' : 'white', fontWeight: 700, fontSize: '0.83rem',
                }}>
                    <Plus size={14} /> Agregar historia
                </button>
            </div>

            {/* ═══ Import / Export bar ═══ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button type="button" onClick={() => setImportOpen(!importOpen)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                    borderRadius: '8px', border: '1px solid rgba(0,171,191,0.2)', background: 'rgba(0,171,191,0.04)',
                    color: '#007a8a', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                }}>
                    <Upload size={13} /> Importar historias
                </button>
                {hu.historias.length > 0 && (
                    <button type="button" onClick={exportCSV} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                        borderRadius: '8px', border: '1px solid rgba(0,171,191,0.2)', background: 'rgba(0,171,191,0.04)',
                        color: '#007a8a', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                    }}>
                        <Download size={13} /> Exportar CSV
                    </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.76rem', color: '#9090a0' }}>
                    {hu.historias.length} historia{hu.historias.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Import panel */}
            {importOpen && (
                <SubidorArchivo
                    label="📥 Importar historias desde archivo"
                    hint='CSV con columnas rol/acción/beneficio/prioridad, o TXT con formato "Como [X], quiero [Y], para [Z]"'
                    formatsAceptados={['.csv', '.xlsx', '.txt', '.docx']}
                    onExtraccion={handleImport}
                    onError={() => { }}
                />
            )}

            {/* ═══ Lista de historias ═══ */}
            {sortedHistorias.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sortedHistorias.map(h => {
                        const isEditing = editId === h.id;
                        const c = PRIORIDAD_COLOR[h.prioridad];

                        if (isEditing && editData) {
                            return (
                                <div key={h.id} style={{
                                    padding: '14px', borderRadius: '10px', border: `1.5px solid #00abbf`, background: 'rgba(0,171,191,0.03)',
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '8px', marginBottom: '8px' }}>
                                        <select className="cyber-select" value={editData.rol} onChange={ev => setEditData({ ...editData, rol: ev.target.value })}>
                                            {hu.roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <input className="cyber-input" value={editData.accion} onChange={ev => setEditData({ ...editData, accion: ev.target.value })} />
                                        <input className="cyber-input" value={editData.beneficio} onChange={ev => setEditData({ ...editData, beneficio: ev.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button type="button" onClick={() => { dispatch({ type: 'UPDATE_HISTORIA', historia: editData }); setEditId(null); setEditData(null); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '6px', border: 'none', background: '#00abbf', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                                            <Check size={12} /> Guardar
                                        </button>
                                        <button type="button" onClick={() => { setEditId(null); setEditData(null); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e0e0e8', background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.78rem', cursor: 'pointer' }}>
                                            <X size={12} /> Cancelar
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={h.id} style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                                borderRadius: '10px', border: `1.5px solid ${c.border}`, background: c.bg,
                            }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700, color: '#00abbf', background: 'rgba(0,171,191,0.08)', padding: '2px 6px', borderRadius: '5px' }}>
                                    {h.id}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                                    background: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: 'uppercase',
                                }}>{h.prioridad}</span>
                                <span style={{ flex: 1, fontSize: '0.82rem', color: '#1a1a2e' }}>
                                    Como <strong>{h.rol}</strong>, quiero <strong>{h.accion}</strong>
                                    {h.beneficio && <>, para <em>{h.beneficio}</em></>}
                                </span>
                                <button type="button" onClick={() => { setEditId(h.id); setEditData({ ...h }); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9090a0', padding: '2px' }}>
                                    <Edit3 size={13} />
                                </button>
                                <button type="button" onClick={() => dispatch({ type: 'REMOVE_HISTORIA', id: h.id })}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d0d0e0', padding: '2px' }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Criterios generales */}
            <div className="meta-field-group">
                <label className="meta-field-label">Criterios generales de aceptación</label>
                <textarea className="cyber-textarea" rows={3}
                    placeholder="Criterios que aplican a todas las historias, ej: seguridad, rendimiento, accesibilidad..."
                    value={hu.criteriosGenerales}
                    onChange={ev => dispatch({ type: 'SET_HISTORIAS_FIELD', field: 'criteriosGenerales', value: ev.target.value })} />
            </div>
        </div>
    );
};
