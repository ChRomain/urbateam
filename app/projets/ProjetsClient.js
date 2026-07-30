'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Magnetic from '../../components/Magnetic';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const ProjectsMap = dynamic(() => import('../../components/ProjectsMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', backgroundColor: '#f8fafc', borderRadius: '20px' }}></div>
});

// projects est passé en props depuis le server component (page.js)
export default function ProjetsClient({ projects = [] }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

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
    : projects.filter(p => {
        if (filter === 'foncier') return p.category === 'foncier' || p.category === 'geometre';
        return p.category === filter;
      });

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('projects.title')} 
        subtitle={t('projects.subtitle')}
      />

      <div style={{ marginTop: '3rem' }}>
        <ProjectsMap projects={projects} />
      </div>

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
          {filteredProjects.length === 0 ? (
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
                <GlassCard 
                  key={project.id} 
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  innerStyle={{ height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <div style={{ position: 'relative', height: '240px', flexShrink: 0, overflow: 'hidden', borderRadius: 'var(--border-radius-md) var(--border-radius-md) 0 0' }}>
                    <Image
                      src={project.image_after || project.images_gallery?.[0] || '/og-image.png'}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 350px"
                      style={{ objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {categories.find(c => c.id === project.category || (c.id === 'foncier' && project.category === 'geometre'))?.label || project.category}
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

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
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
                        style={{ width: '100%', textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 'auto' }}
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
        <GlassCard style={{ padding: '3.5rem 2rem', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: 'var(--border-radius-lg)', boxShadow: '0 15px 35px rgba(121, 160, 129, 0.25)' }}>
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>{t('expertise.cta_title')}</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            {t('expertise.cta_desc')}
          </p>
          <Magnetic strength={0.35}>
            <Link 
              href="/contact" 
              className="btn" 
              style={{ 
                backgroundColor: 'white', 
                color: 'var(--secondary-color)', 
                fontWeight: '700', 
                padding: '0.9rem 2.2rem', 
                borderRadius: '50px',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                fontSize: '1rem'
              }} 
              aria-label="Nous contacter pour un projet"
            >
              {t('expertise.cta_btn')}
            </Link>
          </Magnetic>
        </GlassCard>
      </div>
    </div>
  );
}

