/**
 * CodeExtractor.ts
 * Utilidad para extraer bloques de código generados por la IA.
 *
 * Detecta el patrón:
 *   ### Archivo: ruta/relativa/archivo.ext
 *   ```lenguaje
 *   ...contenido...
 *   ```
 *
 * También elimina del texto mostrado los bloques [PREGUNTAS]...[/PREGUNTAS].
 */

export interface ExtractedFile {
  /** Ruta relativa del archivo, p.ej. "src/app/app.module.ts" */
  path: string;
  /** Contenido del archivo sin las comillas de bloque de código */
  content: string;
  /** Lenguaje detectado en la línea de apertura del bloque (typescript, python, html, etc.) */
  language: string;
}

export interface ExtractionResult {
  /** Archivos encontrados en este fragmento de texto */
  files: ExtractedFile[];
  /**
   * Texto limpio: sin encabezados ### Archivo:, sin bloques de código asociados
   * y sin bloques [PREGUNTAS]...[/PREGUNTAS].
   */
  cleanText: string;
}

/**
 * Extrae todos los archivos codificados en `rawText` y devuelve también
 * el texto limpio para mostrar en el terminal de la IA.
 */
export function extractFiles(rawText: string): ExtractionResult {
  const files: ExtractedFile[] = [];

  // ------------------------------------------------------------------ //
  // 1. Extraer bloques ### Archivo: + ```lang\n...\n```
  // ------------------------------------------------------------------ //
  // Regex explicada:
  //   ###\s+Archivo:\s+   → encabezado obligatorio
  //   ([\w./\-]+)         → ruta del archivo (grupo 1)
  //   \s*\n               → salto de línea tras la ruta
  //   ```(\w*)            → apertura del bloque de código; lenguaje opcional (grupo 2)
  //   \n([\s\S]*?)        → contenido del bloque (grupo 3, lazy)
  //   ```                 → cierre del bloque
  const fileBlockRegex = /###\s+Archivo:\s+([\w./\-]+)\s*\n```(\w*)\n([\s\S]*?)```/g;

  let cleanText = rawText;
  let match: RegExpExecArray | null;

  // Recolectamos todas las coincidencias primero para no corromper los índices
  const matches: Array<{ full: string; path: string; lang: string; content: string }> = [];

  while ((match = fileBlockRegex.exec(rawText)) !== null) {
    matches.push({
      full: match[0],
      path: match[1].trim(),
      lang: match[2].trim() || detectLanguage(match[1].trim()),
      content: match[3],
    });
  }

  for (const m of matches) {
    files.push({ path: m.path, content: m.content, language: m.lang });
    // Eliminar el bloque completo del texto limpio
    cleanText = cleanText.replace(m.full, '');
  }

  // ------------------------------------------------------------------ //
  // 2. Eliminar bloques [PREGUNTAS]...[/PREGUNTAS] del texto mostrado
  // ------------------------------------------------------------------ //
  cleanText = cleanText.replace(/\[PREGUNTAS\][\s\S]*?\[\/PREGUNTAS\]/g, '').trim();

  return { files, cleanText };
}

/**
 * Infiere el lenguaje a partir de la extensión del archivo cuando
 * el bloque de código no especifica uno.
 */
function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    dockerfile: 'dockerfile',
    env: 'bash',
  };
  return map[ext] ?? 'text';
}

/**
 * Analiza un bloque [PREGUNTAS] y retorna la pregunta y sus opciones.
 * Devuelve `null` si no se encuentra ningún bloque.
 */
export interface ParsedQuestions {
  question: string;
  options: string[];
}

export function parseQuestionsBlock(rawText: string): ParsedQuestions | null {
  const blockMatch = rawText.match(/\[PREGUNTAS\]([\s\S]*?)\[\/PREGUNTAS\]/);
  if (!blockMatch) return null;

  const inner = blockMatch[1];

  // Línea "P: ..."
  const questionMatch = inner.match(/P:\s*(.+)/);
  const question = questionMatch ? questionMatch[1].trim() : '';

  // Líneas "O: ..."
  const optionMatches = [...inner.matchAll(/O:\s*(.+)/g)];
  const options = optionMatches.map((m) => m[1].trim());

  return { question, options };
}
