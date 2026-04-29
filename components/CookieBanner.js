'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
// ...
    // Vérifie si le consentement a déjà été donné
    const consent = localStorage.getItem('urbateam-cookie-consent');
    if (!consent) {
      // Petit délai pour ne pas agresser l'utilisateur dès l'arrivée
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('urbateam-cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('urbateam-cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            zIndex: 3000,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            maxWidth: '600px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>{t('cookies_banner.title')}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {t('cookies_banner.text')}
                <Link href="/vieprivee" style={{ textDecoration: 'underline', color: 'var(--secondary-color)' }}>
                  {t('cookies_banner.privacy_link')}
                </Link>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={declineCookies} 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #e2e8f0', 
                  padding: '0.6rem 1rem', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {t('cookies_banner.decline')}
              </button>
              <button 
                onClick={acceptCookies} 
                style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)'
                }}
              >
                {t('cookies_banner.accept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
