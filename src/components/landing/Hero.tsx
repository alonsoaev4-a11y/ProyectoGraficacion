import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-purple)]/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--accent-cyan)]/20 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            <div className="container relative z-10 px-4 py-32 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-[var(--accent-cyan)] uppercase bg-[var(--accent-cyan)]/10 rounded-full border border-[var(--accent-cyan)]/20 backdrop-blur-sm">
                        Herman Platform v1.0
                    </span>

                    <h1 className="max-w-4xl mx-auto mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
                        <span className="block text-[var(--text-primary)]">Construye Software</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)]">
                            Sin Escribir Código
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto mb-10 text-xl text-[var(--text-secondary)]">
                        Herman transpila diagramas visuales a aplicaciones full-stack listas para producción.
                        <span className="text-[var(--text-primary)] font-mono ml-2">TypeScript. Prisma. Next.js.</span>
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            variant="neon"
                            className="text-lg h-14 px-8 min-w-[200px]"
                            onClick={() => navigate('/register')}
                        >
                            Empezar Gratis
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>

                        <Button
                            size="lg"
                            variant="ghost"
                            className="text-lg h-14 px-8 text-[var(--text-primary)] hover:bg-white/5"
                            onClick={() => {
                                document.getElementById('mini-demo')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Play className="mr-2 w-5 h-5" />
                            Ver Demo
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
