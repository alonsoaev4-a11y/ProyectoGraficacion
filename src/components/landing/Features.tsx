import { motion } from "framer-motion"
import { Database, Code, Server, Shield, Box, Zap, TestTube, Book, Rocket } from "lucide-react"

const features = [
    {
        icon: Database,
        title: "Modelador de Datos Visual",
        description: "Diseña esquemas complejos con drag & drop. Soporte real para relaciones y tipos avanzados."
    },
    {
        icon: Code,
        title: "Transpilación Automática",
        description: "Convierte tus diagramas a código TypeScript limpio y mantenible en tiempo real."
    },
    {
        icon: Server,
        title: "Generación de API REST",
        description: "Endpoints seguros y optimizados generados automáticamente desde tus casos de uso."
    },
    {
        icon: Shield,
        title: "Seguridad by Design",
        description: "Validación Zod, autenticación y autorización integradas desde el primer momento."
    },
    {
        icon: Box,
        title: "Migraciones Inteligentes",
        description: "Sistema de diffing que genera migraciones SQL seguras sin pérdida de datos."
    },
    {
        icon: Zap,
        title: "Preview en Tiempo Real",
        description: "Visualiza los cambios instantáneamente en un entorno sandbox aislado."
    },
    {
        icon: TestTube,
        title: "Tests Automáticos",
        description: "Suites de pruebas unitarias y de integración generadas junto con tu código."
    },
    {
        icon: Book,
        title: "Docs Auto-generada",
        description: "Documentación OpenAPI (Swagger) y diagramas actualizados automáticamente."
    },
    {
        icon: Rocket,
        title: "Deploy con un Click",
        description: "Infraestructura como código (IaC) para desplegar en AWS, Vercel o Docker."
    }
]

export function Features() {
    return (
        <section className="py-24 bg-[var(--bg-secondary)] relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl mb-4">
                        Todo lo que necesitas para escalar
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)]">
                        Herman no es solo un diagramador. Es una suite completa de ingeniería de software automatizada.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="p-8 rounded-2xl bg-[var(--bg-primary)] border border-white/5 hover:border-[var(--accent-cyan)]/50 transition-colors group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 mb-6 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center border border-white/10 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all duration-300">
                                    <feature.icon className="w-6 h-6 text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)]" />
                                </div>

                                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-cyan)] transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
