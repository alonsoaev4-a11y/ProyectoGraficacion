import { Card } from "@/components/ui/Card"
import { motion } from "framer-motion"

const testimonials = [
    {
        quote: "Prototipé un SaaS completo en 2 horas. Herman no solo genera código, genera código bueno.",
        author: "Elena R.",
        role: "Senior Full Stack Dev",
        company: "TechFlow"
    },
    {
        quote: "Eliminamos 3 semanas de desarrollo backend. El sistema de migraciones es magia pura.",
        author: "Marc J.",
        role: "CTO",
        company: "StartUp Inc"
    },
    {
        quote: "La generación de tipos de TypeScript es impecable. Nunca más errores de runtime tontos.",
        author: "Sarah L.",
        role: "Frontend Lead",
        company: "BigCorp"
    }
]

export function Testimonials() {
    return (
        <section className="py-24 bg-[var(--bg-primary)] border-t border-white/5">
            <div className="container px-4 mx-auto">
                <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-16">
                    Lo que dicen los desarrolladores
                </h2>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                        >
                            <Card className="h-full p-8 border border-white/5 bg-[var(--bg-secondary)] hover:border-[var(--accent-purple)]/30 transition-colors">
                                <div className="flex flex-col h-full justify-between">
                                    <p className="text-lg text-[var(--text-secondary)] italic mb-6">"{t.quote}"</p>
                                    <div>
                                        <p className="font-semibold text-[var(--text-primary)]">{t.author}</p>
                                        <p className="text-sm text-[var(--accent-cyan)]">{t.role} @ {t.company}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
