// extractores.ts — Extracción de contenido de archivos del lado del cliente
// Word (.docx), PDF, CSV, Excel (.xlsx/.xls), TXT
// pdfjs-dist se importa dinámicamente para no bloquear el bundle inicial

import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

// ─── Word (.docx) ──────────────────────────────────────────────
export async function extraerTextoWord(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
}

// ─── PDF (dynamic import) ──────────────────────────────────────
export async function extraerTextoPDF(
    file: File,
    onProgreso?: (pagina: number, total: number) => void
): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

    const paginas: string[] = []
    const MAX_PAGINAS = 50
    const total = Math.min(pdf.numPages, MAX_PAGINAS)

    for (let i = 1; i <= total; i++) {
        onProgreso?.(i, pdf.numPages)
        const pagina = await pdf.getPage(i)
        const contenido = await pagina.getTextContent()
        const texto = contenido.items.map((item: any) => item.str).join(' ')
        paginas.push(texto)
    }

    if (pdf.numPages > MAX_PAGINAS) {
        paginas.push(
            `\n[Nota: documento tiene ${pdf.numPages} páginas. Se procesaron las primeras ${MAX_PAGINAS}]`
        )
    }

    return paginas.join('\n\n')
}

// ─── CSV ───────────────────────────────────────────────────────
export async function parsearCSV(file: File): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as Record<string, string>[]),
            error: reject,
        })
    })
}

// ─── Excel (.xlsx / .xls) ──────────────────────────────────────
export async function parsearExcel(file: File): Promise<Record<string, string>[]> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const primeraHoja = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(primeraHoja, { defval: '' }) as Record<string, string>[]
}

// ─── Tipo de archivo detectado por extensión ───────────────────
export type TipoArchivo = 'word' | 'pdf' | 'csv' | 'excel' | 'txt' | 'desconocido'

// ─── Función maestra ───────────────────────────────────────────
export async function extraerContenido(
    file: File,
    onProgreso?: (pagina: number, total: number) => void
): Promise<{
    texto: string
    datos: Record<string, string>[] | null
    tipo: TipoArchivo
    paginasProcesadas: number
}> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    // Límite de tamaño: 25 MB
    if (file.size > 25 * 1024 * 1024) {
        throw new Error('ARCHIVO_MUY_GRANDE')
    }

    if (ext === 'docx') {
        const texto = await extraerTextoWord(file)
        return { texto, datos: null, tipo: 'word', paginasProcesadas: 1 }
    }

    if (ext === 'pdf') {
        const texto = await extraerTextoPDF(file, onProgreso)
        const paginas = texto.split('\n\n').length
        return { texto, datos: null, tipo: 'pdf', paginasProcesadas: paginas }
    }

    if (ext === 'txt') {
        const texto = await file.text()
        return { texto, datos: null, tipo: 'txt', paginasProcesadas: 1 }
    }

    if (ext === 'csv') {
        const datos = await parsearCSV(file)
        const texto = datos.map(row => Object.values(row).join(' ')).join('\n')
        return { texto, datos, tipo: 'csv', paginasProcesadas: 1 }
    }

    if (['xlsx', 'xls'].includes(ext)) {
        const datos = await parsearExcel(file)
        const texto = datos.map(row => Object.values(row).join(' ')).join('\n')
        return { texto, datos, tipo: 'excel', paginasProcesadas: 1 }
    }

    return { texto: '', datos: null, tipo: 'desconocido', paginasProcesadas: 0 }
}
