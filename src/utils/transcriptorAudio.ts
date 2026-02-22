// transcriptorAudio.ts — Transcripción de audio usando Groq Whisper large-v3
// La API key la ingresa el usuario una sola vez en el panel de configuración.
// Se guarda en localStorage bajo 'herman_groq_key'.
// NUNCA se incluye en el JSON exportado ni se envía a servidores de Herman.

export type ProgresoTranscripcion =
    | 'preparando'
    | 'enviando'
    | 'procesando'
    | 'completado'
    | 'error'

export interface ResultadoTranscripcion {
    texto: string
    duracionEstimadaMin: number
    nombreArchivo: string
}

const MAX_MB = 25
const FORMATOS_VALIDOS = ['mp3', 'mp4', 'm4a', 'wav', 'webm', 'ogg', 'flac']

export async function transcribirAudio(
    file: File,
    onProgress?: (estado: ProgresoTranscripcion, detalle?: string) => void
): Promise<ResultadoTranscripcion> {

    const apiKey = localStorage.getItem('herman_groq_key')
    if (!apiKey) throw new Error('API_KEY_MISSING')

    if (file.size > MAX_MB * 1024 * 1024) {
        throw new Error('FILE_TOO_LARGE')
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!FORMATOS_VALIDOS.includes(extension)) {
        throw new Error(`FORMATO_NO_SOPORTADO: .${extension}`)
    }

    onProgress?.('preparando', 'Preparando archivo para envío...')

    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('model', 'whisper-large-v3')
    formData.append('language', 'es')
    formData.append('response_format', 'json')
    formData.append('temperature', '0')

    onProgress?.('enviando', `Enviando ${(file.size / 1024 / 1024).toFixed(1)} MB a Groq...`)

    const response = await fetch(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: formData,
        }
    )

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const mensaje = (err as any)?.error?.message ?? `HTTP ${response.status}`
        throw new Error(`GROQ_ERROR: ${mensaje}`)
    }

    onProgress?.('procesando', 'Procesando respuesta...')

    const data = await response.json()

    // Estimación de duración: tamaño del archivo / bitrate típico 128kbps
    const duracionEstimadaMin = Math.round(file.size / (128 * 1024 / 8) / 60)

    onProgress?.('completado', 'Transcripción lista')

    return {
        texto: (data as any).text ?? '',
        duracionEstimadaMin,
        nombreArchivo: file.name,
    }
}

// Verifica que la API key de Groq sea válida
export async function verificarGroqKey(apiKey: string): Promise<boolean> {
    try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { Authorization: `Bearer ${apiKey}` },
        })
        return res.ok
    } catch {
        return false
    }
}
