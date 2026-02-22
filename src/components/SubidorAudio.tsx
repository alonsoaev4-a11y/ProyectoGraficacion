// SubidorAudio.tsx — Componente reutilizable para carga y transcripción de audio
// Soporta: subir archivo, grabar en vivo (MediaRecorder), y transcribir con Groq

import { useState, useRef, useCallback } from 'react'
import {
    transcribirAudio,
    type ResultadoTranscripcion,
    type ProgresoTranscripcion,
} from '../utils/transcriptorAudio'
import { Mic, Upload, StopCircle, Loader2, Check, AlertTriangle, Settings } from 'lucide-react'

interface Props {
    onTranscripcion: (resultado: ResultadoTranscripcion) => void
    onError: (mensaje: string) => void
    onAbrirConfig?: () => void
    label?: string
}

type Estado = 'idle' | 'seleccionado' | 'transcribiendo' | 'grabando' | 'completado' | 'error'
type Tab = 'subir' | 'grabar'

const MAX_MB = 25
const FORMATOS = '.mp3,.mp4,.m4a,.wav,.webm,.ogg,.flac'

export const SubidorAudio = ({ onTranscripcion, onError, onAbrirConfig, label }: Props) => {
    const [tab, setTab] = useState<Tab>('subir')
    const [estado, setEstado] = useState<Estado>('idle')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [progreso, setProgreso] = useState<ProgresoTranscripcion>('preparando')
    const [progresoDetalle, setProgresoDetalle] = useState('')
    const [resultado, setResultado] = useState<ResultadoTranscripcion | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [mostrarCompleto, setMostrarCompleto] = useState(false)
    const [editando, setEditando] = useState(false)
    const [textoEditado, setTextoEditado] = useState('')

    // Grabación
    const [grabando, setGrabando] = useState(false)
    const [tiempoGrab, setTiempoGrab] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const tieneKey = !!localStorage.getItem('herman_groq_key')

    // ── Subida de archivo ──
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > MAX_MB * 1024 * 1024) {
            setEstado('error')
            setErrorMsg(`El archivo supera ${MAX_MB} MB. Divide el audio o sube la transcripción como .txt`)
            onError('FILE_TOO_LARGE')
            return
        }
        setArchivo(file)
        setEstado('seleccionado')
        setErrorMsg('')
        setResultado(null)
    }

    const handleTranscribir = async () => {
        if (!archivo) return
        if (!tieneKey) {
            setEstado('error')
            setErrorMsg('API_KEY_MISSING')
            return
        }
        setEstado('transcribiendo')
        try {
            const res = await transcribirAudio(archivo, (estado, detalle) => {
                setProgreso(estado)
                if (detalle) setProgresoDetalle(detalle)
            })
            setResultado(res)
            setTextoEditado(res.texto)
            setEstado('completado')
            onTranscripcion(res)
        } catch (err: any) {
            setEstado('error')
            setErrorMsg(err.message || 'Error desconocido')
            onError(err.message)
        }
    }

    // ── Grabación en vivo ──
    const iniciarGrabacion = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
            chunksRef.current = []
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }
            recorder.onstop = () => {
                stream.getTracks().forEach(t => t.stop())
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                const file = new File([blob], `grabacion-${Date.now()}.webm`, { type: 'audio/webm' })
                setArchivo(file)
                setEstado('seleccionado')
                setGrabando(false)
                if (timerRef.current) clearInterval(timerRef.current)
            }
            mediaRecorderRef.current = recorder
            recorder.start(1000)
            setGrabando(true)
            setEstado('grabando')
            setTiempoGrab(0)
            timerRef.current = setInterval(() => setTiempoGrab(t => t + 1), 1000)
        } catch {
            setEstado('error')
            setErrorMsg('No se pudo acceder al micrófono. Verifica los permisos del navegador.')
            onError('MIC_ACCESS_DENIED')
        }
    }, [onError])

    const detenerGrabacion = () => {
        mediaRecorderRef.current?.stop()
    }

    const resetear = () => {
        setEstado('idle')
        setArchivo(null)
        setResultado(null)
        setErrorMsg('')
        setMostrarCompleto(false)
        setEditando(false)
    }

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

    // ── Barra de progreso visual ──
    const progresoNum: Record<ProgresoTranscripcion, number> = {
        preparando: 20, enviando: 50, procesando: 80, completado: 100, error: 0,
    }

    return (
        <div style={{
            borderRadius: '12px', border: '1.5px solid rgba(0,171,191,0.12)',
            background: 'rgba(248,250,252,0.95)', overflow: 'hidden',
        }}>
            {/* Label */}
            {label && (
                <div style={{ padding: '10px 14px 0', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a2e' }}>
                    {label}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,171,191,0.08)', padding: '0 14px' }}>
                {([['subir', '🎵 Subir audio'], ['grabar', '⏺ Grabar en vivo']] as [Tab, string][]).map(([t, l]) => (
                    <button key={t} onClick={() => { setTab(t); if (estado === 'idle') resetear() }}
                        style={{
                            padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#00abbf' : 'transparent'}`,
                            background: 'none', fontSize: '0.8rem', fontWeight: tab === t ? 700 : 500,
                            color: tab === t ? '#007a8a' : '#9090a0', cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        {l}
                    </button>
                ))}
            </div>

            <div style={{ padding: '16px' }}>
                {/* ── TAB: Subir archivo ── */}
                {tab === 'subir' && (
                    <>
                        {estado === 'idle' && (
                            <div style={{
                                border: '2px dashed rgba(0,171,191,0.2)', borderRadius: '10px',
                                padding: '24px', textAlign: 'center', cursor: 'pointer',
                            }} onClick={() => fileInputRef.current?.click()}>
                                <Upload size={28} color="#00abbf" style={{ marginBottom: '8px' }} />
                                <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e' }}>
                                    Arrastra un archivo de audio aquí
                                </p>
                                <p style={{ margin: '0 0 8px', fontSize: '0.77rem', color: '#9090a0' }}>
                                    o <span style={{ color: '#00abbf', fontWeight: 600 }}>selecciona un archivo</span>
                                </p>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#b0b0c0' }}>
                                    .mp3 .wav .m4a .webm .ogg — máx {MAX_MB} MB
                                </p>
                                <input ref={fileInputRef} type="file" accept={FORMATOS} style={{ display: 'none' }}
                                    onChange={handleFileChange} />
                            </div>
                        )}

                        {estado === 'seleccionado' && archivo && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🎵</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#1a1a2e' }}>
                                            {archivo.name}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#9090a0' }}>
                                            {(archivo.size / 1024 / 1024).toFixed(1)} MB · Duración estimada: ~{Math.max(1, Math.round(archivo.size / (128 * 1024 / 8) / 60))} min
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={handleTranscribir} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                                        borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        background: tieneKey ? 'linear-gradient(135deg, #00abbf, #007a8a)' : '#e0e0e8',
                                        color: tieneKey ? 'white' : '#9090a0', fontWeight: 700, fontSize: '0.83rem',
                                    }}>
                                        <Mic size={14} /> Transcribir con Groq
                                    </button>
                                    <button onClick={resetear} style={{
                                        padding: '8px 14px', borderRadius: '8px', border: '1px solid #e0e0e8',
                                        background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.8rem', cursor: 'pointer',
                                    }}>
                                        Cambiar archivo
                                    </button>
                                </div>
                                {!tieneKey && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px',
                                        padding: '8px 12px', borderRadius: '8px',
                                        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                                    }}>
                                        <AlertTriangle size={14} color="#d97706" />
                                        <span style={{ fontSize: '0.78rem', color: '#92400e' }}>
                                            No hay API key configurada.{' '}
                                            <button onClick={onAbrirConfig} style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: '#00abbf', fontWeight: 700, fontSize: '0.78rem', padding: 0, textDecoration: 'underline',
                                            }}>
                                                <Settings size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                                                Configurar Groq
                                            </button>
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {estado === 'transcribiendo' && (
                            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                <Loader2 size={24} color="#00abbf" style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
                                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e' }}>
                                    {progresoDetalle || 'Procesando...'}
                                </p>
                                <div style={{
                                    height: '6px', borderRadius: '3px', background: '#e0e0e8', overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%', borderRadius: '3px', transition: 'width 0.5s ease',
                                        width: `${progresoNum[progreso]}%`,
                                        background: 'linear-gradient(90deg, #00abbf, #007a8a)',
                                    }} />
                                </div>
                                <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: '#9090a0' }}>
                                    Esto puede tomar unos segundos
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* ── TAB: Grabar en vivo ── */}
                {tab === 'grabar' && (
                    <>
                        {!grabando && estado !== 'seleccionado' && estado !== 'completado' && (
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <button onClick={iniciarGrabacion} style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 10px', boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                                }}>
                                    <Mic size={24} color="white" />
                                </button>
                                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#1a1a2e' }}>
                                    Presiona para grabar
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#9090a0' }}>
                                    Se grabará en formato .webm
                                </p>
                            </div>
                        )}

                        {grabando && (
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <div style={{
                                    fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', fontFamily: 'monospace',
                                    marginBottom: '12px',
                                }}>
                                    <span style={{
                                        display: 'inline-block', width: '10px', height: '10px',
                                        borderRadius: '50%', background: '#ef4444', marginRight: '8px',
                                        animation: 'pulse 1s ease-in-out infinite',
                                    }} />
                                    {formatTime(tiempoGrab)}
                                </div>
                                <button onClick={detenerGrabacion} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto',
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    background: '#1a1a2e', color: 'white', fontWeight: 700, fontSize: '0.85rem',
                                    cursor: 'pointer',
                                }}>
                                    <StopCircle size={16} /> Detener grabación
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* ── Estado completado (ambos tabs) ── */}
                {estado === 'completado' && resultado && (
                    <div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
                        }}>
                            <Check size={16} color="#10b981" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>
                                Transcripción lista · ~{resultado.duracionEstimadaMin} min
                            </span>
                        </div>

                        {editando ? (
                            <div>
                                <textarea
                                    className="cyber-textarea"
                                    rows={8}
                                    value={textoEditado}
                                    onChange={e => setTextoEditado(e.target.value)}
                                    style={{ marginBottom: '8px' }}
                                />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => {
                                        const updated = { ...resultado, texto: textoEditado }
                                        setResultado(updated)
                                        onTranscripcion(updated)
                                        setEditando(false)
                                    }} style={{
                                        padding: '6px 14px', borderRadius: '7px', border: 'none',
                                        background: '#00abbf', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                    }}>Guardar</button>
                                    <button onClick={() => { setTextoEditado(resultado.texto); setEditando(false) }} style={{
                                        padding: '6px 14px', borderRadius: '7px', border: '1px solid #e0e0e8',
                                        background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.8rem', cursor: 'pointer',
                                    }}>Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    padding: '10px 14px', borderRadius: '8px', background: '#f0fdf4',
                                    border: '1px solid rgba(16,185,129,0.15)', fontSize: '0.82rem',
                                    color: '#1a1a2e', lineHeight: 1.6, maxHeight: mostrarCompleto ? 'none' : '80px',
                                    overflow: 'hidden', position: 'relative',
                                }}>
                                    "{(mostrarCompleto ? resultado.texto : resultado.texto.substring(0, 200) + (resultado.texto.length > 200 ? '...' : ''))}"
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    {resultado.texto.length > 200 && (
                                        <button onClick={() => setMostrarCompleto(!mostrarCompleto)} style={{
                                            padding: '5px 12px', borderRadius: '6px', border: '1px solid #e0e0e8',
                                            background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.77rem', cursor: 'pointer',
                                        }}>{mostrarCompleto ? 'Colapsar' : 'Ver completa'}</button>
                                    )}
                                    <button onClick={() => { setTextoEditado(resultado.texto); setEditando(true) }} style={{
                                        padding: '5px 12px', borderRadius: '6px', border: '1px solid #e0e0e8',
                                        background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.77rem', cursor: 'pointer',
                                    }}>Editar</button>
                                    <button onClick={resetear} style={{
                                        padding: '5px 12px', borderRadius: '6px', border: '1px solid #e0e0e8',
                                        background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.77rem', cursor: 'pointer',
                                    }}>Cambiar</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Error ── */}
                {estado === 'error' && (
                    <div style={{
                        padding: '12px 14px', borderRadius: '10px',
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <AlertTriangle size={15} color="#ef4444" />
                            <span style={{ fontWeight: 700, fontSize: '0.83rem', color: '#991b1b' }}>
                                {errorMsg === 'API_KEY_MISSING' ? 'No hay API key configurada' :
                                    errorMsg.startsWith('FILE_TOO_LARGE') ? `El archivo supera ${MAX_MB} MB` :
                                        errorMsg.startsWith('FORMATO_NO_SOPORTADO') ? 'Formato de audio no soportado' :
                                            errorMsg.startsWith('GROQ_ERROR') ? 'Error de Groq' : 'Error'}
                            </span>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: '0.77rem', color: '#5a5a6e' }}>
                            {errorMsg === 'API_KEY_MISSING'
                                ? 'Configura tu API key de Groq para transcribir audio.'
                                : errorMsg.startsWith('FILE_TOO_LARGE')
                                    ? 'Divide el audio en partes más pequeñas o sube la transcripción como .txt'
                                    : errorMsg}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {errorMsg === 'API_KEY_MISSING' && onAbrirConfig && (
                                <button onClick={onAbrirConfig} style={{
                                    padding: '6px 14px', borderRadius: '7px', border: 'none',
                                    background: '#00abbf', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                }}>Configurar Groq →</button>
                            )}
                            <button onClick={resetear} style={{
                                padding: '6px 14px', borderRadius: '7px', border: '1px solid #e0e0e8',
                                background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.8rem', cursor: 'pointer',
                            }}>Reintentar</button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
        </div>
    )
}
