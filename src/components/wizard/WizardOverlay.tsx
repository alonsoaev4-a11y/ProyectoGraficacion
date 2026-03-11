import { useWizard } from './WizardProvider';
import { HelpCircle, X } from 'lucide-react';

export function WizardOverlay() {
  const { isActive, currentStep, steps, totalSteps, stopWizard, nextStep, prevStep } = useWizard();
  if (!isActive) return null;

  const step = steps[currentStep];
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <>
      {/* Backdrop */}
      <div className="wizard-backdrop" onClick={stopWizard} />

      {/* Tooltip — centered since we don't have DOM targets */}
      <div className="wizard-tooltip" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <div className="wizard-tooltip-header">
          <span className="wizard-tooltip-step">Paso {currentStep + 1} de {totalSteps}</span>
          <button className="wizard-tooltip-close" onClick={stopWizard}><X size={12} /></button>
        </div>
        <div className="wizard-tooltip-title">{step.title}</div>
        <div className="wizard-tooltip-content">{step.content}</div>

        <div className="wizard-tooltip-progress">
          <div className="wizard-progress-dots">
            {Array.from({ length: Math.min(totalSteps, 10) }).map((_, i) => (
              <div key={i} className={`wizard-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`} />
            ))}
          </div>
        </div>

        <div className="wizard-tooltip-actions">
          <button className="wizard-btn-prev" onClick={stopWizard}>Saltar tour</button>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {currentStep > 0 && <button className="wizard-btn-prev" onClick={prevStep}>← Anterior</button>}
            {currentStep < totalSteps - 1
              ? <button className="wizard-btn-next" onClick={nextStep}>Siguiente →</button>
              : <button className="wizard-btn-finish" onClick={stopWizard}>¡Comenzar! 🚀</button>
            }
          </div>
        </div>
      </div>
    </>
  );
}

export function WizardButton() {
  const { startWizard, isActive } = useWizard();
  if (isActive) return null;
  return (
    <button className="wizard-floating-btn" onClick={() => startWizard()} title="Tour de onboarding">
      <HelpCircle size={20} />
    </button>
  );
}
