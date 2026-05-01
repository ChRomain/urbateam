'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ProjetsClient() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/data/projets.json');
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = [
    { id: 'all', label: t('projects.categories.all') },
    { id: 'foncier', label: t('projects.categories.foncier') },
    { id: 'topographie', label: t('projects.categories.topographie') },
    { id: 'vrd', label: t('projects.categories.vrd') },
    { id: 'copropriete', label: t('projects.categories.copropriete') },
    { id: 'urbanisme', label: t('projects.categories.urbanisme') },
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('projects.title')} 
        subtitle={t('projects.subtitle')}
      />

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '50px',
              border: '1px solid var(--primary-color)',
              backgroundColor: filter === cat.id ? 'var(--primary-color)' : 'transparent',
              color: filter === cat.id ? 'white' : 'var(--primary-color)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <MotionSection style={{ marginTop: '4rem', minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" style={{ textAlign: 'center', width: '100%' }}>
              <p>{t('common.loading')}</p>
            </motion.div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: 'center', width: '100%' }}
            >
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 2rem',
                color: 'var(--primary-color)'
              }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{t('projects.placeholder')}</h3>
              <p style={{ color: 'var(--text-light)', maxWidth: '500px', margin: '0 auto' }}>
                {filter === 'all' 
                  ? "Nous préparons actuellement la présentation de nos derniers dossiers. Revenez bientôt pour découvrir notre travail sur le terrain."
                  : `Aucune réalisation dans la catégorie "${categories.find(c => c.id === filter)?.label}" pour le moment.`}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid" 
              style={{ width: '100%', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}
            >
              {filteredProjects.map((project) => (
                <GlassCard key={project.id} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden', borderRadius: 'var(--border-radius-md) var(--border-radius-md) 0 0' }}>
                    <img 
                      src={project.images.after || project.images.gallery[0] || '/og-image.png'} 
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {categories.find(c => c.id === project.category)?.label || project.category}
                    </div>
                  </div>
                  
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        📍 {project.location}
                      </p>
                      <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}>{project.title}</h3>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {project.missions.slice(0, 3).map((mission, idx) => (
                          <span key={idx} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '4px', color: '#64748b' }}>
                            {mission}
                          </span>
                        ))}
                      </div>
                      <Link 
                        href={`/projets/${project.slug || project.id}`}
                        className="btn btn-outline" 
                        style={{ width: '100%', textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      >
                        Voir les détails
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </MotionSection>

      <div style={{ marginTop: '6rem', textAlign: 'center' }}>
        <GlassCard style={{ padding: '3rem', backgroundColor: 'var(--secondary-color)', color: 'white' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('expertise.cta_title')}</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
            {t('expertise.cta_desc')}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href='/contact'}>
            {t('expertise.cta_btn')}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

