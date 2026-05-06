'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GlassCard from '../../../components/GlassCard';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Validation de la complexité
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /[^A-Za-z0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas && hasMinLength)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/admin'), 3000);
      } else {
        setError('Le lien est invalide ou a expiré.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h3>Lien invalide</h3>
        <p>Ce lien de réinitialisation est incomplet.</p>
        <button onClick={() => router.push('/admin')} className="btn" style={{ marginTop: '1rem' }}>Retour</button>
      </div>
    );
  }

  return (
    <GlassCard style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
      {success ? (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--secondary-color)' }}>Mot de passe mis à jour !</h3>
          <p style={{ color: 'var(--text-light)' }}>Vous allez être redirigé vers la page de connexion...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>Nouveau mot de passe</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
            Choisissez un mot de passe sécurisé pour votre compte.
          </p>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', lineHeight: '1.4' }}>
              Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
            </p>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Confirmer le mot de passe</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontWeight: '600' }}
          >
            {loading ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
        </form>
      )}
    </GlassCard>
  );
}

export default function ResetPasswordPage() {
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
      <Suspense fallback={<div>Chargement...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
