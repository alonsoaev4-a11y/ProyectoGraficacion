import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types here or import if they exist elsewhere. 
// For simplicity and avoiding circular deps, we can define them here or in a types file.
// The existing project seems to have them in wizardSteps.ts, but let's be robust.

export interface WizardStep {
    id: string;
    title: string;
    description: string;
    example?: string;
    targetSelector: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    spotlightPadding?: number; // Padding del spotlight (default: 8px)
    action?: () => void; // Acción opcional al llegar al paso
    validation?: () => boolean; // Validar antes de continuar
}

export interface WizardConfig {
    module: string;
    steps: WizardStep[];
    autoStart?: boolean;
    showProgress?: boolean;
}

interface WizardContextType {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    currentModule: string;
    toggleWizard: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipWizard: () => void;
    resetWizard: () => void;
    loadModule: (config: WizardConfig) => void;
    getCurrentStep: () => WizardStep | null;
    completedModules: string[];
}

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [config, setConfig] = useState<WizardConfig | null>(null);
    const [completedModules, setCompletedModules] = useState<string[]>([]);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Cargar progreso de localStorage
        const saved = localStorage.getItem('herman_wizard_progress');
        if (saved) {
            try {
                setCompletedModules(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing wizard progress:", e);
            }
        }
    }, []);

    const loadModule = (newConfig: WizardConfig) => {
        if (!newConfig || !newConfig.module) {
            console.warn('WizardProvider: loadModule recibió una config inválida, ignorando.');
            return;
        }
        // Si ya está cargado este módulo, no reiniciamos a menos que sea explícito
        if (config?.module === newConfig.module) {
            return;
        }

        setConfig(newConfig);
        setCurrentStep(0);

        // Auto-start si es primera vez
        if (newConfig.autoStart && !completedModules.includes(newConfig.module)) {
            setIsActive(true);
        }
    };

    const nextStep = () => {
        if (!config) return;

        const step = config.steps[currentStep];
        if (step.validation && !step.validation()) {
            // Aquí podríamos integrar un sistema de notificaciones (toast)
            alert('Por favor completa este paso antes de continuar.');
            return;
        }

        // Ejecutar acción del paso si existe
        if (step.action) {
            step.action();
        }

        if (currentStep < config.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Último paso - marcar como completado
            const updated = [...completedModules, config.module];
            // Remove duplicates just in case
            const uniqueUpdated = Array.from(new Set(updated));
            setCompletedModules(uniqueUpdated);
            localStorage.setItem('herman_wizard_progress', JSON.stringify(uniqueUpdated));
            setIsActive(false);
            // Mostrar toast de celebración
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const skipWizard = () => {
        if (!config) {
            setIsActive(false);
            return;
        }
        // Marcar como visto aunque se haya saltado? O solo cerrar?
        // El usuario pidió "persista progreso", asumimos que skip = hecho para no molestar de nuevo
        const updated = [...completedModules, config.module];
        const uniqueUpdated = Array.from(new Set(updated));
        setCompletedModules(uniqueUpdated);
        localStorage.setItem('herman_wizard_progress', JSON.stringify(uniqueUpdated));
        setIsActive(false);
    };

    const resetWizard = () => {
        setCurrentStep(0);
        setIsActive(true);
    };

    return (
        <WizardContext.Provider value={{
            isActive,
            currentStep,
            totalSteps: config?.steps.length || 0,
            currentModule: config?.module || '',
            toggleWizard: () => setIsActive(!isActive),
            nextStep,
            prevStep,
            skipWizard,
            resetWizard,
            loadModule,
            getCurrentStep: () => config?.steps[currentStep] || null,
            completedModules
        }}>
            {children}

            {/* Toast de celebración */}
            {showToast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 99999,
                        background: 'linear-gradient(135deg, rgba(0,217,255,0.15), rgba(168,85,247,0.15))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0,217,255,0.3)',
                        borderRadius: '1rem',
                        padding: '1rem 2rem',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        boxShadow: '0 0 30px rgba(0,217,255,0.2), 0 10px 40px rgba(0,0,0,0.4)',
                        animation: 'wizardToastIn 0.4s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🎉</span>
                    ¡Tutorial completado! Ya dominas este módulo.
                </div>
            )}

            {/* Toast animation keyframes */}
            <style>{`
                @keyframes wizardToastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </WizardContext.Provider>
    );
}

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
};
