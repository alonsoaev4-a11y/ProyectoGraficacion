import { useState, useRef } from 'react';
import {
  Play,
  Square,
  Diamond,
  Circle,
  User,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Code,
  Trash2,
  Copy,
  Edit3,
  Save,
} from 'lucide-react';

interface Node {
  id: string;
  type: 'start' | 'action' | 'decision' | 'end' | 'actor';
  label: string;
  x: number;
  y: number;
  actor?: string;
  timeout?: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const initialNodes: Node[] = [
  { id: '1', type: 'start', label: 'Inicio', x: 400, y: 50 },
  { id: '2', type: 'action', label: 'Usuario selecciona "Nuevo Alumno"', x: 400, y: 150, actor: 'Secretaria' },
  { id: '3', type: 'action', label: 'Sistema muestra formulario', x: 400, y: 250 },
  { id: '4', type: 'action', label: 'Usuario ingresa datos', x: 400, y: 350, actor: 'Secretaria' },
  { id: '5', type: 'decision', label: '¿Datos válidos?', x: 400, y: 470 },
  { id: '6', type: 'action', label: 'Sistema guarda alumno', x: 400, y: 600 },
  { id: '7', type: 'end', label: 'Fin', x: 400, y: 700 },
  { id: '8', type: 'action', label: 'Mostrar error', x: 600, y: 470 },
];

const initialConnections: Connection[] = [
  { id: 'c1', from: '1', to: '2' },
  { id: 'c2', from: '2', to: '3' },
  { id: 'c3', from: '3', to: '4' },
  { id: 'c4', from: '4', to: '5' },
  { id: 'c5', from: '5', to: '6', label: 'Sí' },
  { id: 'c6', from: '6', to: '7' },
  { id: 'c7', from: '5', to: '8', label: 'No' },
  { id: 'c8', from: '8', to: '4' },
];

const nodeComponents = [
  { type: 'start', label: 'Inicio', icon: Play, color: 'bg-green-100 border-green-500 text-green-700' },
  { type: 'action', label: 'Acción', icon: Square, color: 'bg-blue-100 border-blue-500 text-blue-700' },
  { type: 'decision', label: 'Decisión', icon: Diamond, color: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
  { type: 'actor', label: 'Actor', icon: User, color: 'bg-purple-100 border-purple-500 text-purple-700' },
  { type: 'end', label: 'Fin', icon: Circle, color: 'bg-red-100 border-red-500 text-red-700' },
];

export function EditorDiagramaFlujo() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setShowPropertiesPanel(true);
  };

  const handleNodeDoubleClick = (node: Node) => {
    const newLabel = prompt('Editar texto del nodo:', node.label);
    if (newLabel) {
      setNodes(nodes.map((n) => (n.id === node.id ? { ...n, label: newLabel } : n)));
    }
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes(nodes.filter((n) => n.id !== selectedNode.id));
      setConnections(connections.filter((c) => c.from !== selectedNode.id && c.to !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const handleDuplicateNode = () => {
    if (selectedNode) {
      const newNode: Node = {
        ...selectedNode,
        id: Date.now().toString(),
        x: selectedNode.x + 50,
        y: selectedNode.y + 50,
      };
      setNodes([...nodes, newNode]);
    }
  };

  const handleExportSVG = () => {
    alert('Exportando diagrama como SVG...');
  };

  const handleExportPNG = () => {
    alert('Exportando diagrama como PNG...');
  };

  const handleGenerateCode = () => {
    let code = '// Pseudo-código generado del flujo\n\n';
    code += 'function registrarAlumno() {\n';
    nodes.forEach((node) => {
      if (node.type === 'action') {
        code += `  // ${node.label}\n`;
      } else if (node.type === 'decision') {
        code += `  if (${node.label}) {\n    // ...\n  }\n`;
      }
    });
    code += '}\n';
    alert(code);
  };

  const getNodeShape = (type: string) => {
    switch (type) {
      case 'start':
      case 'end':
        return 'rounded-full';
      case 'decision':
        return 'rotate-45';
      case 'actor':
        return 'rounded-lg border-2 border-dashed';
      default:
        return 'rounded-lg';
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'bg-green-500 text-white';
      case 'end':
        return 'bg-red-500 text-white';
      case 'decision':
        return 'bg-yellow-400 text-slate-900';
      case 'actor':
        return 'bg-purple-100 border-purple-500 text-purple-700';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all text-sm font-medium"
            >
              <Download size={16} />
              Exportar SVG
            </button>
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all text-sm font-medium"
            >
              <Download size={16} />
              Exportar PNG
            </button>
            <button
              onClick={handleGenerateCode}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-medium"
            >
              <Code size={16} />
              Generar Pseudo-código
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-all"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm text-slate-600 font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-all"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-all"
            >
              <Maximize2 size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-purple-500/30">
              <Save size={16} />
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Palette */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Componentes
          </h3>
          <div className="space-y-2">
            {nodeComponents.map((component) => {
              const Icon = component.icon;
              return (
                <div
                  key={component.type}
                  draggable
                  className={`flex items-center gap-3 p-3 ${component.color} border-2 rounded-lg cursor-move hover:shadow-lg transition-all`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{component.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Atajos</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Doble-clic: Editar nodo</li>
              <li>• Arrastrar: Mover nodo</li>
              <li>• ESC: Deseleccionar</li>
              <li>• Ctrl+Z: Deshacer</li>
            </ul>
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-slate-100 relative" ref={canvasRef}>
          <div
            className="relative"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              minWidth: '1200px',
              minHeight: '800px',
            }}
          >
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {connections.map((conn) => {
                const fromNode = nodes.find((n) => n.id === conn.from);
                const toNode = nodes.find((n) => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromX = fromNode.x + 80;
                const fromY = fromNode.y + 40;
                const toX = toNode.x + 80;
                const toY = toNode.y;

                return (
                  <g key={conn.id}>
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
                      </marker>
                    </defs>
                    <path
                      d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
                      stroke="#64748b"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    {conn.label && (
                      <text
                        x={(fromX + toX) / 2}
                        y={(fromY + toY) / 2 - 10}
                        fill="#475569"
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onDoubleClick={() => handleNodeDoubleClick(node)}
                draggable
                className={`absolute cursor-move transition-all ${selectedNode?.id === node.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                  }`}
                style={{
                  left: node.x,
                  top: node.y,
                  zIndex: 10,
                }}
              >
                <div
                  className={`w-40 p-3 ${getNodeColor(node.type)} ${getNodeShape(
                    node.type
                  )} shadow-lg border-2 border-opacity-50 hover:shadow-xl transition-all ${node.type === 'decision' ? 'w-32 h-32 flex items-center justify-center' : 'min-h-[80px]'
                    }`}
                >
                  <div className={node.type === 'decision' ? '-rotate-45 text-center' : 'text-center'}>
                    <div className="font-semibold text-sm leading-tight">{node.label}</div>
                    {node.actor && (
                      <div className="text-xs mt-1 opacity-80">({node.actor})</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Properties Panel */}
        {showPropertiesPanel && selectedNode && (
          <aside className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Propiedades del Nodo</h3>
              <button
                onClick={() => setShowPropertiesPanel(false)}
                className="p-1 hover:bg-slate-100 text-slate-500 rounded"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                <select
                  value={selectedNode.type}
                  onChange={(e) =>
                    setNodes(
                      nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, type: e.target.value as any } : n
                      )
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="start">Inicio</option>
                  <option value="action">Acción</option>
                  <option value="decision">Decisión</option>
                  <option value="actor">Actor</option>
                  <option value="end">Fin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Texto</label>
                <textarea
                  value={selectedNode.label}
                  onChange={(e) =>
                    setNodes(
                      nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, label: e.target.value } : n
                      )
                    )
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actor</label>
                <input
                  type="text"
                  value={selectedNode.actor || ''}
                  onChange={(e) =>
                    setNodes(
                      nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, actor: e.target.value } : n
                      )
                    )
                  }
                  placeholder="Ej: Secretaria"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timeout (segundos)
                </label>
                <input
                  type="number"
                  value={selectedNode.timeout || ''}
                  onChange={(e) =>
                    setNodes(
                      nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, timeout: parseInt(e.target.value) } : n
                      )
                    )
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleDuplicateNode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all mb-2"
                >
                  <Copy size={16} />
                  Duplicar Nodo
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                  Eliminar Nodo
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
