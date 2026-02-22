import { useState } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Save,
  X,
  Key,
  Link as LinkIcon,
  ArrowRightFromLine,
  Lock,
  Check,
  Download,
  Upload,
  Layers,
  Eye
} from 'lucide-react';

export interface Column {
  id: string;
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  isNullable: boolean;
  defaultValue?: string;
  references?: {
    tableId: string;
    columnId: string;
  };
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  position: { x: number; y: number };
}

export interface Relationship {
  id: string;
  fromTable: string;
  toTable: string;
  type: '1:1' | '1:N' | 'N:M';
}

interface ModeladorDatosProps {
  tables: Table[];
  relationships: Relationship[];
  onUpdate: (tables: Table[], relationships: Relationship[]) => void;
}

export function ModeladorDatos({ tables, relationships, onUpdate }: ModeladorDatosProps) {
  const [selectedTable, setSelectedTable] = useState<Table | null>(tables[0] || null);
  const [selectedField, setSelectedField] = useState<Column | null>(null);
  const [showDDLPreview, setShowDDLPreview] = useState(false);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);

  const handleAddTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      name: 'NuevaTabla',
      position: { x: 100, y: 100 },
      columns: [
        {
          id: `${Date.now()}-f1`,
          name: 'id',
          type: 'INT',
          isPk: true,
          isFk: false,
          isNullable: false,
        },
      ],
    };
    onUpdate([...tables, newTable], relationships);
  };

  const handleAddField = (tableId: string) => {
    const newField: Column = {
      id: crypto.randomUUID(),
      name: 'new_column',
      type: 'VARCHAR(255)',
      isPk: false,
      isFk: false,
      isNullable: true,
    };

    const updatedTables = tables.map((t) =>
      t.id === tableId ? { ...t, columns: [...t.columns, newField] } : t
    );
    onUpdate(updatedTables, relationships);
  };

  const handleDeleteField = (tableId: string, fieldId: string) => {
    const updatedTables = tables.map((t) =>
      t.id === tableId ? { ...t, columns: t.columns.filter((f) => f.id !== fieldId) } : t
    );
    onUpdate(updatedTables, relationships);
  };

  const handleDeleteTable = (tableId: string) => {
    if (confirm('¿Eliminar esta tabla?')) {
      const newTables = tables.filter((t) => t.id !== tableId);
      const newRelationships = relationships.filter(
        (r) => r.fromTable !== tableId && r.toTable !== tableId
      );
      onUpdate(newTables, newRelationships);
      setSelectedTable(null);
    }
  };

  const handleUpdateField = (tableId: string, fieldId: string, updates: Partial<Column>) => {
    const updatedTables = tables.map((t) =>
      t.id === tableId
        ? {
          ...t,
          columns: t.columns.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
        }
        : t
    );
    onUpdate(updatedTables, relationships);
  };

  const generateDDL = () => {
    let ddl = '';
    tables.forEach((table) => {
      ddl += `CREATE TABLE ${table.name} (\n`;
      const fieldDefs = table.columns.map((field) => {
        let def = `  ${field.name} ${field.type}`;
        if (!field.isNullable) def += ' NOT NULL';
        if (field.isPk) def += ' PRIMARY KEY';
        if (field.defaultValue) def += ` DEFAULT '${field.defaultValue}'`;
        return def;
      });
      ddl += fieldDefs.join(',\n');
      ddl += '\n);\n\n';
    });

    relationships.forEach((rel) => {
      const fromTable = tables.find((t) => t.id === rel.fromTable);
      const toTable = tables.find((t) => t.id === rel.toTable);
      if (fromTable && toTable) {
        // Find if there's an existing foreign key column
        const fkColumn = fromTable.columns.find(
          (col) => col.isFk && col.references?.tableId === toTable.id
        );

        if (fkColumn && fkColumn.references) {
          const referencedColumn = toTable.columns.find(
            (col) => col.id === fkColumn.references?.columnId
          );
          if (referencedColumn) {
            ddl += `ALTER TABLE ${fromTable.name}\n`;
            ddl += `  ADD CONSTRAINT FK_${fromTable.name}_${toTable.name}_${fkColumn.name}\n`;
            ddl += `  FOREIGN KEY (${fkColumn.name}) REFERENCES ${toTable.name}(${referencedColumn.name});\n\n`;
          }
        } else {
          // Fallback generic relationship constraint if no specific column is marked
          // This is simplified for the visual modeler
          ddl += `-- Relationship: ${fromTable.name} -> ${toTable.name} (${rel.type})\n`;
        }
      }
    });

    return ddl;
  };

  return (
    <div className="flex h-full bg-slate-50 relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
        <button
          onClick={handleAddTable}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
        >
          <Plus size={16} />
          Nueva Tabla
        </button>
        <div className="w-px h-6 bg-slate-200 my-auto" />
        <button
          onClick={() => setShowDDLPreview(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
        >
          <Database size={16} />
          Ver SQL
        </button>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 relative overflow-auto"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const tableId = e.dataTransfer.getData('tableId');
          if (tableId) {
            const rect = e.currentTarget.getBoundingClientRect();
            const newX = e.clientX - rect.left;
            const newY = e.clientY - rect.top;

            onUpdate(
              tables.map((t) => ({
                ...t,
                position: t.id === tableId ? { x: newX, y: newY } : t.position
              })),
              relationships
            );
          }
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Relationships SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {relationships.map((rel) => {
            const fromTable = tables.find((t) => t.id === rel.fromTable);
            const toTable = tables.find((t) => t.id === rel.toTable);
            if (!fromTable || !toTable) return null;

            const fromX = fromTable.position.x + 300; // Right side of from table
            const fromY = fromTable.position.y + 100; // Middle (approx)
            const toX = toTable.position.x; // Left side of to table
            const toY = toTable.position.y + 50; // Middle (approx)

            return (
              <g key={rel.id}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <circle cx={fromX} cy={fromY} r="3" fill="#94a3b8" />
                <circle cx={toX} cy={toY} r="3" fill="#94a3b8" />
              </g>
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>

        {/* Tables */}
        {tables.map((table) => (
          <div
            key={table.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('tableId', table.id);
            }}
            onClick={() => setSelectedTable(table)}
            className={`absolute bg-white rounded-lg border-2 shadow-lg transition-all cursor-move ${selectedTable?.id === table.id
              ? 'border-purple-500 ring-4 ring-purple-200'
              : 'border-slate-300'
              }`}
            style={{
              left: table.position.x,
              top: table.position.y,
              width: 300,
              zIndex: 10,
            }}
          >
            {/* Table Header */}
            <div className={`p-3 rounded-t-lg flex items-center justify-between ${selectedTable?.id === table.id ? 'bg-purple-600' : 'bg-slate-800'
              }`}>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-white/70" />
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) =>
                    onUpdate(
                      tables.map((t) => (t.id === table.id ? { ...t, name: e.target.value } : t)),
                      relationships
                    )
                  }
                  className="bg-transparent border-none text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-1 w-full"
                />
              </div>
              <button
                onClick={() => handleDeleteTable(table.id)}
                className="p-1 hover:bg-white/20 rounded transition-all text-white/70 hover:text-white"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Fields List */}
            <div className="divide-y divide-slate-200 bg-white rounded-b-lg">
              {table.columns.map((field) => (
                <div
                  key={field.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedField(field);
                    setSelectedTable(table);
                  }}
                  className={`flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer group ${selectedField?.id === field.id && selectedTable?.id === table.id ? 'bg-purple-50' : ''}`}
                >
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    {field.isPk && <Key size={14} className="text-yellow-600 shrink-0" />}
                    {field.isFk && <LinkIcon size={14} className="text-blue-600 shrink-0" />}
                    <span className="text-sm font-medium text-slate-900 truncate">{field.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500 font-mono">{field.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteField(table.id, field.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Field Button */}
              <button
                onClick={() => handleAddField(table.id)}
                className="w-full py-2 text-sm text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-1 rounded-b-lg"
              >
                <Plus size={14} /> Agregar Campo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar - Properties */}
      {selectedField && selectedTable && (
        <div className="w-80 bg-white border-l border-slate-200 p-4 transition-all overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800">Propiedades</h3>
            <button onClick={() => setSelectedField(null)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Campo</label>
              <input
                type="text"
                value={selectedField.name}
                onChange={(e) => handleUpdateField(selectedTable.id, selectedField.id, { name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Dato</label>
              <select
                value={selectedField.type}
                onChange={(e) => handleUpdateField(selectedTable.id, selectedField.id, { type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {[
                  'INT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'UUID', 'DECIMAL(10,2)', 'ENUM'
                ].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              {/* Primary Key Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedField.isPk ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`}>
                  {selectedField.isPk && <Check size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedField.isPk}
                  onChange={(e) => handleUpdateField(selectedTable.id, selectedField.id, { isPk: e.target.checked })}
                />
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-yellow-600" />
                  <span className="text-sm font-medium text-slate-700">Llave Primaria (PK)</span>
                </div>
              </label>

              {/* Foreign Key Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedField.isFk ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`}>
                  {selectedField.isFk && <Check size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedField.isFk}
                  onChange={(e) => handleUpdateField(selectedTable.id, selectedField.id, { isFk: e.target.checked })}
                />
                <div className="flex items-center gap-2">
                  <LinkIcon size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Llave Foránea (FK)</span>
                </div>
              </label>

              {/* Required Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${!selectedField.isNullable ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`}>
                  {!selectedField.isNullable && <Check size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={!selectedField.isNullable}
                  onChange={(e) => handleUpdateField(selectedTable.id, selectedField.id, { isNullable: !e.target.checked })}
                />
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-red-500" />
                  <span className="text-sm font-medium text-slate-700">Requerido (Not Null)</span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedField(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Confirmar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DDL Preview Modal */}
      {showDDLPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Database size={20} className="text-purple-600" />
                SQL DDL Preview
              </h3>
              <button
                onClick={() => setShowDDLPreview(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-0 overflow-hidden flex-1 relative">
              <pre className="w-full h-full p-4 overflow-auto bg-slate-900 text-slate-50 font-mono text-sm leading-relaxed">
                {generateDDL()}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setShowDDLPreview(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                onClick={() => {
                  // Copy to clipboard or download logic can go here
                  navigator.clipboard.writeText(generateDDL());
                  alert('SQL copiado al portapapeles');
                }}
              >
                <Save size={18} />
                Copiar SQL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}