import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from './WizardProvider';
import { X } from 'lucide-react';
import { WizardOverlay } from './WizardOverlay';
import { WizardTooltip } from './WizardTooltip';

interface WizardButtonProps {
    mode?: 'fixed' | 'inline';
    showOverlay?: boolean;
}

export const WizardButton = ({ mode = 'fixed', showOverlay = true }: WizardButtonProps) => {
    const { isActive, toggleWizard, getCurrentStep } = useWizard();
    const currentStep = getCurrentStep();

    const fixedClasses = "fixed bottom-6 right-6 z-[9999] px-6 py-3 shadow-[0_0_25px_rgba(0,217,255,0.3)]";
    const inlineClasses = "relative z-20 px-4 py-2 text-sm";

    return (
        <>
            <motion.button
                onClick={toggleWizard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    rounded-full font-semibold transition-all duration-300
                    flex items-center gap-2
                    ${mode === 'fixed' ? fixedClasses : inlineClasses}
                    ${isActive
                        ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-purple-600 text-white border-none shadow-[0_0_20px_rgba(0,171,191,0.4)]'
                        : mode === 'fixed'
                            ? 'bg-white/90 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/50 hover:border-[var(--accent-cyan)] wizard-pulse shadow-lg'
                            : 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 hover:bg-[var(--accent-cyan)]/20 hover:border-[var(--accent-cyan)]/60'
                    }
                `}
            >
                <motion.span
                    animate={{ rotate: isActive ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                    className={mode === 'fixed' ? "text-lg" : "text-base"}
                >
                    {isActive ? <X className={mode === 'fixed' ? "w-5 h-5" : "w-4 h-4"} /> : "🧙"}
                </motion.span>

                {isActive ? 'Cerrar Guía' : 'Ayuda Wizard'}
            </motion.button>

            <style>{`
                @keyframes wizardPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(0, 217, 255, 0); }
                }
                .wizard-pulse {
                    animation: wizardPulse 3s ease-in-out infinite;
                }
            `}</style>

            <AnimatePresence>
                {isActive && currentStep && showOverlay && (
                    <>
                        <WizardOverlay />
                        <WizardTooltip />
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
