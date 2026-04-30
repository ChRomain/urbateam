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
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/interface-admin-urbateam-inc/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
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

            <div style={{ marginBottom: '2rem' }}>
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

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontWeight: '600' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
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
