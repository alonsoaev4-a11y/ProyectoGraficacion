// Sección 1 — Información General del Proyecto
// Recoge los datos básicos: nombre, descripción, tipo de sistema, dominio, equipo y fecha de inicio

import { MetadatosAction, ProyectoState, TipoSistema, DominioNegocio } from '../metadatosReducer';

interface Props {
    proyecto: ProyectoState;
    dispatch: React.Dispatch<MetadatosAction>;
}

const TIPOS_SISTEMA: { value: TipoSistema; label: string }[] = [
    { value: 'web', label: '🌐 Web' },
    { value: 'movil', label: '📱 Móvil' },
    { value: 'desktop', label: '🖥️ Desktop' },
    { value: 'hibrido', label: '⚡ Híbrido' },
];

const DOMINIOS: { value: DominioNegocio; label: string }[] = [
    { value: 'salud', label: 'Salud' },
    { value: 'educacion', label: 'Educación' },
    { value: 'finanzas', label: 'Finanzas' },
    { value: 'logistica', label: 'Logística' },
    { value: 'otro', label: 'Otro' },
];

export const SeccionInfoGeneral = ({ proyecto, dispatch }: Props) => {
    // Actualiza un campo genérico del proyecto
    const setField = (field: keyof ProyectoState, value: ProyectoState[keyof ProyectoState]) => {
        dispatch({ type: 'SET_PROYECTO_FIELD', field, value });
    };

    return (
        <div>
            {/* Nombre */}
            <div className="meta-field-group">
                <label className="meta-field-label">Nombre del proyecto <span>*</span></label>
                <input
                    type="text"
                    className="cyber-input"
                    placeholder="ej. Sistema de Gestión de Inventario"
                    value={proyecto.nombre}
                    onChange={e => setField('nombre', e.target.value)}
                />
            </div>

            {/* Descripción */}
            <div className="meta-field-group">
                <label className="meta-field-label">Descripción del sistema <span>*</span></label>
                <textarea
                    className="cyber-textarea"
                    placeholder="¿Qué problema resuelve este software? Describe el objetivo principal del sistema a construir."
                    rows={4}
                    value={proyecto.descripcion}
                    onChange={e => setField('descripcion', e.target.value)}
                />
            </div>

            {/* Tipo de sistema */}
            <div className="meta-field-group">
                <label className="meta-field-label">Tipo de sistema</label>
                <p style={{ fontSize: '0.77rem', color: '#9090a0', margin: '0 0 8px' }}>
                    Selecciona uno o más tipos
                </p>
                <div className="meta-chips-group">
                    {TIPOS_SISTEMA.map(tipo => (
                        <button
                            key={tipo.value}
                            type="button"
                            className={`meta-chip ${proyecto.tipoSistema.includes(tipo.value) ? 'selected' : ''}`}
                            onClick={() => dispatch({ type: 'TOGGLE_TIPO_SISTEMA', value: tipo.value })}
                        >
                            {tipo.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dominio del negocio */}
            <div className="meta-field-group">
                <label className="meta-field-label">Dominio del negocio</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <select
                        className="cyber-select"
                        style={{ flex: '1', minWidth: '160px' }}
                        value={proyecto.dominio}
                        onChange={e => setField('dominio', e.target.value as DominioNegocio)}
                    >
                        <option value="">Seleccionar dominio...</option>
                        {DOMINIOS.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                    {proyecto.dominio === 'otro' && (
                        <input
                            type="text"
                            className="cyber-input"
                            style={{ flex: '1', minWidth: '160px' }}
                            placeholder="Especifica el dominio..."
                            value={proyecto.dominioPersonalizado}
                            onChange={e => setField('dominioPersonalizado', e.target.value)}
                        />
                    )}
                </div>
            </div>

            {/* Equipo responsable */}
            <div className="meta-field-group">
                <label className="meta-field-label">Equipo responsable</label>
                <input
                    type="text"
                    className="cyber-input"
                    placeholder="ej. Equipo Backend, Squad Alpha, etc."
                    value={proyecto.equipo}
                    onChange={e => setField('equipo', e.target.value)}
                />
            </div>

            {/* Fecha estimada de inicio */}
            <div className="meta-field-group">
                <label className="meta-field-label">Fecha estimada de inicio</label>
                <input
                    type="date"
                    className="cyber-input"
                    style={{ maxWidth: '220px' }}
                    value={proyecto.fechaInicio}
                    onChange={e => setField('fechaInicio', e.target.value)}
                />
            </div>
        </div>
    );
};
