'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '../../components/GlassCard';
import { Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        // Le cookie est maintenant géré côté serveur par l'API (httpOnly)
        router.push('/admin/dashboard');
      } else {
        const errData = await res.json();
        setError(`Erreur d'authentification : ${errData.errors?.[0]?.message || res.status}`);
      }
    } catch (err) {
      setError(`Erreur technique : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          reset_url: `${window.location.origin}/admin/reset-password`
        })
      });
      if (res.ok) {
        setForgotSent(true);
      } else {
        setError('Une erreur est survenue lors de la demande.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, var(--primary-color-light), transparent), radial-gradient(circle at bottom left, rgba(var(--primary-rgb), 0.1), transparent)',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ color: 'var(--secondary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>Administration</h1>
          <p style={{ color: 'var(--text-light)' }}>Espace de gestion URBATEAM</p>
        </div>

        <GlassCard style={{ padding: '3rem' }}>
          {!showForgot ? (
            <form onSubmit={handleLogin}>
              {error && (
                <div style={{ 
                  backgroundColor: '#fee2e2', 
                  color: '#b91c1c', 
                  padding: '1rem', 
                  borderRadius: 'var(--border-radius-sm)', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <User size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@urbateam.fr"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem 1rem 0.8rem 3rem', 
                      borderRadius: 'var(--border-radius-sm)', 
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem 1rem 0.8rem 3rem', 
                      borderRadius: 'var(--border-radius-sm)', 
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowForgot(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontWeight: '600' }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>Réinitialisation</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                {forgotSent 
                  ? 'Un email a été envoyé si le compte existe.' 
                  : 'Saisissez votre email pour recevoir un lien de réinitialisation.'}
              </p>

              {!forgotSent && (
                <div style={{ marginBottom: '2rem' }}>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem', 
                      borderRadius: 'var(--border-radius-sm)', 
                      border: '1px solid #e2e8f0',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || forgotSent}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontWeight: '600', marginBottom: '1rem' }}
              >
                {loading ? 'Envoi...' : (forgotSent ? 'Email envoyé' : 'Réinitialiser')}
              </button>

              <button 
                type="button"
                onClick={() => { setShowForgot(false); setForgotSent(false); }}
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Retour à la connexion
              </button>
            </form>
          )}
        </GlassCard>

        <div className="text-center" style={{ marginTop: '2rem' }}>
          <a href="/" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'none' }}>
            ← Retour au site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
