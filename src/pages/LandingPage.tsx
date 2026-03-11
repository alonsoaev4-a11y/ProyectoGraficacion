import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, ArrowRight, Code2, GitBranch, Database, Brain, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: <Brain size={24} />, title: 'Pipeline de IA', desc: 'Generación automática de código fuente con modelos de lenguaje de última generación (OpenRouter).', color: '#9d22e6' },
    { icon: <Code2 size={24} />, title: 'Low-Code / No-Code', desc: 'Captura requisitos, diseña casos de uso y modelos de datos visualmente sin escribir código.', color: '#00abbf' },
    { icon: <GitBranch size={24} />, title: 'Trazabilidad completa', desc: 'Cada requisito se traza hasta el código generado. Auditoria automática de todos los cambios.', color: '#e91e8c' },
    { icon: <Database size={24} />, title: 'Generación Angular + FastAPI', desc: 'Genera automáticamente componentes Angular, endpoints FastAPI y scripts MySQL listos para usar.', color: '#f59e0b' },
    { icon: <Shield size={24} />, title: 'Documentación automática', desc: '6 documentos Markdown descargables: arquitectura, BD, API, testing, despliegue y guía de usuario.', color: '#10b981' },
    { icon: <Zap size={24} />, title: 'ZIP descargable', desc: 'Descarga todo el proyecto generado (backend + frontend + base de datos + specs) en un solo clic.', color: '#6366f1' },
  ];

  const steps = [
    { num: '01', title: 'Captura tus requisitos', desc: 'Entrevistas, encuestas, historias de usuario, observación y análisis documental en un solo módulo estructurado.' },
    { num: '02', title: 'Diseña visualmente', desc: 'Modela casos de uso, diagramas de flujo y el esquema de base de datos con editores visuales interactivos.' },
    { num: '03', title: 'Genera código con IA', desc: 'El pipeline de IA en tiempo real lee tus specs y genera código Angular, FastAPI y MySQL funcional.' },
  ];

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(90deg,#00abbf,#9d22e6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          HERMAN
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/login" style={{ padding: '0.5rem 1.25rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500, borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.15s' }}>
            Iniciar sesión
          </Link>
          <Link to="/register" style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg,#00abbf,#9d22e6)', color: '#fff', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600, borderRadius: '0.5rem' }}>
            Comenzar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '8rem', paddingBottom: '5rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto', padding: '8rem 2rem 5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,171,191,0.1)', border: '1px solid rgba(0,171,191,0.2)', borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: '#00abbf', fontWeight: 600 }}>
          <Sparkles size={14} /> Plataforma Meta-CASE con IA
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
          De requisitos a código{' '}
          <span style={{ background: 'linear-gradient(90deg,#00abbf,#9d22e6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            automáticamente
          </span>
        </h1>
        <p style={{ fontSize: '1.1875rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Herman guía a tu equipo desde la captura de requisitos hasta la generación automática de código funcional con un pipeline de IA en tiempo real.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'linear-gradient(135deg,#00abbf,#9d22e6)', color: '#fff', textDecoration: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 700, boxShadow: '0 8px 30px rgba(0,171,191,0.3)' }}>
            Empezar ahora <ArrowRight size={18} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Todo lo que necesita tu equipo</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '3rem', fontSize: '1.0625rem' }}>Una plataforma completa para el ciclo de vida del software</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1.5rem', transition: 'border-color 0.2s' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '1rem' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>¿Cómo funciona?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem', fontSize: '1.0625rem' }}>Tres pasos para ir de la idea al código</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(90deg,#00abbf,#9d22e6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.75rem' }}>{s.num}</div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg,rgba(0,171,191,0.1),rgba(157,34,230,0.1))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '3rem 2rem' }}>
          <CheckCircle2 size={40} style={{ color: '#00abbf', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Listo para empezar</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Accede con cualquier email. No requiere configuración.</p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'linear-gradient(135deg,#00abbf,#9d22e6)', color: '#fff', textDecoration: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>
            Crear cuenta gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
        © 2026 Herman Platform — Meta-CASE / Low-Code / No-Code con IA
      </footer>
    </div>
  );
}
