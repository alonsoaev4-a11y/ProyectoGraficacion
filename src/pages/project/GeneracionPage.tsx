import { useEffect, useState } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { Code, Download, Terminal, Layers, Box, Cpu, ChevronRight, Check } from 'lucide-react';
import { ProjectModuleLayout } from '@/components/layout/ProjectModuleLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export const GeneracionPage = () => {
    const { loadModule } = useWizard();
    const [selectedStack, setSelectedStack] = useState('fullstack');

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.generacion);
    }, []);

    return (
        <ProjectModuleLayout
            title="Generador de Código"
            description="Compila tu arquitectura visual en una aplicación production-ready."
            wizardTarget="generacion-header"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto h-full">

                {/* Left Panel: Configuration */}
                <div className="space-y-6">
                    <GlassCard className="p-6" data-wizard-target="gen-options">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <Box className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Arquitectura</h3>
                        </div>

                        <div className="space-y-3">
                            <div
                                onClick={() => setSelectedStack('fullstack')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedStack === 'fullstack' ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${selectedStack === 'fullstack' ? 'text-[var(--accent-cyan)]' : 'text-gray-300'}`}>Full Stack</span>
                                    {selectedStack === 'fullstack' && <Check className="w-4 h-4 text-[var(--accent-cyan)]" />}
                                </div>
                                <p className="text-xs text-gray-500">React Frontend + Node API + DB</p>
                            </div>

                            <div
                                onClick={() => setSelectedStack('backend')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedStack === 'backend' ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${selectedStack === 'backend' ? 'text-[var(--accent-cyan)]' : 'text-gray-300'}`}>Backend Only</span>
                                    {selectedStack === 'backend' && <Check className="w-4 h-4 text-[var(--accent-cyan)]" />}
                                </div>
                                <p className="text-xs text-gray-500">REST API + Prisma + Swagger</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6" data-wizard-target="gen-stack">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Tecnologías</h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {['Next.js 14', 'TypeScript', 'Tailwind', 'Prisma', 'PostgreSQL', 'Jest', 'Docker'].map((tech) => (
                                <span key={tech} className="cyber-badge cyber-badge-funcional flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </GlassCard>

                    <Button
                        variant="primary"
                        className="w-full py-4 text-sm"
                        wizardTarget="btn-generar"
                        icon={<Download className="w-5 h-5" />}
                    >
                        Generar Código Fuente
                    </Button>
                </div>

                {/* Right Panel: Preview Terminal */}
                <div className="lg:col-span-2 flex flex-col h-[600px]">
                    <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border-gray-200 bg-slate-900 shadow-xl">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-800" data-wizard-target="gen-preview">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-mono text-slate-400">herman-compiler ~ preview</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                            </div>
                        </div>

                        {/* Code Content */}
                        <div className="flex-1 p-6 font-mono text-xs md:text-sm overflow-auto custom-scrollbar bg-slate-950">
                            <div className="space-y-1">
                                <div className="text-slate-500">/** Auto-generated by Herman Platform v2.0 */</div>
                                <div className="h-2" />

                                <div className="flex gap-2">
                                    <span className="text-purple-400">import</span>
                                    <span className="text-cyan-300">{'{'} Router {'}'}</span>
                                    <span className="text-purple-400">from</span>
                                    <span className="text-green-400">'express'</span>;
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-purple-400">import</span>
                                    <span className="text-yellow-300">AuthController</span>
                                    <span className="text-purple-400">from</span>
                                    <span className="text-green-400">'@controllers/auth'</span>;
                                </div>

                                <div className="h-4" />

                                <div className="flex gap-2">
                                    <span className="text-purple-400">export const</span>
                                    <span className="text-blue-400">authRoutes</span>
                                    <span className="text-white">=</span>
                                    <span className="text-yellow-300">Router</span>();
                                </div>

                                <div className="h-4" />

                                <div className="pl-4 border-l border-slate-800">
                                    <div className="text-slate-500">// Route: Login (Generated from Diagrama de Flujo #Flow-Auth)</div>
                                    <div className="flex gap-2">
                                        <span className="text-blue-400">authRoutes</span>.<span className="text-yellow-300">post</span>(
                                        <span className="text-green-400">'/login'</span>,
                                        <span className="text-yellow-300">AuthController</span>.<span className="text-blue-300">login</span>
                                        );
                                    </div>
                                </div>

                                <div className="h-2" />

                                <div className="pl-4 border-l border-slate-800">
                                    <div className="text-slate-500">// Route: Register (Generated from CaseUse #CU-101)</div>
                                    <div className="flex gap-2">
                                        <span className="text-blue-400">authRoutes</span>.<span className="text-yellow-300">post</span>(
                                        <span className="text-green-400">'/register'</span>,
                                        <span className="text-yellow-300">AuthController</span>.<span className="text-blue-300">register</span>
                                        );
                                    </div>
                                </div>

                                <div className="h-4" />

                                <div className="flex items-center gap-2 text-slate-500 mt-8">
                                    <span className="animate-pulse">_</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </ProjectModuleLayout>
    );
};
