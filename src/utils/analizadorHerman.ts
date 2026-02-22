// analizadorHerman.ts — Detección heurística de elementos para generación de software
// Sin IA. Usa regex y patrones lingüísticos en español.
// Los resultados son siempre editables por el usuario.

// ─── Entidades de BD ──────────────────────────────────────────
// Sustantivos capitalizados, patrones "tabla de X", "registro de X", "listado de X"
export function detectarEntidades(texto: string): string[] {
    const resultados = new Set<string>()

    // Patrones explícitos: "tabla de X", "registro de X", "catálogo de X"
    const patrones = [
        /(?:tabla|registro|listado|catálogo|maestro|archivo|base de datos)\s+(?:de\s+)?(\w[\wáéíóúñ]+)/gi,
        /(?:entidad|objeto|concepto|módulo de)\s+(?:de\s+)?(\w[\wáéíóúñ]+)/gi,
    ]
    for (const p of patrones) {
        let m: RegExpExecArray | null
        while ((m = p.exec(texto)) !== null) {
            const e = m[1].trim()
            if (e.length > 2) resultados.add(capitalizar(e))
        }
    }

    // Sustantivos capitalizados después de artículos: "el/la/los/las/un/una [Nombre]"
    const articuloPattern = /(?:el|la|los|las|un|una|del)\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñ]{2,})/g
    let m2: RegExpExecArray | null
    while ((m2 = articuloPattern.exec(texto)) !== null) {
        const e = m2[1].trim()
        if (!PALABRAS_EXCLUIDAS.has(e.toLowerCase()) && e.length > 2) {
            resultados.add(capitalizar(e))
        }
    }

    return [...resultados].slice(0, 20)
}

// ─── Reglas de negocio ────────────────────────────────────────
export function detectarReglasNegocio(texto: string): string[] {
    const resultados: string[] = []
    const oraciones = texto.split(/[.;\n]+/).map(s => s.trim()).filter(s => s.length > 10)

    const patternsRegla = [
        /no\s+(puede|debe|podrá|permite|autoriza)/i,
        /debe(rá|n|mos)?\s/i,
        /máximo\s+\d/i,
        /mínimo\s+\d/i,
        /solo\s+si\b/i,
        /obligatori[oa]/i,
        /requerid[oa]/i,
        /en\s+caso\s+de/i,
        /siempre\s+que/i,
        /no\s+mayor\s+(a|de|que)/i,
        /no\s+menor\s+(a|de|que)/i,
        /no\s+exceder/i,
        /se\s+requiere/i,
        /es\s+necesario/i,
        /está\s+prohibid[oa]/i,
        /no\s+se\s+permite/i,
        /se\s+limita\s+a/i,
        /como\s+máximo/i,
        /como\s+mínimo/i,
    ]

    for (const oracion of oraciones) {
        if (patternsRegla.some(p => p.test(oracion))) {
            const limpio = oracion.length > 150 ? oracion.substring(0, 147) + '...' : oracion
            resultados.push(limpio)
        }
    }

    return [...new Set(resultados)].slice(0, 15)
}

// ─── Módulos / funcionalidades ────────────────────────────────
export function detectarModulos(texto: string): string[] {
    const resultados = new Set<string>()

    // "gestionar X", "registrar X", "generar X", "controlar X"
    const verbos = /(?:gestionar|registrar|generar|controlar|administrar|consultar|procesar|validar|configurar|monitorear|reportar|importar|exportar|asignar|aprobar|rechazar|crear|modificar|eliminar|listar)\s+([\wáéíóúñ\s]{3,30})/gi
    let m: RegExpExecArray | null
    while ((m = verbos.exec(texto)) !== null) {
        const mod = m[0].trim()
        if (mod.length > 5) resultados.add(capitalizar(mod))
    }

    return [...resultados].slice(0, 15)
}

// ─── Actores / roles del sistema ──────────────────────────────
export function detectarActores(texto: string): string[] {
    const resultados = new Set<string>()

    // Roles comunes explícitos
    const rolesComunes = [
        'administrador', 'admin', 'usuario', 'cliente', 'supervisor',
        'gerente', 'operador', 'empleado', 'coordinador', 'director',
        'analista', 'técnico', 'auditor', 'proveedor', 'vendedor',
        'cajero', 'contador', 'secretaria', 'jefe', 'encargado',
        'paciente', 'médico', 'doctor', 'enfermera', 'estudiante',
        'profesor', 'docente', 'alumno', 'receptor', 'solicitante',
    ]

    const textoLower = texto.toLowerCase()
    for (const rol of rolesComunes) {
        if (textoLower.includes(rol)) {
            resultados.add(capitalizar(rol))
        }
    }

    // "el [rol] puede/debe"
    const patronRol = /(?:el|la|los|las)\s+([\wáéíóúñ]+)\s+(?:puede|debe|podrá|deberá|tiene|necesita|utiliza|accede)/gi
    let m: RegExpExecArray | null
    while ((m = patronRol.exec(texto)) !== null) {
        const actor = m[1].trim()
        if (actor.length > 3 && !PALABRAS_EXCLUIDAS.has(actor.toLowerCase())) {
            resultados.add(capitalizar(actor))
        }
    }

    return [...resultados].slice(0, 12)
}

// ─── Fricciones (para Observación) ────────────────────────────
export function detectarFricciones(texto: string): string[] {
    const resultados: string[] = []
    const oraciones = texto.split(/[.;\n]+/).map(s => s.trim()).filter(s => s.length > 10)

    const patternsFriccion = [
        /tarda\b/i,
        /demora\b/i,
        /falla\b/i,
        /error\b/i,
        /repite\b/i,
        /copia\s+manualmente/i,
        /no\s+hay\s+forma\s+de/i,
        /no\s+se\s+puede/i,
        /tiene\s+que\s+llamar/i,
        /proceso\s+manual/i,
        /muy\s+lento/i,
        /demasiado\s+tiempo/i,
        /ineficiente/i,
        /engorroso/i,
        /complicad[oa]/i,
        /difícil\s+de/i,
        /confus[oa]/i,
        /no\s+funciona/i,
        /se\s+pierden?\b/i,
        /duplica/i,
        /inconsisten/i,
        /desactualizado/i,
    ]

    for (const oracion of oraciones) {
        if (patternsFriccion.some(p => p.test(oracion))) {
            const limpio = oracion.length > 150 ? oracion.substring(0, 147) + '...' : oracion
            resultados.push(limpio)
        }
    }

    return [...new Set(resultados)].slice(0, 12)
}

// ─── Sugerencias de funcionalidades (de fricciones → soluciones) ─
export function sugerirFuncionalidades(fricciones: string[]): string[] {
    const sugerencias: string[] = []

    const mapeo: [RegExp, string][] = [
        [/copia\s+manualmente/i, 'Importación automática de datos'],
        [/proceso\s+manual/i, 'Automatización del proceso'],
        [/tarda|demora|lento|demasiado\s+tiempo/i, 'Optimización de rendimiento'],
        [/no\s+hay\s+forma\s+de/i, 'Nueva funcionalidad requerida'],
        [/repite|duplica/i, 'Deduplicación automática'],
        [/error|falla|no\s+funciona/i, 'Validación y manejo de errores'],
        [/inconsisten/i, 'Sincronización de datos'],
        [/desactualizado/i, 'Actualización en tiempo real'],
        [/se\s+pierden?/i, 'Respaldo y recuperación de datos'],
        [/confus|complicad|difícil/i, 'Simplificación de interfaz'],
    ]

    for (const friccion of fricciones) {
        for (const [pattern, sugerencia] of mapeo) {
            if (pattern.test(friccion)) {
                sugerencias.push(sugerencia)
                break
            }
        }
    }

    return [...new Set(sugerencias)]
}

// ─── Función maestra ──────────────────────────────────────────
export interface AnalisisHerman {
    entidades: string[]
    reglas: string[]
    modulos: string[]
    actores: string[]
    fricciones: string[]
    resumenTexto: string    // primeros 500 caracteres del texto
}

export function analizarParaHerman(texto: string): AnalisisHerman {
    // Limitar el texto de entrada para no saturar el análisis regex
    const textoLimitado = texto.length > 50000 ? texto.substring(0, 50000) : texto

    return {
        entidades: detectarEntidades(textoLimitado),
        reglas: detectarReglasNegocio(textoLimitado),
        modulos: detectarModulos(textoLimitado),
        actores: detectarActores(textoLimitado),
        fricciones: detectarFricciones(textoLimitado),
        resumenTexto: textoLimitado.substring(0, 500),
    }
}

// ─── Helpers ──────────────────────────────────────────────────
function capitalizar(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

const PALABRAS_EXCLUIDAS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'del', 'al',
    'que', 'con', 'por', 'para', 'como', 'este', 'esta', 'estos', 'estas',
    'ese', 'esa', 'esos', 'esas', 'más', 'muy', 'bien', 'mal', 'cada',
    'todo', 'toda', 'todos', 'todas', 'otro', 'otra', 'otros', 'otras',
    'mismo', 'misma', 'entre', 'sobre', 'bajo', 'ante', 'tras', 'hacia',
    'desde', 'hasta', 'según', 'durante', 'mediante', 'sino', 'pero',
    'sistema', 'proceso', 'forma', 'manera', 'parte', 'tipo', 'caso',
    'vez', 'tiempo', 'dato', 'datos', 'información', 'ejemplo',
])
