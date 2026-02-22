import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function Header() {
    const navigate = useNavigate();

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-transparent backdrop-blur-md border-b border-white/5"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-black border border-white/20">
                    H
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Herman
                </span>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" className="text-sm" onClick={() => navigate('/login')}>
                    Iniciar Sesión
                </Button>
                <Button variant="primary" className="text-sm shadow-none" onClick={() => navigate('/register')}>
                    Registrarse
                </Button>
            </div>
        </motion.header>
    );
}
