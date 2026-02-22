import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Database, Code2, GripVertical, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Tipos de items arrastrables
const ItemTypes = {
    TABLE: 'table',
};

// Datos iniciales para la paleta
const paletteItems = [
    {
        id: 'users', label: 'Usuarios', icon: '👤', code: `model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}` },
    {
        id: 'products', label: 'Productos', icon: '📦', code: `model Product {
  id          String   @id @default(uuid())
  name        String
  price       Decimal
  stock       Int
  createdAt   DateTime @default(now())
}` },
    {
        id: 'orders', label: 'Ordenes', icon: '🛒', code: `model Order {
  id        String   @id @default(uuid())
  total     Decimal
  status    String   @default("PENDING")
  user      User     @relation(fields: [userId], references: [id])
  userId    String
}` },
];

interface TableItem {
    id: string;
    label: string;
    icon: string;
    code: string;
}

// Componente Draggable de la Paleta
const DraggablePaletteItem = ({ item }: { item: TableItem }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TABLE,
        item: { ...item, origin: 'palette' },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag as unknown as React.RefObject<HTMLDivElement>}
            className={cn(
                "p-3 rounded-lg border border-white/10 bg-white/5 cursor-move hover:border-[var(--accent-purple)] hover:bg-white/10 transition-all flex items-center gap-3 select-none",
                isDragging && "opacity-50"
            )}
        >
            <div className="w-8 h-8 rounded bg-[var(--accent-purple)]/20 flex items-center justify-center text-lg">
                {item.icon}
            </div>
            <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
            <GripVertical className="ml-auto w-4 h-4 text-[var(--text-secondary)]" />
        </div>
    );
};

// Componente Canvas Drop Zone
const CanvasDropZone = ({
    droppedItems,
    onDrop,
    onRemove
}: {
    droppedItems: TableItem[],
    onDrop: (item: TableItem) => void,
    onRemove: (index: number) => void
}) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.TABLE,
        drop: (item: TableItem & { origin?: string }) => {
            onDrop(item);
            return undefined;
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={drop as unknown as React.RefObject<HTMLDivElement>}
            className={cn(
                "h-[400px] rounded-xl border-2 border-dashed transition-all relative overflow-hidden",
                isOver
                    ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5"
                    : "border-white/10 bg-black/20"
            )}
        >
            {droppedItems.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] p-6 text-center">
                    <Database className="w-12 h-12 mb-4 opacity-50" />
                    <p>Arrastra tablas aquí desde el panel izquierdo</p>
                </div>
            ) : (
                <div className="p-4 grid grid-cols-1 gap-4 overflow-auto max-h-full">
                    {droppedItems.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-white/10 flex items-center justify-between animate-in fade-in zoom-in duration-300"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-[var(--accent-cyan)]/20 flex items-center justify-center text-xl">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-primary)]">{item.label}</p>
                                    <p className="text-xs text-[var(--text-secondary)] font-mono">model {item.label}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemove(index)}
                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export function MiniDemo() {
    const [droppedItems, setDroppedItems] = useState<TableItem[]>([]);

    const handleDrop = (item: TableItem) => {
        // Permitimos duplicados para el demo, o filtramos si queremos únicos
        if (!droppedItems.find(i => i.id === item.id)) {
            setDroppedItems(prev => [...prev, item]);
        }
    };

    const handleRemove = (index: number) => {
        setDroppedItems(prev => prev.filter((_, i) => i !== index));
    };

    const generateCode = () => {
        if (droppedItems.length === 0) return "// Arrastra una tabla para ver el código...";

        return `// Auto-generated Schema
// ---------------------

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${droppedItems.map(item => item.code).join('\n\n')}`;
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <section id="mini-demo" className="py-24 bg-[var(--bg-secondary)] border-y border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

                <div className="container px-4 mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[var(--accent-green)] font-mono text-sm tracking-wider uppercase mb-2 block">Interactive Demo</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                            Arrastra. Suelta. Genera.
                        </h2>
                        <p className="text-[var(--text-secondary)] mt-4 max-w-2xl mx-auto">
                            Experimenta el poder del motor de Herman. Construye tu esquema visualmente y obtén el código al instante.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                        {/* Palette */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold mb-4">
                                <Database className="w-5 h-5 text-[var(--accent-purple)]" />
                                <h3>Tablas Disponibles</h3>
                            </div>
                            <div className="space-y-3">
                                {paletteItems.map(item => (
                                    <DraggablePaletteItem key={item.id} item={item} />
                                ))}
                            </div>
                            <div className="p-4 rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 mt-8">
                                <p className="text-xs text-[var(--accent-cyan)]">
                                    Tip: Arrastra estas tablas al área central para agregarlas a tu proyecto.
                                </p>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="lg:col-span-5">
                            <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold mb-4">
                                <GripVertical className="w-5 h-5 text-[var(--accent-green)]" />
                                <h3>Lienzo de Diseño</h3>
                            </div>
                            <CanvasDropZone
                                droppedItems={droppedItems}
                                onDrop={handleDrop}
                                onRemove={handleRemove}
                            />
                        </div>

                        {/* Code Preview */}
                        <div className="lg:col-span-4">
                            <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold mb-4">
                                <Code2 className="w-5 h-5 text-[var(--accent-cyan)]" />
                                <h3>Código Generado</h3>
                            </div>
                            <Card className="relative bg-[#0d0d12] border-white/10 overflow-hidden h-[400px]">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                                    <span className="text-xs font-mono text-[var(--text-secondary)]">schema.prisma</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                    </div>
                                </div>
                                <div className="p-4 overflow-auto h-[calc(100%-48px)] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    <pre className="font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
                                        <code className="language-prisma">
                                            {generateCode()}
                                        </code>
                                    </pre>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </DndProvider>
    );
}
