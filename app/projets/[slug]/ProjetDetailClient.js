'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../components/PageHeader';
import MotionSection from '../../../components/MotionSection';
import GlassCard from '../../../components/GlassCard';
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FileText, Download, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

function renderMarkdown(text) {
  if (!text) return '';
  
  // Escape HTML to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Bold (**bold**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Split lines to handle block elements
  const lines = html.split('\n');
  let inList = false;
  const result = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('### ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      const title = trimmed.replace('### ', '');
      result.push(`<h3 style="color: var(--secondary-color); margin-top: 1.8rem; margin-bottom: 0.8rem; font-size: 1.25rem; font-weight: 700;">${title}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      const title = trimmed.replace('## ', '');
      result.push(`<h2 style="color: var(--secondary-color); margin-top: 2.2rem; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${title}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      const title = trimmed.replace(/^#\s+/, '');
      result.push(`<h1 style="color: var(--secondary-color); margin-top: 2.5rem; margin-bottom: 1.2rem; font-size: 1.8rem; font-weight: 700;">${title}</h1>`);
    }
    // List items
    else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (!inList) {
        result.push('<ul style="margin-bottom: 1.2rem; padding-left: 1.2rem; list-style-type: disc;">');
        inList = true;
      }
      const itemContent = trimmed.substring(2);
      result.push(`<li style="margin-bottom: 0.4rem; line-height: 1.7; color: var(--text-light);">${itemContent}</li>`);
    }
    // Paragraphs / Empty lines
    else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed === '') {
        result.push('<div style="height: 0.8rem;"></div>');
      } else {
        result.push(`<p style="margin-bottom: 0.8rem; line-height: 1.8; color: var(--text-light);">${line}</p>`);
      }
    }
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('\n');
}

// project est passé en props depuis le server component (page.js)
export default function ProjetDetailClient({ project }) {
  const { t } = useLanguage();
  const [sliderPos, setSliderPos] = useState(50);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const galleryImages = project?.images_gallery || [];

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null || galleryImages.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [lightboxIndex, galleryImages.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null || galleryImages.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  }, [lightboxIndex, galleryImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  if (!project) return <div className="container py-section text-center"><h2>Projet non trouvé</h2></div>;

  return (
    <div className="container py-section">
      <Link 
        href="/projets"
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'none' }}
      >
        ← Retour aux réalisations
      </Link>

      <PageHeader 
        title={project.title} 
        subtitle={project.category ? (project.category.charAt(0).toUpperCase() + project.category.slice(1)) : ''}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '3rem', marginTop: '4rem' }}>
        {/* Left: Content */}
        <div className="lg:col-span-2">
          <MotionSection>
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ color: 'var(--secondary-color)', marginBottom: '1.5rem' }}>À propos du projet</h2>
              <div 
                style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(project.description) }}
              />
            </div>

            {/* Before/After Slider */}
            {project.image_before && project.image_after && (
              <div style={{ marginBottom: '4rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>{t('project.slider.title')}</h3>
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '500px', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    cursor: 'ew-resize',
                    userSelect: 'none'
                  }}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      setSliderPos(pos);
                    }
                  }}
                >
                  {/* After Image (Background) */}
                  <img 
                    src={project.image_after} 
                    alt="Après" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Before Image (Foreground with Clip) */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      clipPath: `inset(0 ${100 - sliderPos}% 0 0)` 
                    }}
                  >
                    <img 
                      src={project.image_before} 
                      alt="Avant" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  {/* Slider Bar */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: '4px', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.5)', zIndex: 10 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8L22 12L18 16M6 8L2 12L6 16" /></svg>
                    </div>
                  </div>
                  {/* Labels */}
                  <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', padding: '0.4rem 1rem', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>{t('project.slider.before')}</div>
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', padding: '0.4rem 1rem', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>{t('project.slider.after')}</div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '1rem' }}>
                  {t('project.slider.help')}
                </p>
              </div>
            )}

            {/* Google Photos Style Gallery (Large Cards) */}
            {galleryImages.length > 0 && (
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--secondary-color)', margin: 0 }}>
                    Galerie Photos ({galleryImages.length})
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '500' }}>
                    Cliquez sur une photo pour l'afficher en plein écran
                  </span>
                </div>

                <div 
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1.25rem'
                  }}
                  className="google-photos-grid"
                >
                  {galleryImages.map((img, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.025 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setLightboxIndex(idx)}
                      style={{ 
                        height: '240px',
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        position: 'relative',
                        cursor: 'pointer',
                        backgroundColor: '#f8fafc',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px'
                      }}
                      className="photo-card"
                    >
                      <img 
                        src={img} 
                        alt={`Photo ${idx + 1} - ${project.title}`} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'contain',
                          borderRadius: '10px'
                        }} 
                      />
                      <div 
                        className="photo-overlay" 
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0, 0, 0, 0.35)',
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem',
                          borderRadius: '16px'
                        }}
                      >
                        <div style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          color: 'var(--secondary-color)',
                          padding: '0.4rem 0.9rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          <Maximize2 size={14} /> Agrandir
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </MotionSection>
        </div>

        {/* Right: Info Sidebar */}
        <div>
          <GlassCard style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Détails du projet</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Localisation</span>
                <p style={{ fontWeight: '600' }}>{project.location}</p>
              </div>
              
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Client</span>
                <p style={{ fontWeight: '600' }}>{project.client || 'Confidentiel'}</p>
              </div>

              {project.technical_details && (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Données Techniques</span>
                  <p style={{ fontWeight: '600' }}>{project.technical_details}</p>
                </div>
              )}

              {project.missions && project.missions.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Missions réalisées</span>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {project.missions.map((mission, idx) => (
                      <li key={idx} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--primary-color)' }}>✓</span> {mission}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.documents && project.documents.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '1rem' }}>Documents utiles</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {project.documents.map((doc, idx) => (
                      <a 
                        key={idx} 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.8rem', 
                          padding: '0.8rem', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '8px',
                          textDecoration: 'none',
                          color: 'var(--secondary-color)',
                          fontSize: '0.85rem',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-color)';
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                      >
                        <FileText size={18} color="#ef4444" />
                        <span style={{ flex: 1, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                        <Download size={14} color="#64748b" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Link
                  href="/contact"
                  className="btn btn-primary"
                  aria-label="Étudier mon projet avec URBATEAM"
                  style={{ width: '100%', display: 'block', textAlign: 'center' }}
                >
                  Étudier mon projet
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Full-screen Lightbox Modal (Google Photos Mode) */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(0, 0, 0, 0.94)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.5rem',
              userSelect: 'none'
            }}
            onClick={() => setLightboxIndex(null)}
          >
            {/* Lightbox Header */}
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', zIndex: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: '600', opacity: 0.8, letterSpacing: '0.5px' }}>
                {project.title} &bull; Photo {lightboxIndex + 1} / {galleryImages.length}
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                aria-label="Fermer"
                style={{
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              >
                <X size={22} />
              </button>
            </div>

            {/* Main Image Viewer */}
            <div 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '1rem 0' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={handlePrev}
                  aria-label="Photo précédente"
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.35)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              {/* Active Full-Frame Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  src={galleryImages[lightboxIndex]}
                  alt={`Photo ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    maxHeight: '75vh',
                    maxWidth: '85vw',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                  }}
                />
              </AnimatePresence>

              {/* Next Button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={handleNext}
                  aria-label="Photo suivante"
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.35)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Bar */}
            {galleryImages.length > 1 && (
              <div 
                style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', overflowX: 'auto', padding: '0.5rem 0' }}
                onClick={(e) => e.stopPropagation()}
              >
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    style={{
                      border: idx === lightboxIndex ? '2px solid white' : '2px solid transparent',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      width: '60px',
                      height: '42px',
                      padding: 0,
                      background: 'none',
                      cursor: 'pointer',
                      opacity: idx === lightboxIndex ? 1 : 0.5,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={img} alt={`Vignette ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .photo-card:hover .photo-overlay {
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          .google-photos-grid {
            column-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
