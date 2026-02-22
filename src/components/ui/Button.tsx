import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    icon?: React.ReactNode;
    wizardTarget?: string;
}

export const Button = ({
    children,
    variant = 'primary',
    icon,
    wizardTarget,
    className = '',
    ...props
}: ButtonProps) => {
    const variants = {
        primary: 'cyber-btn-primary',
        secondary: 'cyber-btn-secondary',
        danger: 'cyber-btn-danger',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] border-none',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border-none'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-wizard-target={wizardTarget}
            className={`
        flex items-center justify-center gap-2
        px-5 py-2.5 rounded-lg
        font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {icon}
            {children}
        </motion.button>
    );
};
