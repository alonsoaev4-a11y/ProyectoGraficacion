import { useEffect, useState } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { Database, Plus, Table, ZoomIn, ZoomOut, CheckCircle, Copy, Undo, Redo } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ProjectModuleLayout } from '@/components/layout/ProjectModuleLayout';

// Mock code for schema
const MOCK_SCHEMA = `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}`;

const TableTemplates = [
    { id: 1, name: 'Usuario Base', fields: 5 },
    { id: 2, name: 'Producto Ecommerce', fields: 8 },
    { id: 3, name: 'Orden de Compra', fields: 6 },
    { id: 4, name: 'Comentario Blog', fields: 4 },
];

export const ModeladoPage = () => {
    const { loadModule } = useWizard();
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.modelado);
    }, []);

    // Placeholder for copy function
    const copyToClipboard = (text: string) => {
        console.log("Copied:", text);
        // Toast logic would go here
    };

    return (
        <ProjectModuleLayout
            title="Modelado de Datos"
            description="Diseña tu esquema de base de datos visualmente."
            wizardTarget="modelado-header"
            fullHeight={true}
        >
            <div className="flex h-full relative overflow-hidden">
                {/* Background Grid visible through transparent areas */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,217,255,0.02)_0%,_transparent_50%)]" />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `
                                linear-gradient(#fff 1px, transparent 1px),
                                linear-gradient(90deg, #fff 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px'
                        }}
                    />
                </div>

                {/* Sidebar izquierdo - Paleta de tablas */}
                <aside className="w-72 border-r border-gray-200 bg-white/80 backdrop-blur-xl p-6 flex flex-col z-10 cyber-card !rounded-none !border-y-0 !border-l-0">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                            <Database className="text-[var(--accent-cyan)] w-5 h-5" />
                            Paleta
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)]">Arrastra componentes al lienzo</p>
                    </div>

                    <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => { }}
                        wizardTarget="btn-nueva-tabla"
                        className="w-full mb-6 shadow-cyan-900/20"
                    >
                        Nueva Tabla
                    </Button>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar" data-wizard-target="modelado-palette">
                        {TableTemplates.map(plantilla => (
                            <motion.div
                                key={plantilla.id}
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="cyber-card p-4 cursor-move flex items-center gap-3 transition-colors shadow-sm hover:shadow-lg border border-gray-200 hover:border-[var(--accent-cyan)]/30 bg-white"
                            >
                                <div className="p-2 bg-cyan-50 rounded-lg">
                                    <Table className="w-4 h-4 text-cyan-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[var(--text-primary)] text-sm">{plantilla.name}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{plantilla.fields} campos</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Stats Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-secondary)] uppercase tracking-wider font-bold">Tablas</span>
                            <span className="text-[var(--accent-cyan)] font-mono">2</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-secondary)] uppercase tracking-wider font-bold">Relaciones</span>
                            <span className="text-purple-500 font-mono">1</span>
                        </div>
                    </div>
                </aside>

                {/* Panel central - Lienzo */}
                <div className="flex-1 relative bg-transparent" data-wizard-target="mod-lienzo">
                    {/* Simulated React Flow Canvas */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Nodes Mock - Positioning manually for demo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-1/4 left-1/4 w-56 bg-white border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,217,255,0.1)] overflow-hidden"
                        >
                            <div className="h-10 bg-gradient-to-r from-cyan-50 to-white border-b border-cyan-100 px-4 flex items-center justify-between">
                                <span className="font-bold text-cyan-700 text-sm">User</span>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-sm" />
                            </div>
                            <div className="p-4 space-y-2 text-xs font-mono">
                                <div className="flex justify-between text-slate-700"><span>id</span> <span className="text-yellow-600">Int @id</span></div>
                                <div className="flex justify-between text-slate-700" data-wizard-target="mod-campo-nombre"><span>email</span> <span className="text-blue-600" data-wizard-target="mod-tipo-dato">String</span></div>
                                <div className="flex justify-between text-slate-700"><span>name</span> <span className="text-blue-600">String?</span></div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="absolute top-1/3 left-1/2 w-56 bg-white border border-purple-500/40 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden"
                        >
                            <div className="h-10 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 px-4 flex items-center justify-between">
                                <span className="font-bold text-purple-700 text-sm">Post</span>
                                <div className="w-2 h-2 bg-purple-400 rounded-full shadow-sm" />
                            </div>
                            <div className="p-4 space-y-2 text-xs font-mono">
                                <div className="flex justify-between text-slate-700"><span>id</span> <span className="text-yellow-600">Int @id</span></div>
                                <div className="flex justify-between text-slate-700"><span>title</span> <span className="text-blue-600">String</span></div>
                                <div className="flex justify-between text-slate-700"><span>authorId</span> <span className="text-green-600">User</span></div>
                            </div>
                        </motion.div>

                        {/* SVG Connection Line */}
                        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
                            <g data-wizard-target="mod-relaciones">
                                <path d="M 330 250 C 450 250, 450 350, 500 350" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                                <circle cx="415" cy="300" r="4" fill="#94a3b8">
                                    <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                                </circle>
                            </g>
                        </svg>
                    </div>

                    {/* Floating Toolbar */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2">
                        <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-full p-1.5 flex items-center gap-1 shadow-xl">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-slate-900" onClick={() => setZoom(z => z + 0.1)}><ZoomIn className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-slate-900" onClick={() => setZoom(z => z - 0.1)}><ZoomOut className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1" />
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-slate-900"><Undo className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-slate-900"><Redo className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1" />
                            <button className="p-2 hover:bg-green-500/10 rounded-full transition-colors text-green-600 shadow-sm hover:shadow-green-500/20" data-wizard-target="flow-validation"><CheckCircle className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Schema Preview */}
                <aside className="w-96 border-l border-gray-200 bg-white/95 backdrop-blur-xl flex flex-col z-10 cyber-card !rounded-none !border-y-0 !border-r-0" data-wizard-target="mod-schema-preview">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Prisma Schema</h2>
                        <p className="text-sm text-[var(--text-secondary)]">Generado en tiempo real</p>
                    </div>

                    <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed custom-scrollbar bg-slate-50 inner-shadow">
                        <pre className="text-slate-700">
                            {MOCK_SCHEMA.split('\n').map((line, i) => (
                                <div key={i} className="hover:bg-gray-200/50 px-2 -mx-2 rounded">
                                    <span className="text-gray-400 select-none w-6 inline-block text-right mr-4">{i + 1}</span>
                                    <span dangerouslySetInnerHTML={{
                                        __html: line
                                            .replace(/model/g, '<span class="text-purple-600 font-bold">model</span>')
                                            .replace(/Int/g, '<span class="text-yellow-600">Int</span>')
                                            .replace(/String/g, '<span class="text-green-600">String</span>')
                                            .replace(/Boolean/g, '<span class="text-orange-600">Boolean</span>')
                                            .replace(/DateTime/g, '<span class="text-cyan-600">DateTime</span>')
                                            .replace(/@id/g, '<span class="text-gray-500">@id</span>')
                                            .replace(/@default/g, '<span class="text-gray-500">@default</span>')
                                    }} />
                                </div>
                            ))}
                        </pre>
                    </div>

                    <div className="p-6 border-t border-gray-200 relative bg-white">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-20" />
                        <Button
                            variant="primary"
                            icon={<Copy className="w-4 h-4" />}
                            onClick={() => copyToClipboard(MOCK_SCHEMA)}
                            className="w-full"
                        >
                            Copiar Schema
                        </Button>
                    </div>
                </aside>
            </div>
        </ProjectModuleLayout>
    );
};
