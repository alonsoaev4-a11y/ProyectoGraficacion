import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const WizardSpotlight = ({ targetSelector }: { targetSelector: string }) => {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const updateRect = () => {
            const element = document.querySelector(targetSelector);
            if (element) {
                setRect(element.getBoundingClientRect());
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [targetSelector]);

    if (!rect) return null;

    return (
        <motion.div
            layoutId="wizard-spotlight"
            className="fixed z-50 pointer-events-none border-2 border-[var(--accent-cyan)] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
            initial={false}
            animate={{
                top: rect.top - 8,
                left: rect.left - 8,
                width: rect.width + 16,
                height: rect.height + 16,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            style={{
                boxShadow: '0 0 0 4px rgba(0, 217, 255, 0.3), 0 0 0 9999px rgba(0,0,0,0.6)'
            }}
        />
    );
};
