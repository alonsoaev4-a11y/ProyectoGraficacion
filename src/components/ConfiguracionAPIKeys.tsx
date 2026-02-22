// ConfiguracionAPIKeys.tsx — Panel modal para configurar la API key de Groq
// Accesible desde el header de MetadatosPage (icono ⚙️)

import { useState, useEffect } from 'react'
import { verificarGroqKey } from '../utils/transcriptorAudio'
import { Settings, ExternalLink, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react'

interface Props {
    abierto: boolean
    onCerrar: () => void
}

export const ConfiguracionAPIKeys = ({ abierto, onCerrar }: Props) => {
    const [key, setKey] = useState('')
    const [mostrarKey, setMostrarKey] = useState(false)
    const [verificando, setVerificando] = useState(false)
    const [estado, setEstado] = useState<'idle' | 'valida' | 'invalida'>('idle')
    const [existente, setExistente] = useState(false)

    useEffect(() => {
        if (abierto) {
            const saved = localStorage.getItem('herman_groq_key')
            if (saved) {
                setKey(saved)
                setExistente(true)
                setEstado('idle')
            } else {
                setKey('')
                setExistente(false)
                setEstado('idle')
            }
        }
    }, [abierto])

    const handleVerificar = async () => {
        if (!key.trim()) return
        setVerificando(true)
        setEstado('idle')
        const ok = await verificarGroqKey(key.trim())
        setEstado(ok ? 'valida' : 'invalida')
        if (ok) {
            localStorage.setItem('herman_groq_key', key.trim())
            setExistente(true)
        }
        setVerificando(false)
    }

    const handleLimpiar = () => {
        localStorage.removeItem('herman_groq_key')
        setKey('')
        setExistente(false)
        setEstado('idle')
        setMostrarKey(false)
    }

    const enmascarar = (k: string) => {
        if (k.length <= 8) return '••••••••'
        return '••••••••••••••' + k.slice(-6)
    }

    if (!abierto) return null

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        }} onClick={onCerrar}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '480px', borderRadius: '16px',
                background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                padding: '28px', position: 'relative',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #00abbf, #007a8a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Settings size={18} color="white" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>
                            Configuración de transcripción de audio
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#9090a0' }}>
                            Proveedor: <strong>Groq</strong> (gratuito)
                        </p>
                    </div>
                    <button onClick={onCerrar} style={{
                        marginLeft: 'auto', background: 'none', border: 'none',
                        cursor: 'pointer', color: '#b0b0c0', padding: '4px',
                    }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Input de la key */}
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }}>
                    API Key
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type={mostrarKey ? 'text' : 'password'}
                            className="cyber-input"
                            placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                            value={existente && !mostrarKey ? enmascarar(key) : key}
                            onChange={e => { setKey(e.target.value); setExistente(false); setEstado('idle') }}
                            onFocus={() => { if (existente && !mostrarKey) { setMostrarKey(true) } }}
                            style={{ width: '100%', paddingRight: '36px' }}
                        />
                        <button onClick={() => setMostrarKey(!mostrarKey)} style={{
                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: '#b0b0c0', padding: '2px',
                        }}>
                            {mostrarKey ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    <button onClick={handleLimpiar} style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid #e0e0e8',
                        background: '#f8f8fc', color: '#5a5a6e', fontSize: '0.78rem', cursor: 'pointer',
                    }}>
                        Limpiar
                    </button>
                </div>

                {/* Botón verificar */}
                <button onClick={handleVerificar} disabled={verificando || !key.trim()} style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                    background: verificando ? '#e0e0e8' : 'linear-gradient(135deg, #00abbf, #007a8a)',
                    color: verificando ? '#9090a0' : 'white', fontWeight: 700, fontSize: '0.85rem',
                    cursor: verificando || !key.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    marginBottom: '12px',
                }}>
                    {verificando && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                    {verificando ? 'Verificando...' : 'Verificar conexión'}
                </button>

                {/* Badge de estado */}
                {estado === 'valida' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                        borderRadius: '10px', background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.2)', marginBottom: '14px',
                    }}>
                        <Check size={15} color="#10b981" />
                        <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 600 }}>
                            ✓ Conectado correctamente — key guardada
                        </span>
                    </div>
                )}
                {estado === 'invalida' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                        borderRadius: '10px', background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)', marginBottom: '14px',
                    }}>
                        <X size={15} color="#ef4444" />
                        <span style={{ fontSize: '0.82rem', color: '#991b1b', fontWeight: 600 }}>
                            ✗ Key inválida — verifica que la copiaste completa
                        </span>
                    </div>
                )}

                {/* Info de privacidad */}
                <div style={{
                    padding: '12px', borderRadius: '10px', background: '#f8f8fc',
                    border: '1px solid rgba(0,171,191,0.1)', marginBottom: '14px',
                }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.77rem', color: '#5a5a6e', lineHeight: 1.5 }}>
                        🔒 Tu key se guarda <strong>solo en este navegador</strong> (localStorage).
                        No se comparte con Herman ni otros servidores.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.77rem', color: '#5a5a6e', lineHeight: 1.5 }}>
                        📊 Límite gratuito: <strong>~7 horas de audio por día</strong>
                    </p>
                </div>

                {/* Link externo */}
                <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.82rem', color: '#00abbf', fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    <ExternalLink size={14} />
                    Obtener key gratis → console.groq.com
                </a>
            </div>

            {/* Spin animation */}
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}
