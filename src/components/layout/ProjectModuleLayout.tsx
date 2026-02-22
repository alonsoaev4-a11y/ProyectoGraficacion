import React from 'react';
import { motion } from 'framer-motion';


interface ProjectModuleLayoutProps {
    title: string;
    description: string;
    headerActions?: React.ReactNode;
    children: React.ReactNode;
    wizardTarget?: string;
    fullHeight?: boolean;
}

export const ProjectModuleLayout = ({
    title,
    description,
    headerActions,
    children,
    wizardTarget,
    fullHeight = false
}: ProjectModuleLayoutProps) => (
    <div className={`project-module-bg relative overflow-hidden ${fullHeight ? 'flex flex-col' : ''}`}>
        {/* Gradiente sutil de fondo */}
        <div className="cyber-gradient-overlay" />

        {/* Contenido principal */}
        <div className={`relative z-10 flex flex-col ${fullHeight ? 'h-full' : ''} p-6`}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8 shrink-0"
                data-wizard-target={wizardTarget}
            >
                <div>
                    <h1 className="text-4xl cyber-header mb-2">
                        {title}
                    </h1>
                    <p className="cyber-text-secondary text-lg max-w-2xl">{description}</p>
                </div>
                <div className="flex items-center gap-3">
                    {headerActions}
                </div>
            </motion.div>

            {/* Contenido dinámico */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={fullHeight ? 'flex-1 min-h-0 relative' : ''}
            >
                {children}
            </motion.div>
        </div >
    </div >
);
