import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from './WizardProvider';

export const WizardOverlay = () => {
    const { isActive, getCurrentStep } = useWizard();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const findElement = (selector: string): Element | null => {
            // Try the full selector first
            try {
                const el = document.querySelector(selector);
                if (el) return el;
            } catch { /* invalid selector */ }

            // If comma-separated, try each part
            const parts = selector.split(',').map(s => s.trim());
            for (const part of parts) {
                try {
                    const el = document.querySelector(part);
                    if (el) return el;
                } catch { /* skip invalid */ }
            }
            return null;
        };

        const updateTarget = () => {
            const step = getCurrentStep();
            if (!step) return;

            const element = findElement(step.targetSelector);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
                element.classList.add('wizard-highlighted');
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            } else {
                // Fallback: center of viewport so overlay still shows
                const fallback = new DOMRect(
                    window.innerWidth / 2 - 150,
                    window.innerHeight / 2 - 50,
                    300,
                    100
                );
                setTargetRect(fallback);
            }
        };

        updateTarget();
        const timer = setTimeout(updateTarget, 300);

        window.addEventListener('resize', updateTarget);
        window.addEventListener('scroll', updateTarget, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateTarget);
            window.removeEventListener('scroll', updateTarget, true);
            document.querySelectorAll('.wizard-highlighted').forEach(el =>
                el.classList.remove('wizard-highlighted')
            );
        };
    }, [isActive, getCurrentStep]);

    if (!isActive || !targetRect) return null;

    const step = getCurrentStep()!;
    const padding = step.spotlightPadding || 8;

    return (
        <>
            {/* Overlay oscuro con cutout simulado usando borders gigantes */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed z-40 pointer-events-none transition-all duration-300 ease-out"
                style={{
                    top: targetRect.top - padding,
                    left: targetRect.left - padding,
                    width: targetRect.width + (padding * 2),
                    height: targetRect.height + (padding * 2),
                    boxShadow: '0 0 0 9999px rgba(255, 255, 255, 0.85)',
                    borderRadius: '12px',
                }}
            />

            {/* Spotlight Glow Border */}
            <motion.div
                layoutId="wizard-spotlight"
                className="fixed z-40 pointer-events-none"
                initial={false}
                animate={{
                    top: targetRect.top - padding,
                    left: targetRect.left - padding,
                    width: targetRect.width + (padding * 2),
                    height: targetRect.height + (padding * 2),
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    boxShadow: `
                        0 0 0 2px #00d9ff,
                        0 0 20px 8px rgba(0, 217, 255, 0.4),
                        0 0 40px 12px rgba(0, 217, 255, 0.2)
                    `,
                    borderRadius: '12px',
                    animation: 'wizardSpotlight 2s infinite ease-in-out'
                }}
            />
            <style>{`
                @keyframes wizardSpotlight {
                    0%, 100% {
                        box-shadow: 0 0 0 3px #00d9ff,
                                    0 0 20px rgba(0,217,255,0.5),
                                    0 0 40px rgba(0,217,255,0.3);
                    }
                    50% {
                        box-shadow: 0 0 0 5px #00d9ff,
                                    0 0 30px rgba(0,217,255,0.8),
                                    0 0 60px rgba(0,217,255,0.5);
                    }
                }
            `}</style>
        </>
    );
};
