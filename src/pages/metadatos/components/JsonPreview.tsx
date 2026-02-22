// JsonPreview — muestra el JSON con syntax highlighting manual (sin librerías externas)
// Incluye botones para copiar al portapapeles y descargar como .json

import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

interface JsonPreviewProps {
    data: unknown;
    filename?: string;
}

// Aplica clases CSS para coloring del JSON — sin uso de dangerouslySetInnerHTML
function renderJson(data: unknown, indent = 0): React.ReactNode {
    const pad = '  '.repeat(indent);
    const padClose = '  '.repeat(Math.max(0, indent - 1));

    if (data === null) return <span className="meta-json-null">null</span>;
    if (typeof data === 'boolean') return <span className="meta-json-boolean">{data.toString()}</span>;
    if (typeof data === 'number') return <span className="meta-json-number">{data}</span>;
    if (typeof data === 'string') return <span className="meta-json-string">"{data}"</span>;

    if (Array.isArray(data)) {
        if (data.length === 0) return <span className="meta-json-bracket">[]</span>;
        return (
            <>
                <span className="meta-json-bracket">{'['}</span>
                {data.map((item, i) => (
                    <div key={i} style={{ paddingLeft: '18px' }}>
                        {pad}  {renderJson(item, indent + 1)}{i < data.length - 1 ? <span className="meta-json-bracket">,</span> : null}
                    </div>
                ))}
                <span className="meta-json-bracket">{padClose}{']'}</span>
            </>
        );
    }

    if (typeof data === 'object') {
        const entries = Object.entries(data as Record<string, unknown>);
        if (entries.length === 0) return <span className="meta-json-bracket">{'{}'}</span>;
        return (
            <>
                <span className="meta-json-bracket">{'{'}</span>
                {entries.map(([key, value], i) => (
                    <div key={key} style={{ paddingLeft: '18px' }}>
                        {pad}  <span className="meta-json-key">"{key}"</span>
                        <span className="meta-json-bracket">: </span>
                        {renderJson(value, indent + 1)}
                        {i < entries.length - 1 ? <span className="meta-json-bracket">,</span> : null}
                    </div>
                ))}
                <span className="meta-json-bracket">{padClose}{'}'}</span>
            </>
        );
    }

    return <span>{String(data)}</span>;
}

export const JsonPreview = ({ data, filename = 'proyecto-metadatos' }: JsonPreviewProps) => {
    const [copiado, setCopiado] = useState(false);

    const jsonString = JSON.stringify(data, null, 2);

    // Copia al portapapeles y muestra feedback visual
    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            console.error('No se pudo copiar al portapapeles');
        }
    };

    // Descarga como archivo .json
    const descargar = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <button type="button" onClick={copiar} className="cyber-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                    {copiado ? <Check size={14} /> : <Copy size={14} />}
                    {copiado ? 'Copiado!' : 'Copiar JSON'}
                </button>
                <button type="button" onClick={descargar} className="cyber-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                    <Download size={14} />
                    Descargar .json
                </button>
            </div>

            {/* Panel de sintaxis */}
            <div className="meta-json-container">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {renderJson(data)}
                </pre>
            </div>
        </div>
    );
};
