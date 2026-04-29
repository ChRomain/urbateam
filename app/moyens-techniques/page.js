'use client';

import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

export default function MoyensTechniques() {
  const { t } = useLanguage();

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('technical.header.title')} 
        subtitle={t('technical.header.subtitle')}
      />

      <div className="grid grid-cols-2" style={{ gap: '2rem', marginTop: '4rem' }}>
        {/* Infrastructures */}
        <GlassCard>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('technical.infrastructure.title')}</h2>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', listStyleType: 'disc' }}>
            {t('technical.infrastructure.list').map((item, i) => (
              <li key={`infra-${i}`} style={{ marginBottom: '0.5rem' }}>{item}</li>
            ))}
          </ul>
        </GlassCard>

        {/* Topographie */}
        <GlassCard>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
             <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('technical.field.title')}</h2>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', listStyleType: 'disc' }}>
            {t('technical.field.list').map((item, i) => (
              <li key={`field-${i}`} style={{ marginBottom: '0.5rem' }}>{item}</li>
            ))}
          </ul>
        </GlassCard>

        {/* Informatique / DAO */}
        <GlassCard>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('technical.computing.title')}</h2>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', listStyleType: 'disc' }}>
            {t('technical.computing.list').map((item, i) => (
              <li key={`comp-${i}`} style={{ marginBottom: '0.5rem' }}>{item}</li>
            ))}
          </ul>
        </GlassCard>

        {/* Logiciels */}
        <GlassCard>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('technical.software.title')}</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
            {t('technical.software.desc')}
          </p>
          <p style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem', lineHeight: '1.6' }}>
            AUTOCAD, COVADIS, SKETCHUP PRO, PHOTOSHOP, ILLUSTRATOR, SPACE EYES.
          </p>
        </GlassCard>
      </div>

      <MotionSection style={{ marginTop: '4rem' }}>
        <GlassCard>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>{t('technical.reprography.title')}</h2>
          <ul className="multi-column-list" style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', listStyleType: 'disc', columnCount: 2, columnGap: '2rem' }}>
            {t('technical.reprography.list').map((item, i) => (
              <li key={`repro-${i}`} style={{ marginBottom: '0.5rem' }}>{item}</li>
            ))}
          </ul>
        </GlassCard>
      </MotionSection>
    </div>
  );
}
