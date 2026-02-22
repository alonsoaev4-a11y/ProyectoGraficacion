import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    wizardTarget?: string;
    onClick?: () => void;
}

export const GlassCard = ({
    children,
    className = '',
    hoverable = false,
    wizardTarget,
    onClick,
    ...props
}: GlassCardProps) => (
    <motion.div
        whileHover={hoverable ? { y: -4, scale: 1.01 } : undefined}
        onClick={onClick}
        data-wizard-target={wizardTarget}
        className={`
      cyber-card
      ${hoverable ? 'cursor-pointer' : ''}
      ${className}
    `}
        {...props}
    >
        {children}
    </motion.div>
);
