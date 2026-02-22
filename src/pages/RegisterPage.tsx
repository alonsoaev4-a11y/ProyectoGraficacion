import { useState } from "react"
import { Link } from "react-router-dom"
import { useSimulatedAuth } from "@/hooks/useSimulatedAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useSimulatedAuth()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden")
            return
        }

        setIsLoading(true)
        // Simular registro y login automático
        login(formData.email)
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Crear Cuenta</h1>
                <p className="text-[var(--text-secondary)] mt-2">
                    Comienza a construir software en minutos
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre Completo</label>
                    <Input
                        name="name"
                        placeholder="Juan Pérez"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                        name="email"
                        type="email"
                        placeholder="nombre@empresa.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contraseña</label>
                        <Input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirmar</label>
                        <Input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="terms" className="rounded border-white/10 bg-black/20" required />
                    <label htmlFor="terms" className="text-sm text-[var(--text-secondary)]">
                        Acepto los <Link to="#" className="text-[var(--accent-cyan)] hover:underline">términos y condiciones</Link>
                    </label>
                </div>

                <Button
                    variant="neon-purple"
                    className="w-full h-11 text-base mt-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando cuenta...
                        </>
                    ) : (
                        "Crear Cuenta"
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-[var(--text-secondary)]">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="text-[var(--accent-cyan)] hover:underline">
                    Inicia sesión
                </Link>
            </div>
        </div>
    )
}
