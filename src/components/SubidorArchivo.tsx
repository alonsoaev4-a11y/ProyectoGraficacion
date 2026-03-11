// SubidorArchivo.tsx — Componente reutilizable para carga y extracción de documentos
// Soporta: Word (.docx), PDF, CSV, Excel (.xlsx/.xls), TXT
// Ejecuta analizarParaHerman() automáticamente sobre el texto extraído

import { useState, useRef } from 'react'
import { extraerContenido, type TipoArchivo } from '../utils/extractores'
import { analizarParaHerman, type AnalisisHerman } from '../utils/analizadorHerman'
import { Upload, Check, AlertTriangle, Loader2 } from 'lucide-react'

export interface ResultadoExtraccion {
    texto: string
    datos: Record<string, string>[] | null
    nombreArchivo: string
    tipo: TipoArchivo
    paginasProcesadas: number
    detecciones: AnalisisHerman
}

interface Props {
    formatsAceptados: string[]       // ['.pdf', '.docx', '.csv', '.xlsx', '.txt']
    label: string
    hint?: string
    onExtraccion: (resultado: ResultadoExtraccion) => void
    onError: (mensaje: string) => void
}

type Estado = 'idle' | 'procesando' | 'completado' | 'error'

const TIPO_ICONOS: Record<TipoArchivo, string> = {
    word: '📄', pdf: '📕', csv: '📊', excel: '📊', txt: '📝', desconocido: '📁',
}

export const SubidorArchivo = ({ formatsAceptados, label, hint, onExtraccion, onError }: Props) => {
    const [estado, setEstado] = useState<Estado>('idle')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [resultado, setResultado] = useState<ResultadoExtraccion | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [progresoPdf, setProgresoPdf] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const acceptStr = formatsAceptados.join(',')

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tamaño
        if (file.size > 25 * 1024 * 1024) {
            setEstado('error')
            setErrorMsg('El archivo supera 25 MB')
            onError('ARCHIVO_MUY_GRANDE')
            return
        }

        setArchivo(file)
        setEstado('procesando')
        setProgresoPdf(null)

        try {
            const contenido = await extraerContenido(file, (pagina, total) => {
                setProgresoPdf(`Procesando página ${pagina} de ${total}...`)
            })

            if (contenido.tipo === 'desconocido') {
                setEstado('error')
                setErrorMsg('Formato no soportado')
                onError('FORMATO_NO_SOPORTADO')
                return
            }

            // Limitar texto a 50,000 chars en el resultado
            const textoLimitado = contenido.texto.length > 50000
                ? contenido.texto.substring(0, 5000) + `\n\n[...Texto truncado. Total: ${contenido.texto.length} caracteres]`
                : contenido.texto

            const detecciones = analizarParaHerman(contenido.texto)

            const res: ResultadoExtraccion = {
                texto: textoLimitado,
                datos: contenido.datos,
                nombreArchivo: file.name,
                tipo: contenido.tipo,
                paginasProcesadas: contenido.paginasProcesadas,
                detecciones,
            }

            setResultado(res)
            setEstado('completado')
            onExtraccion(res)
        } catch (err: any) {
            setEstado('error')
            setErrorMsg(err.message || 'Error al procesar el archivo')
            onError(err.message)
        }
    }

    const resetear = () => {
        setEstado('idle')
        setArchivo(null)
        setResultado(null)
        setErrorMsg('')
        setProgresoPdf(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Drag & drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && fileInputRef.current) {
            const dt = new DataTransfer()
            dt.items.add(file)
            fileInputRef.current.files = dt.files
            fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
        }
    }

    return (
        <div style={{
            borderRadius: '12px', border: '1px solid rgba(0,171,191,0.3)',
            background: 'rgba(10,10,18,0.6)', overflow: 'hidden',
            boxShadow: 'inset 0 0 15px rgba(0,171,191,0.05)'
        }}>
            {/* Label */}
            <div style={{ padding: '10px 14px 0' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#00ffff', textShadow: '0 0 5px rgba(0,171,191,0.5)' }}>{label}</span>
                {hint && <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: '#a0a0b0' }}>{hint}</p>}
            </div>

            <div style={{ padding: '12px 14px 14px' }}>
                {/* IDLE — zona de drop */}
                {estado === 'idle' && (
                    <div
                        style={{
                            border: '2px dashed rgba(0,171,191,0.4)', borderRadius: '10px',
                            padding: '20px', textAlign: 'center', cursor: 'pointer',
                            transition: 'all 0.2s', background: 'rgba(0,171,191,0.05)',
                            boxShadow: 'inset 0 0 10px rgba(0,171,191,0.1)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ffff'; e.currentTarget.style.background = 'rgba(0,171,191,0.1)'; e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0,171,191,0.2), 0 0 10px rgba(0,171,191,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,171,191,0.4)'; e.currentTarget.style.background = 'rgba(0,171,191,0.05)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(0,171,191,0.1)'; }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <Upload size={24} color="#00ffff" style={{ marginBottom: '6px', filter: 'drop-shadow(0 0 5px rgba(0,171,191,0.5))' }} />
                        <p style={{ margin: '0 0 4px', fontSize: '0.83rem', fontWeight: 600, color: '#e0e0e8' }}>
                            Arrastra un archivo aquí o <span style={{ color: '#00ffff', textShadow: '0 0 5px rgba(0,171,191,0.5)' }}>selecciona</span>
                        </p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#a0a0b0' }}>
                            {formatsAceptados.map(f => f.replace('.', '')).join(', ').toUpperCase()} — máx 25 MB
                        </p>
                        <input ref={fileInputRef} type="file" accept={acceptStr}
                            style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>
                )}

                {/* PROCESANDO */}
                {estado === 'procesando' && (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Loader2 size={22} color="#00ffff" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px', filter: 'drop-shadow(0 0 5px rgba(0,171,191,0.5))' }} />
                        <p style={{ margin: '0 0 4px', fontSize: '0.83rem', fontWeight: 600, color: '#e0e0e8' }}>
                            Extrayendo contenido de {archivo?.name}...
                        </p>
                        {progresoPdf && (
                            <p style={{ margin: 0, fontSize: '0.77rem', color: '#00ffff', textShadow: '0 0 5px rgba(0,171,191,0.3)' }}>{progresoPdf}</p>
                        )}
                    </div>
                )}

                {/* COMPLETADO */}
                {estado === 'completado' && resultado && (
                    <div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
                        }}>
                            <span style={{ fontSize: '1.3rem', filter: 'drop-shadow(0 0 5px rgba(0,255,136,0.5))' }}>{TIPO_ICONOS[resultado.tipo]}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.83rem', color: '#e0e0e8' }}>
                                        {resultado.nombreArchivo}
                                    </span>
                                    <span style={{
                                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px',
                                        background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)',
                                        boxShadow: '0 0 10px rgba(0,255,136,0.2)'
                                    }}>
                                        <Check size={10} style={{ marginRight: '2px', verticalAlign: 'middle' }} /> Extraído
                                    </span>
                                </div>
                                <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: '#a0a0b0' }}>
                                    {resultado.tipo === 'csv' || resultado.tipo === 'excel'
                                        ? `${resultado.datos?.length ?? 0} filas · ${resultado.datos?.[0] ? Object.keys(resultado.datos[0]).length : 0} columnas`
                                        : resultado.tipo === 'pdf'
                                            ? `${resultado.paginasProcesadas} páginas procesadas`
                                            : `${resultado.texto.length} caracteres extraídos`
                                    }
                                </p>
                            </div>
                            <button onClick={resetear} style={{
                                padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(0,171,191,0.3)',
                                background: 'rgba(0,171,191,0.1)', color: '#00ffff', fontSize: '0.77rem', cursor: 'pointer',
                                transition: 'all 0.2s', boxShadow: '0 0 10px rgba(0,171,191,0.2)'
                            }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,171,191,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,171,191,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,171,191,0.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0,171,191,0.2)'; }}>Cambiar</button>
                        </div>

                        {/* Preview de las primeras líneas */}
                        <div style={{
                            padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,255,136,0.05)',
                            border: '1px solid rgba(0,255,136,0.2)', fontSize: '0.77rem',
                            color: '#e0e0e8', lineHeight: 1.5, maxHeight: '60px', overflow: 'hidden',
                            boxShadow: 'inset 0 0 10px rgba(0,255,136,0.05)'
                        }}>
                            {resultado.texto.substring(0, 200)}...
                        </div>

                        {/* Preview tabla para CSV/Excel */}
                        {resultado.datos && resultado.datos.length > 0 && (
                            <div style={{ marginTop: '8px', overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(0,171,191,0.3)', background: 'rgba(10,10,18,0.8)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(0,171,191,0.1)' }}>
                                            {Object.keys(resultado.datos[0]).slice(0, 6).map(col => (
                                                <th key={col} style={{
                                                    padding: '6px 8px', textAlign: 'left', fontWeight: 700,
                                                    color: '#00ffff', borderBottom: '1px solid rgba(0,171,191,0.3)',
                                                    textShadow: '0 0 5px rgba(0,171,191,0.3)'
                                                }}>{col}</th>
                                            ))}
                                            {Object.keys(resultado.datos[0]).length > 6 && (
                                                <th style={{ padding: '6px 8px', color: '#a0a0b0', borderBottom: '1px solid rgba(0,171,191,0.3)' }}>
                                                    +{Object.keys(resultado.datos[0]).length - 6} más
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultado.datos.slice(0, 5).map((row, i) => (
                                            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                                {Object.values(row).slice(0, 6).map((val, j) => (
                                                    <td key={j} style={{
                                                        padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e0e0e8',
                                                    }}>{String(val).substring(0, 40)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {resultado.datos.length > 5 && (
                                    <p style={{
                                        margin: 0, padding: '6px 8px', fontSize: '0.72rem', color: '#a0a0b0',
                                        borderTop: '1px solid rgba(0,171,191,0.3)', background: 'rgba(0,171,191,0.05)',
                                    }}>
                                        Mostrando 5 de {resultado.datos.length} filas
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ERROR */}
                {estado === 'error' && (
                    <div style={{
                        padding: '12px 14px', borderRadius: '10px',
                        background: 'rgba(255,0,60,0.1)', border: '1px solid rgba(255,0,60,0.3)',
                        boxShadow: 'inset 0 0 10px rgba(255,0,60,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <AlertTriangle size={15} color="#ff003c" style={{ filter: 'drop-shadow(0 0 5px rgba(255,0,60,0.5))' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.83rem', color: '#ff003c', textShadow: '0 0 5px rgba(255,0,60,0.3)' }}>
                                {errorMsg}
                            </span>
                        </div>
                        <button onClick={resetear} style={{
                            marginTop: '6px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,0,60,0.3)',
                            background: 'rgba(255,0,60,0.1)', color: '#ff003c', fontSize: '0.78rem', cursor: 'pointer',
                            transition: 'all 0.2s', boxShadow: '0 0 10px rgba(255,0,60,0.2)'
                        }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,60,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,0,60,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,0,60,0.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(255,0,60,0.2)'; }}>Reintentar</button>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}
