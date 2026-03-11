import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WizardProvider } from '@/components/wizard/WizardProvider';
import { WizardOverlay, WizardButton } from '@/components/wizard/WizardOverlay';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import EquiposPage from '@/pages/EquiposPage';
import ConfiguracionPage from '@/pages/ConfiguracionPage';
import { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/equipos" element={<ProtectedRoute><EquiposPage /></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute><ConfiguracionPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <WizardOverlay />
      <WizardButton />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WizardProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
          <AppRoutes />
        </BrowserRouter>
      </WizardProvider>
    </AuthProvider>
  );
}