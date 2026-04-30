'use client';

import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjetsClient() {
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

  // Placeholder for future projects
  const projects = [];

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

      <MotionSection style={{ marginTop: '4rem', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {projects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: 'center' }}
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
                Nous préparons actuellement la présentation de nos derniers dossiers. Revenez bientôt pour découvrir notre travail sur le terrain.
              </p>
            </motion.div>
          ) : (
            <div className="grid" style={{ width: '100%', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {/* Projects will be mapped here */}
            </div>
          )}
        </AnimatePresence>
      </MotionSection>

      <div style={{ marginTop: '6rem', textAlign: 'center' }}>
        <GlassCard style={{ padding: '3rem', backgroundColor: 'var(--secondary-color)', color: 'white' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Vous avez un projet similaire ?</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
            Nos experts sont à votre disposition pour étudier votre dossier et vous proposer un accompagnement sur-mesure.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href='/contact'}>
            Demander une étude gratuite
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
