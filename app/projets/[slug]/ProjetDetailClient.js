'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';
import MotionSection from '../../../components/MotionSection';
import GlassCard from '../../../components/GlassCard';
import { useLanguage } from '../../../context/LanguageContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Download } from 'lucide-react';

export default function ProjetDetailClient({ slug }) {
  const { t } = useLanguage();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderPos, setSliderPos] = useState(50);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch('/data/projets.json');
        const data = await res.json();
        const found = data.find(p => p.slug === slug || (p.id && p.id.toString() === slug));
        setProject(found);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) return <div className="container py-section text-center"><p>{t('common.loading')}</p></div>;
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
        subtitle={project.category.charAt(0).toUpperCase() + project.category.slice(1)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '3rem', marginTop: '4rem' }}>
        {/* Left: Content */}
        <div className="lg:col-span-2">
          <MotionSection>
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ color: 'var(--secondary-color)', marginBottom: '1.5rem' }}>À propos du projet</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-light)', whiteSpace: 'pre-wrap' }}>
                {project.description}
              </p>
            </div>

            {/* Before/After Slider */}
            {project.images.before && project.images.after && (
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
                    src={project.images.after} 
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
                      src={project.images.before} 
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

            {/* Gallery */}
            {project.images.gallery && project.images.gallery.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Galerie Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '1rem' }}>
                  {project.images.gallery.map((img, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.02 }}
                      style={{ borderRadius: '12px', overflow: 'hidden', height: '200px' }}
                    >
                      <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

              {project.technicalDetails && (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Données Techniques</span>
                  <p style={{ fontWeight: '600' }}>{project.technicalDetails}</p>
                </div>
              )}

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
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => window.location.href='/contact'}
                >
                  Étudier mon projet
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
