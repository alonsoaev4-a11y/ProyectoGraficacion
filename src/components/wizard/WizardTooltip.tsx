import { motion } from 'framer-motion';
import { useWizard } from './WizardProvider';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export const WizardTooltip = () => {
    const { getCurrentStep, currentStep, totalSteps, nextStep, prevStep, skipWizard, isActive } = useWizard();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const step = getCurrentStep();

    useEffect(() => {
        if (!step || !isActive) return;

        const findElement = (selector: string): Element | null => {
            try {
                const el = document.querySelector(selector);
                if (el) return el;
            } catch { /* invalid selector */ }

            const parts = selector.split(',').map(s => s.trim());
            for (const part of parts) {
                try {
                    const el = document.querySelector(part);
                    if (el) return el;
                } catch { /* skip invalid */ }
            }
            return null;
        };

        const updateRect = () => {
            const element = findElement(step.targetSelector);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            } else {
                // Fallback: center of viewport
                setTargetRect(new DOMRect(
                    window.innerWidth / 2 - 150,
                    window.innerHeight / 2 - 50,
                    300,
                    100
                ));
            }
        };

        updateRect();
        const timer = setTimeout(updateRect, 100);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [step, isActive]);

    if (!step || !targetRect) return null;

    // Calcular posición
    const gap = 16;
    let style: React.CSSProperties = {};
    let arrowClass = '';

    // Lógica básica de posicionamiento
    switch (step.position) {
        case 'top':
            style = {
                top: targetRect.top - gap,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translate(-50%, -100%)'
            };
            arrowClass = 'bottom-[-8px] left-1/2 -translate-x-1/2 rotate-45 border-r border-b';
            break;
        case 'bottom':
            style = {
                top: targetRect.bottom + gap,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translate(-50%, 0)'
            };
            arrowClass = 'top-[-8px] left-1/2 -translate-x-1/2 rotate-45 border-l border-t';
            break;
        case 'left':
            style = {
                top: targetRect.top + (targetRect.height / 2),
                left: targetRect.left - gap,
                transform: 'translate(-100%, -50%)'
            };
            arrowClass = 'right-[-8px] top-1/2 -translate-y-1/2 rotate-45 border-r border-t';
            break;
        case 'right':
            style = {
                top: targetRect.top + (targetRect.height / 2),
                left: targetRect.right + gap,
                transform: 'translate(0, -50%)'
            };
            arrowClass = 'left-[-8px] top-1/2 -translate-y-1/2 rotate-45 border-l border-b';
            break;
        default:
            // Fallback to center if undefined
            style = {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 pointer-events-auto"
            style={style}
        >
            <div className="bg-white/95 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-[0_20px_60px_rgba(0,171,191,0.15)] max-w-md min-w-[340px] relative overflow-hidden">
                {/* Flecha decorativa */}
                <div className={`absolute w-4 h-4 bg-white border-cyan-500/20 ${arrowClass}`} />

                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1 rounded-full border border-gray-200">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                        <span className="text-cyan-600 text-xs font-mono font-bold tracking-wider">
                            PASO {currentStep + 1} / {totalSteps}
                        </span>
                    </div>
                    <button
                        onClick={skipWizard}
                        className="text-gray-400 hover:text-gray-700 transition-colors text-xs font-medium px-2 py-1 hover:bg-gray-100 rounded"
                    >
                        [SALTAR]
                    </button>
                </div>

                {/* Progreso */}
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-5 relative z-10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 box-shadow-[0_0_10px_rgba(0,171,191,0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    />
                </div>

                {/* Contenido */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 tracking-tight">
                    {step.title}
                </h3>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed relative z-10 font-light">
                    {step.description}
                </p>

                {/* Ejemplo opcional */}
                {step.example && (
                    <div className="bg-gray-50 border-l-2 border-cyan-500 p-3 mb-5 relative z-10 rounded-r-lg">
                        <p className="text-[10px] text-cyan-600 mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="text-lg leading-none">💡</span> Ejemplo
                        </p>
                        <code className="text-xs text-gray-700 font-mono block whitespace-pre-wrap leading-relaxed pl-1">
                            {step.example}
                        </code>
                    </div>
                )}

                {/* Navegación */}
                <div className="flex gap-3 relative z-10 pt-2 border-t border-gray-100">
                    {currentStep > 0 ? (
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Anterior
                        </button>
                    ) : (
                        <div className="flex-1" /> // Spacer
                    )}

                    <button
                        onClick={nextStep}
                        className="ml-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:brightness-110 transition-all text-sm group"
                    >
                        {/* El texto del botón se mantiene blanco para contraste con el gradiente */}
                        {currentStep === totalSteps - 1 ? (
                            <>
                                Finalizar <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </>
                        ) : (
                            <>
                                Siguiente <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
