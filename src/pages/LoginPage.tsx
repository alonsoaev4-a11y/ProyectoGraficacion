import { useState } from "react"
import { Link } from "react-router-dom"
import { useSimulatedAuth } from "@/hooks/useSimulatedAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useSimulatedAuth()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simular delay de red
        login(email)
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
                <p className="text-[var(--text-secondary)] mt-2">
                    Ingresa tus credenciales para acceder a tu workspace
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                        type="email"
                        placeholder="nombre@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Contraseña</label>
                        <Link to="#" className="text-sm text-[var(--accent-cyan)] hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <Button
                    variant="neon"
                    className="w-full h-11 text-base mt-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Autenticando...
                        </>
                    ) : (
                        "Iniciar Sesión"
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-[var(--text-secondary)]">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-[var(--accent-cyan)] hover:underline">
                    Regístrate gratis
                </Link>
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] rounded-md border border-white/5 text-xs text-[var(--text-secondary)]">
                <p><strong>Credenciales Demo:</strong></p>
                <p>Email: cualquiera@test.com</p>
                <p>Pass: min 6 caracteres</p>
            </div>
        </div>
    )
}
