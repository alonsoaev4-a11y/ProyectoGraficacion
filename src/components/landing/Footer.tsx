import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[var(--bg-primary)] border-t border-white/5 text-[var(--text-secondary)]">
            <div className="container px-4 py-12 mx-auto">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Herman Platform</h3>
                        <p className="text-sm max-w-xs">
                            Construye el futuro del software. Plataforma de ingeniería asistida por inteligencia y automatización.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Producto</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Características</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Integraciones</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Precios</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Recursos</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Documentación</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Comunidad</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Privacidad</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Términos</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-cyan)] transition-colors">Seguridad</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm">
                        © 2026 Herman Platform. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-[var(--text-primary)] transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-[var(--text-primary)] transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-[var(--text-primary)] transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>

                    <div className="flex items-center text-sm gap-1">
                        Build with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Herman Team
                    </div>
                </div>
            </div>
        </footer>
    );
}
