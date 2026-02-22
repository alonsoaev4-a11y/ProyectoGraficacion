import { motion } from "framer-motion"

const steps = [
    {
        id: "01",
        title: "Diseña tu Modelo",
        description: "Define tus entidades, relaciones y reglas de negocio visualmente.",
        color: "var(--accent-cyan)"
    },
    {
        id: "02",
        title: "Define la Lógica",
        description: "Construye flujos de casos de uso y lógica compleja sin código.",
        color: "var(--accent-purple)"
    },
    {
        id: "03",
        title: "Genera & Despliega",
        description: "Obtén código limpio, testeado y listo para producción en segundos.",
        color: "var(--accent-green)"
    }
]

export function HowItWorks() {
    return (
        <section className="py-24 bg-[var(--bg-primary)] relative">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl mb-4">
                        Del concepto al código en minutos
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)]">
                        Un flujo de trabajo optimizado para desarrolladores y arquitectos.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--accent-purple)] to-transparent hidden lg:block" />

                    <div className="space-y-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                    }`}
                            >
                                {/* Text Content */}
                                <div className="flex-1 text-center lg:text-right">
                                    <div className={`flex flex-col ${index % 2 === 1 ? 'lg:items-start lg:text-left' : 'lg:items-end lg:text-right'}`}>
                                        <span
                                            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent mb-4"
                                            style={{ WebkitTextStroke: `1px ${step.color}` }}
                                        >
                                            {step.id}
                                        </span>
                                        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{step.title}</h3>
                                        <p className="text-[var(--text-secondary)] max-w-md">{step.description}</p>
                                    </div>
                                </div>

                                {/* Center Point */}
                                <div className="relative z-10 hidden lg:block">
                                    <div
                                        className="w-12 h-12 rounded-full border-4 border-[var(--bg-primary)] shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center"
                                        style={{ backgroundColor: step.color }}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>

                                {/* Visual Placeholder */}
                                <div className="flex-1 w-full">
                                    <div
                                        className="aspect-video rounded-xl bg-[var(--bg-secondary)] border border-white/10 relative overflow-hidden group shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)]/50 font-mono text-sm">
                                            [ Interface Preview: {step.title} ]
                                        </div>
                                        {/* Glow effect on hover */}
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                                            style={{ background: `radial-gradient(circle at center, ${step.color}, transparent 70%)` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
