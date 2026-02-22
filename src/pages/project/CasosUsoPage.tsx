import { useEffect, useState } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { Zap, Plus, Users, UserCircle2, Server, Globe, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProjectModuleLayout } from '@/components/layout/ProjectModuleLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

// --- Interfaces ---
interface Actor {
    name: string;
    type: 'primary' | 'secondary' | 'system';
}

interface Step {
    step: number;
    description: string;
    actor: string;
}

interface AlternativeFlow {
    id: string;
    title: string;
    steps: Step[];
}

interface Exception {
    condition: string;
    result: string;
}

interface BusinessRule {
    id: string;
    description: string;
}

interface UseCase {
    id: number;
    code: string;
    title: string;
    description: string;
    priority: 'Alta' | 'Media' | 'Baja';
    status: 'Borrador' | 'Revisión' | 'Aprobado';
    actors: Actor[];
    preconditions: string[];
    postconditions: string[];
    mainFlow: Step[];
    alternativeFlows: AlternativeFlow[];
    exceptions: Exception[];
    businessRules: BusinessRule[];
}

// --- Mock Data ---
const MOCK_CASOS_USO: UseCase[] = [
    {
        id: 1,
        code: 'CU-01',
        title: 'Inscribir alumno en curso',
        description: 'Permitir que la secretaria registre la inscripción de un alumno en un curso específico, validando cupos y horarios.',
        priority: 'Alta',
        status: 'Borrador',
        actors: [
            { name: 'Secretaria', type: 'primary' },
            { name: 'Sistema', type: 'system' },
            { name: 'Alumno', type: 'secondary' }
        ],
        preconditions: [
            'El alumno debe estar registrado en el sistema',
            'El curso debe tener cupo disponible',
            'La secretaria debe estar autenticada'
        ],
        postconditions: [
            'El alumno queda inscrito en el curso',
            'Se genera la boleta de inscripción',
            'Se actualiza el cupo del curso'
        ],
        businessRules: [
            { id: 'RN-01', description: 'Un alumno no puede estar inscrito en más de 5 cursos simultáneos' },
            { id: 'RN-02', description: 'No se permiten horarios traslapados entre cursos' }
        ],
        exceptions: [
            { condition: 'Alumno no encontrado', result: 'Mostrar mensaje de error y sugerir registro' },
            { condition: 'Curso sin cupo', result: 'Notificar falta de disponibilidad' },
            { condition: 'Horario traslapado', result: 'Impedir inscripción y mostrar conflicto' }
        ],
        mainFlow: [
            { step: 1, actor: 'Secretaria', description: 'Solicita matrícula del alumno' },
            { step: 2, actor: 'Sistema', description: 'Valida existencia del alumno y muestra datos' },
            { step: 3, actor: 'Secretaria', description: 'Selecciona el curso a inscribir' },
            { step: 4, actor: 'Sistema', description: 'Verifica disponibilidad de cupo y horarios' },
            { step: 5, actor: 'Sistema', description: 'Registra la inscripción y genera comprobante' },
            { step: 6, actor: 'Secretaria', description: 'Entrega comprobante al alumno' }
        ],
        alternativeFlows: [
            {
                id: 'A1',
                title: 'Alumno no encontrado',
                steps: [
                    { step: 1, actor: 'Sistema', description: 'Muestra mensaje de error: "Alumno no registrado"' },
                    { step: 2, actor: 'Secretaria', description: 'Cancela la operación o procede a registrar al alumno' }
                ]
            },
            {
                id: 'A2',
                title: 'Curso sin cupo',
                steps: [
                    { step: 1, actor: 'Sistema', description: 'Notifica que el curso seleccionado no tiene plazas disponibles' },
                    { step: 2, actor: 'Secretaria', description: 'Selecciona otro curso o termina el caso de uso' }
                ]
            }
        ]
    }
];

export const CasosUsoPage = () => {
    const { loadModule } = useWizard();
    const [selectedId, setSelectedId] = useState<number | null>(1);
    const selectedUseCase = MOCK_CASOS_USO.find(cu => cu.id === selectedId);

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.casosUso);
    }, []);

    const ActorBadge = ({ actor }: { actor: Actor }) => {
        const icons = {
            primary: <UserCircle2 className="w-3.5 h-3.5 text-purple-600" />,
            system: <Server className="w-3.5 h-3.5 text-cyan-600" />,
            secondary: <Users className="w-3.5 h-3.5 text-slate-500" />
        };
        const badgeClasses = {
            primary: 'cyber-badge cyber-badge-nofuncional', // Purple
            system: 'cyber-badge cyber-badge-funcional', // Cyan
            secondary: 'cyber-badge cyber-badge-baja' // Gray
        };

        return (
            <div className={`flex items-center gap-2 ${badgeClasses[actor.type]}`}>
                {icons[actor.type]}
                <span className="font-medium">{actor.name}</span>
                <span className="opacity-50 text-[10px] uppercase tracking-wider">({actor.type})</span>
            </div>
        );
    };

    return (
        <ProjectModuleLayout
            title="Casos de Uso"
            description="Modela las interacciones del usuario y la lógica de negocio del sistema."
            wizardTarget="cu-header"
            headerActions={
                <>
                    <div className="w-64 relative" data-wizard-target="cu-actores">
                        <select className="cyber-select w-full cursor-pointer">
                            <option>Todos los Actores</option>
                            <option>Usuario Final</option>
                            <option>Administrador</option>
                            <option>Sistema</option>
                        </select>
                        <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                    <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => { }}
                        wizardTarget="btn-nuevo-caso"
                    >
                        Nuevo Caso
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">

                {/* List Column */}
                <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    {MOCK_CASOS_USO.map((cu) => (
                        <GlassCard
                            key={cu.id}
                            hoverable
                            onClick={() => setSelectedId(cu.id)}
                            className={`transition-all duration-300 group border ${selectedId === cu.id ? 'border-[var(--accent-cyan)] shadow-md bg-white' : 'border-gray-200 bg-white/50 hover:bg-white'} `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="px-2 py-0.5 rounded bg-purple-50 text-[10px] font-mono text-purple-600 border border-purple-200 uppercase font-bold tracking-wider mb-2">
                                    {cu.code}
                                </div>
                                {cu.priority === 'Alta' && <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />}
                            </div>
                            <h3 className={`font-bold text-base mb-2 group-hover:text-[var(--accent-cyan)] transition-colors ${selectedId === cu.id ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-primary)]'}`}>
                                {cu.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{cu.priority}</span>
                                <span>•</span>
                                <span>{cu.mainFlow.length} pasos</span>
                            </div>
                        </GlassCard>
                    ))}

                    {/* Placeholder for "New" visual cues */}
                    <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-500 hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer flex flex-col items-center gap-2 bg-white/50">
                        <Plus className="w-5 h-5" />
                        <span className="text-xs font-bold">Crear nuevo caso</span>
                    </div>
                </div>

                {/* Details Column */}
                <div className="lg:col-span-9 flex flex-col h-full overflow-hidden">
                    {selectedUseCase ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">

                            {/* Main Flow (Center) */}
                            <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Flow Header */}
                                <GlassCard className="p-6 relative overflow-hidden bg-white" hoverable={false}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-purple)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                                    <div className="relative z-10 flex items-start justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{selectedUseCase.code} - {selectedUseCase.title}</h2>
                                            <p className="text-[var(--text-secondary)] text-sm max-w-xl">{selectedUseCase.description}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-[var(--accent-purple)] flex items-center gap-2 mb-4">
                                        <Zap className="w-5 h-5" />
                                        Flujo Principal
                                    </h3>

                                    <div className="space-y-4 relative pl-4" data-wizard-target="cu-pasos">
                                        {/* Connector Line */}
                                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 z-0" />

                                        {selectedUseCase.mainFlow.map((step, idx) => (
                                            <motion.div
                                                key={step.step}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="relative z-10 flex gap-4 group"
                                            >
                                                <div className="flex flex-col items-center gap-2 min-w-[32px]">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:border-[var(--accent-cyan)] group-hover:text-[var(--accent-cyan)] transition-colors shadow-sm">
                                                        {step.step}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-purple)] mb-1">
                                                        {step.actor}
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <p className="text-slate-700 text-sm">{step.description}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </GlassCard>

                                {/* Alternative Flows */}
                                <div>
                                    <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2 mb-4 px-2">
                                        <Globe className="w-5 h-5" />
                                        Flujos Alternativos
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedUseCase.alternativeFlows.map(flow => (
                                            <GlassCard key={flow.id} className="p-4 bg-white" hoverable>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-mono text-xs border border-blue-200">{flow.id}</span>
                                                    <h4 className="text-[var(--text-primary)] font-bold">{flow.title}</h4>
                                                </div>
                                                <div className="space-y-3 pl-2 border-l-2 border-gray-200 ml-2">
                                                    {flow.steps.map(step => (
                                                        <div key={step.step} className="flex gap-3 text-sm">
                                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-mono shrink-0">
                                                                {step.step}
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-blue-600 font-bold text-xs uppercase mr-2">{step.actor}</span>
                                                                <span className="text-gray-600">{step.description}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info (Right) */}
                            <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">

                                {/* Actors Section */}
                                <GlassCard className="p-4 bg-white">
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <UserCircle2 className="w-4 h-4 text-[var(--accent-purple)]" />
                                        Actores
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {selectedUseCase.actors.map((actor, i) => (
                                            <ActorBadge key={i} actor={actor} />
                                        ))}
                                    </div>
                                </GlassCard>

                                {/* Preconditions */}
                                <GlassCard className="p-4 bg-white">
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                        Precondiciones
                                    </h4>
                                    <ul className="space-y-2">
                                        {selectedUseCase.preconditions.map((pre, i) => (
                                            <li key={i} className="flex gap-2 text-xs text-[var(--text-secondary)]">
                                                <span className="text-orange-500">•</span>
                                                {pre}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>

                                {/* Postconditions */}
                                <GlassCard className="p-4 bg-white">
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Postcondiciones
                                    </h4>
                                    <ul className="space-y-2">
                                        {selectedUseCase.postconditions.map((post, i) => (
                                            <li key={i} className="flex gap-2 text-xs text-[var(--text-secondary)]">
                                                <span className="text-green-500">•</span>
                                                {post}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>

                                {/* Business Rules */}
                                <GlassCard className="p-4 bg-white">
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        Reglas de Negocio
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedUseCase.businessRules.map(rule => (
                                            <div key={rule.id} className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                                                <span className="text-[10px] font-bold text-blue-600 block mb-1">{rule.id}</span>
                                                <p className="text-xs text-slate-600">{rule.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>

                                {/* Exceptions */}
                                <GlassCard className="p-4 bg-white">
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        Excepciones
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedUseCase.exceptions.map((exc, i) => (
                                            <div key={i} className="flex flex-col gap-1 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                                <span className="text-xs font-bold text-slate-700">• {exc.condition}</span>
                                                <span className="text-[10px] text-gray-500 italic pl-3">↳ {exc.result}</span>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>

                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <Zap className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">Selecciona un Caso de Uso</h3>
                            <p className="text-gray-500 max-w-sm">Haz clic en un caso de uso de la lista izquierda para ver sus detalles completos.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProjectModuleLayout>
    );
};
