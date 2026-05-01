'use client';

import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from '../../components/Tilt';

export default function SocialClient({ initialPosts }) {
  const { t } = useLanguage();

  const socialLinks = [
    {
      name: "Instagram",
      icon: (
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      handle: "@urbateam_ge",
      url: "https://www.instagram.com/urbateam_ge/",
      color: "#E1306C",
      desc: "Suivez nos coulisses et nos interventions terrain au quotidien."
    },
    {
      name: "LinkedIn",
      icon: (
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
        </svg>
      ),
      handle: "URBATEAM",
      url: "https://www.linkedin.com/company/urbateam/",
      color: "#0077B5",
      desc: "Actualités professionnelles et expertise."
    },
    {
      name: "Facebook",
      icon: (
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
        </svg>
      ),
      handle: "Urbateam",
      url: "https://www.facebook.com/urbateam",
      color: "#1877F2",
      desc: "Vie de l'agence et projets locaux."
    }
  ];

  const posts = initialPosts || [];
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('social.title')} 
        subtitle={t('social.subtitle')}
      />

      <div className="grid grid-cols-3" style={{ gap: '1.5rem', marginBottom: '5rem' }}>
        {socialLinks.map((link) => (
          <GlassCard 
            key={link.name} 
            style={{ height: '100%' }} 
            innerStyle={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'center', padding: '2rem' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: link.color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                {link.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{link.name}</h3>
              <p style={{ color: 'var(--primary-color)', fontWeight: '600', marginBottom: '0.5rem' }}>{link.handle}</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>{link.desc}</p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block', 
                  padding: '0.6rem 1.2rem', 
                  backgroundColor: link.color, 
                  color: 'white', 
                  borderRadius: '50px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {t('header.view_profile')}
              </a>
            </div>
          </GlassCard>
        ))}
      </div>

      <MotionSection>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}>{t('social.instagram_title')}</h2>
          <p style={{ color: '#64748b' }}>{t('social.subtitle')}</p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#94a3b8' }}>{t('header.loading_posts')}</p>
          </div>
        ) : (
          <div style={{ 
            columnCount: (typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 4), 
            columnGap: '1rem' 
          }}>
            <AnimatePresence mode='popLayout'>
              {posts.map((post) => (
                <Tilt key={post.id} strength={15}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    style={{ 
                      breakInside: 'avoid', 
                      marginBottom: '1rem', 
                      position: 'relative', 
                      overflow: 'hidden', 
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transformStyle: "preserve-3d"
                    }}
                    onClick={() => setSelectedPost(post)}
                  >
                    <img 
                      src={post.url} 
                      alt={post.caption} 
                      style={{ width: '100%', display: 'block', transition: 'transform 0.5s ease', transform: 'translateZ(20px)' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateZ(50px) scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateZ(20px) scale(1)'}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.2rem',
                      color: 'white',
                      transform: 'translateZ(60px)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    >
                      <p style={{ fontSize: '0.85rem', fontWeight: '500', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.caption}</p>
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </AnimatePresence>
          </div>
        )}
      </MotionSection>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backdropFilter: 'blur(12px)'
            }}
          >
            <button 
              onClick={() => setSelectedPost(null)}
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer',
                zIndex: 2100,
                transition: 'all 0.2s'
              }}
            >
              ✕
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: '95vw', maxHeight: '95vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
            >
              <img src={selectedPost.url} alt={selectedPost.caption} style={{ maxWidth: '100%', maxHeight: 'calc(95vh - 120px)', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} />
              <div style={{ color: 'white', textAlign: 'center', maxWidth: '800px', padding: '0 1rem' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem' }}>{selectedPost.caption}</p>
                <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>{new Date(selectedPost.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
