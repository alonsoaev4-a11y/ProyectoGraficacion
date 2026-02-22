import { Link, Outlet } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-[var(--bg-secondary)] relative items-center justify-center overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-purple)]/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-cyan)]/20 rounded-full blur-[128px]" />

                <div className="relative z-10 text-center p-12">
                    <h2 className="text-4xl font-bold mb-6">Bienvenido al Futuro</h2>
                    <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto">
                        Únete a miles de desarrolladores que construyen software 10x más rápido con Herman.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
                <div className="absolute top-8 left-8">
                    <Link to="/" className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
