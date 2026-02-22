import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { WizardProvider } from '@/components/wizard/WizardProvider';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import EquiposPage from '@/pages/EquiposPage';
import ConfiguracionPage from '@/pages/ConfiguracionPage';

// New Project Modules
import { RequisitosPage } from '@/pages/project/RequisitosPage';
import { ModeladoPage } from '@/pages/project/ModeladoPage';
import { CasosUsoPage } from '@/pages/project/CasosUsoPage';
import { DiagramaFlujoPage } from '@/pages/project/DiagramaFlujoPage';
import { GeneracionPage } from '@/pages/project/GeneracionPage';
import { AuditoriaPage } from '@/pages/project/AuditoriaPage';
import { MetadatosPage } from '@/pages/metadatos/MetadatosPage';

import AuthLayout from '@/components/auth/AuthLayout';
import { useSimulatedAuth } from '@/hooks/useSimulatedAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSimulatedAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Component helper to handle navigation state sync
const DashboardRoutes = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync state with URL on mount/change
  useEffect(() => {
    const path = location.pathname.substring(1); // remove leading slash
    if (path) {
      if (path.includes('requisitos')) setActiveModule('requisitos');
      else if (path.includes('modelado')) setActiveModule('modelado');
      else if (path.includes('casos-uso')) setActiveModule('casos-uso');
      else if (path.includes('diagrama-flujo')) setActiveModule('diagrama-flujo');
      else if (path.includes('generacion')) setActiveModule('generacion');
      else if (path.includes('auditoria')) setActiveModule('auditoria');
      else if (path.includes('equipos')) setActiveModule('team');
      else if (path.includes('configuracion')) setActiveModule('settings');
      else if (path.includes('metadatos')) setActiveModule('metadatos');
      else setActiveModule('dashboard');
    }
  }, [location]);

  // Handle sidebar navigation
  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    switch (module) {
      case 'dashboard': navigate('/dashboard'); break;
      case 'team': navigate('/equipos'); break;
      case 'settings': navigate('/configuracion'); break;
      case 'requisitos': navigate('/requisitos'); break;
      case 'modelado': navigate('/modelado'); break;
      case 'casos-uso': navigate('/casos-uso'); break;
      case 'diagrama-flujo': navigate('/diagrama-flujo'); break;
      case 'generacion': navigate('/generacion'); break;
      case 'auditoria': navigate('/auditoria'); break;
      case 'metadatos': navigate('/metadatos'); break;
      case 'projects': navigate('/dashboard'); break; // Fallback for now
      default: navigate('/dashboard');
    }
  };

  return (
    <WizardProvider>
      <DashboardLayout activeModule={activeModule} setActiveModule={handleModuleChange}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/equipos" element={<EquiposPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />

          {/* Project Modules */}
          <Route path="/requisitos" element={<RequisitosPage />} />
          <Route path="/modelado" element={<ModeladoPage />} />
          <Route path="/casos-uso" element={<CasosUsoPage />} />
          <Route path="/diagrama-flujo" element={<DiagramaFlujoPage />} />
          <Route path="/generacion" element={<GeneracionPage />} />
          <Route path="/auditoria" element={<AuditoriaPage />} />
          <Route path="/metadatos" element={<MetadatosPage />} />
        </Routes>
      </DashboardLayout>
    </WizardProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}