import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!name.trim()) return setLocalError('El nombre es requerido');
    if (!email) return setLocalError('El email es requerido');
    if (password.length < 6) return setLocalError('La contraseña debe tener al menos 6 caracteres');
    const ok = await register(email, password, name);
    if (ok) navigate('/dashboard', { replace: true });
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    backdropFilter: 'blur(20px)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.5rem', color: '#ffffff', fontSize: '0.9375rem',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 500,
    color: 'rgba(255,255,255,0.7)', marginBottom: '0.375rem',
  };

  return (
    <AuthLayout>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Crear cuenta
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem' }}>
            Únete a la plataforma Herman
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} />
          </div>

          {(localError || error) && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: '#fca5a5', fontSize: '0.875rem' }}>
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '0.75rem',
              background: 'linear-gradient(135deg, #00abbf, #9d22e6)',
              border: 'none', borderRadius: '0.5rem',
              color: '#ffffff', fontSize: '0.9375rem', fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1, marginTop: '0.5rem',
            }}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#00abbf', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
