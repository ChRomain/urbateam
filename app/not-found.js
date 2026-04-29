'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function NotFound() {
  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: '600px' }}
      >
        <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 2rem',
              color: 'var(--secondary-color)'
            }}
          >
            <MapPinOff size={48} />
          </motion.div>

          <h1 style={{ fontSize: '6rem', margin: 0, lineHeight: 1, opacity: 0.1, position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: -1 }}>
            404
          </h1>

          <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '1rem' }}>
            Parcelle Non Trouvée
          </h2>
          
          <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. Il semblerait que nous ayons quitté le périmètre cadastral.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Home size={18} /> Retour à l'accueil
            </Link>
            <button onClick={() => window.history.back()} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={18} /> Page précédente
            </button>
          </div>
        </GlassCard>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
          style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}
        >
          Besoin d'aide ? <Link href="/contact" style={{ textDecoration: 'underline' }}>Contactez nos géomètres</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
