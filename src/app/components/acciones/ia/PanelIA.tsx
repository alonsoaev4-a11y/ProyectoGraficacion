/**
 * PanelIA.tsx
 * Panel de generación de código en tiempo real mediante WebSocket.
 *
 * Conecta con el backend FastAPI en:
 *   ws://localhost:8000/ws/ai/{projectId}?token=<jwt>
 *
 * Protocolo de mensajes:
 *   Envío  → { type: "start" }  |  { type: "user_input", content: "..." }
 *   Recibo → token | phase_start | phase_end | waiting_input | user_received | done | error | system
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  Download,
  Loader,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Bot,
  User,
  Zap,
  ChevronRight,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { extractFiles, parseQuestionsBlock, ExtractedFile, ParsedQuestions } from './CodeExtractor';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type LineType = 'ai' | 'system' | 'user' | 'error';

interface TerminalLine {
  type: LineType;
  content: string;
  phase?: number;
}

interface WsIncoming {
  type: string;
  content?: string;
  phase?: number;
  name?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface PanelIAProps {
  projectId: number;
  requirements: any[];
  useCases: any[];
  tables: any[];
  catalogs: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Nombres de las fases
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_NAMES: Record<number, string> = {
  1: 'Análisis de Requisitos',
  2: 'Arquitectura del Sistema',
  3: 'Base de Datos',
  4: 'Backend (FastAPI)',
  5: 'Frontend (Angular)',
  6: 'Pruebas',
  7: 'Despliegue (Docker)',
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export function PanelIA({ projectId, requirements, useCases, tables, catalogs }: PanelIAProps) {
  // Estado de conexión y conversación
  const [connected, setConnected] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [currentPhaseName, setCurrentPhaseName] = useState<string>('');

  // Estado de interacción
  const [waitingInput, setWaitingInput] = useState(false);
  const [questions, setQuestions] = useState<ParsedQuestions | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');

  // Buffer de tokens en streaming para la línea actual de la IA
  const [streamBuffer, setStreamBuffer] = useState('');

  // Mapa acumulativo de archivos generados (todas las fases, todas las iteraciones)
  const filesMapRef = useRef<Map<string, string>>(new Map());
  const [filesCount, setFilesCount] = useState(0);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<number>(0);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, streamBuffer]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const addLine = useCallback((type: LineType, content: string, phase?: number) => {
    setLines(prev => [...prev, { type, content, phase }]);
  }, []);

  const flushBuffer = useCallback((buffer: string) => {
    if (!buffer.trim()) return;

    // Extraer archivos y texto limpio del buffer completo
    const { files, cleanText } = extractFiles(buffer);

    // Acumular archivos en el mapa global
    if (files.length > 0) {
      files.forEach((f: ExtractedFile) => {
        filesMapRef.current.set(f.path, f.content);
      });
      setFilesCount(filesMapRef.current.size);
    }

    // Detectar bloque [PREGUNTAS] antes de limpiar
    const parsedQ = parseQuestionsBlock(buffer);

    // Mostrar texto limpio en el terminal
    if (cleanText.trim()) {
      addLine('ai', cleanText, phaseRef.current);
    }

    // Si hay preguntas, activar modo de espera interactivo
    if (parsedQ) {
      setQuestions(parsedQ);
    }
  }, [addLine]);

  // ── WebSocket ─────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    const token = localStorage.getItem('herman_token');
    if (!token) {
      addLine('error', 'No hay token de autenticación. Inicia sesión primero.');
      return;
    }

    const url = `ws://localhost:8000/ws/ai/${projectId}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      addLine('system', 'Conexión establecida con el servidor de IA.');
    };

    ws.onclose = (e) => {
      setConnected(false);
      if (!done) {
        addLine('system', `Conexión cerrada (código ${e.code}).`);
      }
    };

    ws.onerror = () => {
      addLine('error', 'Error en la conexión WebSocket. Verifica que el servidor esté activo.');
    };

    ws.onmessage = (event) => {
      let msg: WsIncoming;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case 'token':
          // Acumular en el buffer de streaming
          setStreamBuffer(prev => prev + (msg.content ?? ''));
          break;

        case 'phase_start':
          // Vaciar buffer anterior si quedó algo
          setStreamBuffer(prev => {
            if (prev) flushBuffer(prev);
            return '';
          });
          phaseRef.current = msg.phase ?? 0;
          setCurrentPhase(msg.phase ?? 0);
          setCurrentPhaseName(msg.name ?? PHASE_NAMES[msg.phase ?? 0] ?? `Fase ${msg.phase}`);
          addLine('system', `▶ Fase ${msg.phase}: ${msg.name ?? PHASE_NAMES[msg.phase ?? 0]}`, msg.phase);
          break;

        case 'phase_end':
          addLine('system', `✓ Fase ${msg.phase} completada.`, msg.phase);
          break;

        case 'waiting_input':
          // Vaciar buffer: el AI terminó de escribir para esta iteración
          setStreamBuffer(prev => {
            flushBuffer(prev);
            return '';
          });
          setWaitingInput(true);
          break;

        case 'user_received':
          // El servidor confirmó que recibió nuestra respuesta
          setWaitingInput(false);
          setQuestions(null);
          setShowCustomInput(false);
          setCustomText('');
          break;

        case 'done':
          setStreamBuffer(prev => {
            if (prev) flushBuffer(prev);
            return '';
          });
          setDone(true);
          setWaitingInput(false);
          addLine('system', '¡Pipeline completado! Todos los archivos han sido generados.');
          break;

        case 'error':
          setStreamBuffer(prev => {
            if (prev) flushBuffer(prev);
            return '';
          });
          addLine('error', msg.content ?? 'Error desconocido en el servidor.');
          break;

        case 'system':
          addLine('system', msg.content ?? '');
          break;
      }
    };
  }, [projectId, addLine, flushBuffer, done]);

  // ── Acciones de usuario ───────────────────────────────────────────────────

  const handleStart = () => {
    connect();
    // Esperamos un tick para que onopen dispare y luego enviamos "start"
    setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'start' }));
        setStarted(true);
        addLine('system', 'Pipeline iniciado. Analizando proyecto...');
      } else {
        // Retry: onopen enviará el start
        const ws = wsRef.current;
        if (ws) {
          const origOpen = ws.onopen as ((ev: Event) => void) | null;
          ws.onopen = (ev) => {
            if (origOpen) origOpen(ev);
            ws.send(JSON.stringify({ type: 'start' }));
            setStarted(true);
          };
        }
      }
    }, 300);
  };

  const sendUserInput = (content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLine('error', 'Sin conexión activa. Recarga e intenta de nuevo.');
      return;
    }
    addLine('user', content);
    wsRef.current.send(JSON.stringify({ type: 'user_input', content }));
  };

  const handleOptionClick = (option: string) => {
    if (option.toLowerCase().includes('instrucción personalizada')) {
      setShowCustomInput(true);
    } else {
      sendUserInput(option);
    }
  };

  const handleSendCustom = () => {
    if (!customText.trim()) return;
    sendUserInput(customText.trim());
  };

  // ── Descarga ZIP ──────────────────────────────────────────────────────────

  const handleDownloadZip = async () => {
    if (filesMapRef.current.size === 0) return;
    const zip = new JSZip();
    filesMapRef.current.forEach((content, path) => {
      zip.file(path, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `proyecto-herman-${projectId}.zip`);
  };

  // ── Cleanup al desmontar ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full space-y-4">

      {/* ── Cabecera ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="font-semibold text-slate-900">
            Pipeline IA
          </span>
          {currentPhaseName && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {currentPhaseName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Contador de archivos generados */}
          {filesCount > 0 && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {filesCount} archivo{filesCount !== 1 ? 's' : ''} generado{filesCount !== 1 ? 's' : ''}
            </span>
          )}

          {/* Botón Descargar ZIP */}
          {done && filesCount > 0 && (
            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md"
            >
              <Download size={16} />
              Descargar ZIP
            </button>
          )}

          {/* Botón Iniciar */}
          {!started && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-200"
            >
              <Zap size={16} />
              Iniciar Pipeline
            </button>
          )}
        </div>
      </div>

      {/* ── Terminal ── */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col flex-1 min-h-0">

        {/* Barra superior del terminal */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800">
          <Terminal size={14} className="text-slate-400" />
          <span className="text-slate-400 text-xs font-mono">
            herman-ai — proyecto #{projectId}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Contenido scrollable */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm"
          style={{ minHeight: 0 }}
        >
          {lines.length === 0 && !streamBuffer && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-16">
              <Bot size={48} className="mb-4 opacity-40" />
              <p className="text-slate-400">Presiona &quot;Iniciar Pipeline&quot; para comenzar la generación.</p>
            </div>
          )}

          {lines.map((line, i) => (
            <TerminalLineRow key={i} line={line} />
          ))}

          {/* Token en streaming (línea activa) */}
          {streamBuffer && (
            <div className="flex items-start gap-2 text-slate-200">
              <Loader size={14} className="mt-0.5 text-purple-400 animate-spin shrink-0" />
              <span className="whitespace-pre-wrap break-words leading-relaxed">
                {streamBuffer}
                <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-text-bottom" />
              </span>
            </div>
          )}
        </div>

        {/* ── Bloque de preguntas interactivas ── */}
        {waitingInput && questions && (
          <div className="border-t border-slate-700 bg-slate-800/80 p-4 space-y-3">
            <p className="text-slate-300 text-sm font-medium">{questions.question}</p>
            <div className="flex flex-wrap gap-2">
              {questions.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  <ChevronRight size={14} />
                  {opt}
                </button>
              ))}
            </div>

            {showCustomInput && (
              <div className="flex gap-2 mt-2">
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Escribe tu instrucción personalizada..."
                  rows={2}
                  className="flex-1 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendCustom();
                    }
                  }}
                />
                <button
                  onClick={handleSendCustom}
                  disabled={!customText.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors self-end"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Barra de estado inferior */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                done ? 'bg-green-500' :
                waitingInput ? 'bg-yellow-500 animate-pulse' :
                connected ? 'bg-blue-500 animate-pulse' :
                'bg-slate-500'
              }`} />
              {done ? 'Completado' : waitingInput ? 'Esperando respuesta' : connected ? 'Conectado' : 'Desconectado'}
            </span>
            {currentPhase > 0 && (
              <span>Fase {currentPhase}/7</span>
            )}
          </div>
          <span>{filesCount} archivos generados</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: fila de terminal
// ─────────────────────────────────────────────────────────────────────────────

function TerminalLineRow({ line }: { line: TerminalLine }) {
  const icon = {
    ai: <Bot size={14} className="text-purple-400 shrink-0 mt-0.5" />,
    system: <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />,
    user: <User size={14} className="text-green-400 shrink-0 mt-0.5" />,
    error: <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />,
  }[line.type];

  const textColor = {
    ai: 'text-slate-200',
    system: 'text-blue-300',
    user: 'text-green-300',
    error: 'text-red-400',
  }[line.type];

  return (
    <div className={`flex items-start gap-2 ${textColor}`}>
      {icon}
      <span className="whitespace-pre-wrap break-words leading-relaxed">{line.content}</span>
    </div>
  );
}
