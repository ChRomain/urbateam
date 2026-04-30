'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';

export default function SocialClient() {
  const { t } = useLanguage();

  const socialPlatforms = [
    {
      name: "Instagram",
      icon: (
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      handle: "@urbateam29_",
      url: "https://www.instagram.com/urbateam29_/",
      color: "#E1306C",
      desc: "Nos photos de terrain et coulisses."
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

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/interface-admin-urbateam-inc/social');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('social.title')} 
        subtitle={t('social.subtitle')}
      />

      <div className="grid grid-cols-3" style={{ gap: '2rem', marginTop: '4rem' }}>
        {socialPlatforms.map((platform, i) => (
          <motion.a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ textDecoration: 'none' }}
          >
            <GlassCard style={{ padding: '2.5rem', textAlign: 'center', height: '100%', borderTop: `4px solid ${platform.color}` }}>
              <div style={{ color: platform.color, marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                {platform.icon}
              </div>
              <h3 style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>{platform.name}</h3>
              <p style={{ color: 'var(--primary-color)', fontWeight: '700', marginBottom: '1rem' }}>{platform.handle}</p>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{platform.desc}</p>
            </GlassCard>
          </motion.a>
        ))}
      </div>

      <MotionSection style={{ marginTop: '8rem' }}>
        <h2 className="text-center" style={{ marginBottom: '3rem' }}>{t('social.instagram_title')}</h2>
        
        {loading ? (
          <div className="text-center" style={{ padding: '4rem', color: 'var(--text-light)' }}>
            Synchronisation du flux...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ 
            padding: '4rem 2rem', 
            backgroundColor: 'rgba(var(--primary-rgb), 0.05)', 
            borderRadius: 'var(--border-radius-lg)', 
            border: '1px dashed var(--glass-border)',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
              Le flux de nos dernières publications est en cours de synchronisation...
            </p>
            <a 
              href="https://www.instagram.com/urbateam29_/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-block', 
                marginTop: '1.5rem', 
                color: 'var(--primary-color)', 
                fontWeight: '600',
                textDecoration: 'underline' 
              }}
            >
              Voir les photos directement sur Instagram
            </a>
          </div>
        ) : (
          <div style={{ 
            columns: '3 250px',
            columnGap: '1.5rem',
          }}>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ 
                  breakInside: 'avoid',
                  marginBottom: '1.5rem',
                  borderRadius: 'var(--border-radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: 'white'
                }}
              >
                <img 
                  src={post.url} 
                  alt={post.caption} 
                  style={{ width: '100%', display: 'block' }} 
                />
                {post.caption && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    padding: '1rem', 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    fontSize: '0.85rem',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }}
                  className="caption-overlay"
                  >
                    {post.caption}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        <style jsx>{`
          div:hover > .caption-overlay {
            opacity: 1;
          }
        `}</style>
      </MotionSection>

      <MotionSection style={{ marginTop: '10rem', textAlign: 'center' }}>
        <GlassCard style={{ padding: '4rem 2rem', backgroundColor: 'var(--secondary-color)', color: 'white', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }}>
            <Star size={200} fill="white" />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map(s => <Star key={s} fill="#FFD700" color="#FFD700" size={32} />)}
            </div>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>{t('social.google_review.title')}</h2>
            <p style={{ maxWidth: '700px', margin: '0 auto 3rem', fontSize: '1.1rem', opacity: 0.9 }}>
              {t('social.google_review.desc')}
            </p>
            <a 
              href="https://search.google.com/local/writereview?placeid=ChIJw7lWj-68D0gRWitK6_C-W_k" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '1rem 2.5rem' }}
            >
              <ExternalLink size={20} />
              {t('social.google_review.cta')}
            </a>
          </div>
        </GlassCard>
      </MotionSection>
    </div>
  );
}
