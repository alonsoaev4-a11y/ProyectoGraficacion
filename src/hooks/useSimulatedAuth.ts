import { useState, useCallback, useEffect } from 'react';
import { authApi, AuthUser } from '../lib/api';

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

export function useSimulatedAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('herman_token');
    const storedUser = localStorage.getItem('herman_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authApi.me()
          .then(u => setUser(u))
          .catch(() => {
            localStorage.removeItem('herman_token');
            localStorage.removeItem('herman_user');
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      } catch {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('herman_token', res.access_token);
      localStorage.setItem('herman_user', JSON.stringify(res.user));
      setUser(res.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register(email, password, name);
      localStorage.setItem('herman_token', res.access_token);
      localStorage.setItem('herman_user', JSON.stringify(res.user));
      setUser(res.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('herman_token');
    localStorage.removeItem('herman_user');
    setUser(null);
  }, []);

  return {
    isAuthenticated: !!user,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
