// SeccionMetodo — wrapper que muestra overlay cuando el método está desactivado
// Permite al usuario ver la estructura del formulario antes de activar cada método

import { ReactNode } from 'react';
import { Lock } from 'lucide-react';

interface SeccionMetodoProps {
    activo: boolean;
    nombreMetodo: string;
    children: ReactNode;
}

export const SeccionMetodo = ({ activo, nombreMetodo, children }: SeccionMetodoProps) => {
    return (
        <div className="meta-section-wrapper">
            {/* El contenido siempre está en el DOM (para SEO y accesibilidad) */}
            <div style={{ opacity: activo ? 1 : 0.4, pointerEvents: activo ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
                {children}
            </div>

            {/* Overlay de disabled — solo visible si el método está inactivo */}
            {!activo && (
                <div className="meta-section-disabled-overlay">
                    <Lock size={22} color="#9090b0" />
                    <p>Activa <strong>{nombreMetodo}</strong> en la Sección 2 para editar esta sección</p>
                </div>
            )}
        </div>
    );
};
