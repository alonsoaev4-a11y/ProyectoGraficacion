import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

interface WizardStep {
  id: string;
  module: string;
  title: string;
  content: string;
  target?: string;
}

interface WizardContextType {
  isActive: boolean;
  currentStep: number;
  steps: WizardStep[];
  totalSteps: number;
  startWizard: (module?: string) => void;
  stopWizard: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (n: number) => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

const WIZARD_STEPS: WizardStep[] = [
  { id: 'welcome', module: 'dashboard', title: '¡Bienvenido a Herman! 👋', content: 'Esta es tu plataforma Meta-CASE/Low-Code/No-Code. Te guiaré a través de los módulos principales para que seas productivo de inmediato.', target: '' },
  { id: 'dash-create', module: 'dashboard', title: 'Crear proyecto', content: 'Haz clic en el botón "+ Crear nuevo proyecto" para comenzar. Necesitarás nombre, descripción y el tipo de app.', target: '' },
  { id: 'dash-grid', module: 'dashboard', title: 'Tus proyectos', content: 'Aquí verás todos tus proyectos con barra de progreso, acciones rápidas (exportar, eliminar) y filtros de búsqueda.', target: '' },
  { id: 'metadatos-info', module: 'metadatos', title: 'Módulo: Metadatos', content: 'El primer módulo es Información General. Define el nombre, descripción, tipo de app e industria de tu proyecto.', target: '' },
  { id: 'metadatos-metodos', module: 'metadatos', title: 'Métodos de recolección', content: 'Selecciona cómo levantarás los requisitos: entrevistas, encuestas, historias de usuario, observación o análisis documental.', target: '' },
  { id: 'requisitos-create', module: 'requisitos', title: 'Módulo: Requisitos', content: 'Captura los requisitos funcionales y no funcionales. Puedes filtrar por prioridad, estado y exportar a CSV.', target: '' },
  { id: 'casosuso', module: 'casosUso', title: 'Módulo: Casos de Uso', content: 'Modela los casos de uso con flujos, actores, precondiciones y reglas de negocio. Los datos aquí alimentan automáticamente el Diagrama de Flujo.', target: '' },
  { id: 'flujo', module: 'diagramaFlujo', title: 'Módulo: Diagrama de Flujo', content: 'Editor visual de flujos SVG. Los nodos se auto-generan desde el primer Caso de Uso disponible. Puedes arrastrar y conectar nodos.', target: '' },
  { id: 'modelado', module: 'modelado', title: 'Módulo: Modelado de Datos', content: 'Diseña tu esquema de base de datos visualmente. Genera schema Prisma y DDL SQL automáticamente.', target: '' },
  { id: 'panelia', module: 'generacion', title: '¡Pipeline de IA! 🤖', content: 'El módulo PanelIA conecta con OpenRouter para generar código Angular, FastAPI y MySQL en tiempo real usando WebSocket. ¡La parte principal de Herman!', target: '' },
  { id: 'generacion', module: 'generacion', title: 'Módulo: Generación', content: 'Descarga el proyecto completo como ZIP con carpetas backend, frontend, database y specs, más un LEEME con instrucciones.', target: '' },
  { id: 'auditoria', module: 'auditoria', title: 'Módulo: Auditoría', content: 'Registro de todos los cambios del proyecto con trazabilidad completa. Filtros por tipo de acción y paginación.', target: '' },
  { id: 'finish', module: 'dashboard', title: '¡Listo para crear! 🚀', content: 'Ya conoces todos los módulos. Recuerda que el wizard siempre estará disponible con el botón "?" en la esquina inferior derecha. ¡Mucho éxito!', target: '' },
];

export function WizardProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps] = useState(WIZARD_STEPS);

  useEffect(() => {
    const done = localStorage.getItem('herman_wizard_done');
    if (!done) {
      // First time: offer wizard
      const timer = setTimeout(() => setIsActive(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startWizard = useCallback((module?: string) => {
    if (module) {
      const idx = steps.findIndex(s => s.module === module);
      setCurrentStep(idx >= 0 ? idx : 0);
    } else {
      setCurrentStep(0);
    }
    setIsActive(true);
  }, [steps]);

  const stopWizard = useCallback(() => {
    setIsActive(false);
    localStorage.setItem('herman_wizard_done', 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
    else stopWizard();
  }, [currentStep, steps.length, stopWizard]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  }, [currentStep]);

  const goToStep = useCallback((n: number) => {
    if (n >= 0 && n < steps.length) setCurrentStep(n);
  }, [steps.length]);

  return (
    <WizardContext.Provider value={{ isActive, currentStep, steps, totalSteps: steps.length, startWizard, stopWizard, nextStep, prevStep, goToStep }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextType {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}
