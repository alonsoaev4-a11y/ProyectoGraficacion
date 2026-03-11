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
            background: 'rgba(10,10,18,0.8)', backdropFilter: 'blur(8px)',
        }} onClick={onCerrar}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '480px', borderRadius: '16px',
                background: 'rgba(10,10,18,0.95)', boxShadow: '0 0 30px rgba(0,171,191,0.3)',
                border: '1px solid rgba(0,171,191,0.5)',
                padding: '28px', position: 'relative',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #00ffff, #9d22e6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 10px rgba(0,171,191,0.5)'
                    }}>
                        <Settings size={18} color="#0a0a12" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#00ffff', textShadow: '0 0 5px rgba(0,171,191,0.5)' }}>
                            Configuración de transcripción de audio
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#a0a0b0' }}>
                            Proveedor: <strong style={{ color: '#e0e0e8' }}>Groq</strong> (gratuito)
                        </p>
                    </div>
                    <button onClick={onCerrar} style={{
                        marginLeft: 'auto', background: 'none', border: 'none',
                        cursor: 'pointer', color: '#a0a0b0', padding: '4px',
                        transition: 'color 0.2s'
                    }} onMouseEnter={e => e.currentTarget.style.color = '#ff003c'} onMouseLeave={e => e.currentTarget.style.color = '#a0a0b0'}>
                        <X size={18} />
                    </button>
                </div>

                {/* Input de la key */}
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#00ffff', marginBottom: '6px', textShadow: '0 0 5px rgba(0,171,191,0.3)' }}>
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
                            background: 'none', border: 'none', cursor: 'pointer', color: '#a0a0b0', padding: '2px',
                            transition: 'color 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.color = '#00ffff'} onMouseLeave={e => e.currentTarget.style.color = '#a0a0b0'}>
                            {mostrarKey ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    <button onClick={handleLimpiar} style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,0,60,0.3)',
                        background: 'rgba(255,0,60,0.1)', color: '#ff003c', fontSize: '0.78rem', cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(255,0,60,0.2)', textShadow: '0 0 5px rgba(255,0,60,0.5)', transition: 'all 0.2s'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,60,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,0,60,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,0,60,0.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(255,0,60,0.2)'; }}>
                        Limpiar
                    </button>
                </div>

                {/* Botón verificar */}
                <button onClick={handleVerificar} disabled={verificando || !key.trim()} style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,171,191,0.5)',
                    background: verificando ? 'rgba(160,160,176,0.2)' : 'linear-gradient(135deg, rgba(0,171,191,0.2), rgba(157,34,230,0.2))',
                    color: verificando ? '#a0a0b0' : '#00ffff', fontWeight: 700, fontSize: '0.85rem',
                    cursor: verificando || !key.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    marginBottom: '12px', boxShadow: verificando ? 'none' : '0 0 15px rgba(0,171,191,0.3)',
                    textShadow: verificando ? 'none' : '0 0 5px rgba(0,171,191,0.5)', transition: 'all 0.2s'
                }} onMouseEnter={e => { if (!verificando && key.trim()) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,171,191,0.3), rgba(157,34,230,0.3))'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,171,191,0.5)'; } }} onMouseLeave={e => { if (!verificando && key.trim()) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,171,191,0.2), rgba(157,34,230,0.2))'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,171,191,0.3)'; } }}>
                    {verificando && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                    {verificando ? 'Verificando...' : 'Verificar conexión'}
                </button>

                {/* Badge de estado */}
                {estado === 'valida' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                        borderRadius: '10px', background: 'rgba(0,255,136,0.1)',
                        border: '1px solid rgba(0,255,136,0.3)', marginBottom: '14px',
                        boxShadow: 'inset 0 0 10px rgba(0,255,136,0.1)'
                    }}>
                        <Check size={15} color="#00ff88" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,136,0.5))' }} />
                        <span style={{ fontSize: '0.82rem', color: '#00ff88', fontWeight: 600, textShadow: '0 0 5px rgba(0,255,136,0.3)' }}>
                            ✓ Conectado correctamente — key guardada
                        </span>
                    </div>
                )}
                {estado === 'invalida' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                        borderRadius: '10px', background: 'rgba(255,0,60,0.1)',
                        border: '1px solid rgba(255,0,60,0.3)', marginBottom: '14px',
                        boxShadow: 'inset 0 0 10px rgba(255,0,60,0.1)'
                    }}>
                        <X size={15} color="#ff003c" style={{ filter: 'drop-shadow(0 0 5px rgba(255,0,60,0.5))' }} />
                        <span style={{ fontSize: '0.82rem', color: '#ff003c', fontWeight: 600, textShadow: '0 0 5px rgba(255,0,60,0.3)' }}>
                            ✗ Key inválida — verifica que la copiaste completa
                        </span>
                    </div>
                )}

                {/* Info de privacidad */}
                <div style={{
                    padding: '12px', borderRadius: '10px', background: 'rgba(10,10,18,0.6)',
                    border: '1px solid rgba(0,171,191,0.3)', marginBottom: '14px',
                    boxShadow: 'inset 0 0 10px rgba(0,171,191,0.1)'
                }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.77rem', color: '#e0e0e8', lineHeight: 1.5 }}>
                        🔒 Tu key se guarda <strong style={{ color: '#00ffff', textShadow: '0 0 5px rgba(0,171,191,0.3)' }}>solo en este navegador</strong> (localStorage).
                        No se comparte con Herman ni otros servidores.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.77rem', color: '#e0e0e8', lineHeight: 1.5 }}>
                        📊 Límite gratuito: <strong style={{ color: '#00ff88', textShadow: '0 0 5px rgba(0,255,136,0.3)' }}>~7 horas de audio por día</strong>
                    </p>
                </div>

                {/* Link externo */}
                <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.82rem', color: '#00ffff', fontWeight: 600,
                        textDecoration: 'none', textShadow: '0 0 5px rgba(0,171,191,0.5)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#9d22e6'; e.currentTarget.style.textShadow = '0 0 5px rgba(157,34,230,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#00ffff'; e.currentTarget.style.textShadow = '0 0 5px rgba(0,171,191,0.5)'; }}
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
