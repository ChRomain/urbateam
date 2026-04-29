'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

export default function MonProjet() {
  const [activeTab, setActiveTab] = useState('division');
  const { t } = useLanguage();

  const projectTypesKeys = ['division', 'bornage', 'lotissement', 'topo'];

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('project.header.title')} 
        subtitle={t('project.header.subtitle')}
      />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {projectTypesKeys.map((key) => (
          <motion.button 
            key={key}
            onClick={() => setActiveTab(key)}
            className="btn" 
            style={{ 
              width: '100%', 
              backgroundColor: activeTab === key ? 'var(--primary-color)' : '#f1f5f9', 
              color: activeTab === key ? 'white' : 'var(--text-main)', 
              border: 'none', 
              transition: 'background-color 0.3s' 
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t(`project.tabs.${key}`)}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard style={{ position: 'relative', overflow: 'hidden', padding: '3rem' }}>
            <h2 style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
              {t(`project.types.${activeTab}.title`)}
            </h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '3rem', fontSize: '1.1rem' }}>
              {t(`project.types.${activeTab}.description`)}
            </p>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '0', bottom: '0', left: '20px', width: '4px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>

              {t(`project.types.${activeTab}.steps`).map((step, index, array) => (
                <div key={step.title} style={{ display: 'flex', gap: '2rem', marginBottom: index === array.length - 1 ? '0' : '2.5rem', position: 'relative' }}>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white', border: '5px solid var(--accent-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: 'var(--primary-color)', zIndex: 2, boxShadow: '0 0 0 4px white' }}
                  >
                    {index + 1}
                  </motion.div>
                  
                  <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', flex: 1, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                      {step.title}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <MotionSection className="glass-card text-center" style={{ marginTop: '4rem', backgroundColor: 'var(--bg-white)', border: '2px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" fill="var(--accent-color)" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          {t('project.geofoncier.title')}
        </h3>
        <p style={{ color: 'var(--text-main)', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
          {t('project.geofoncier.desc')}
        </p>
        <a href="https://www.geofoncier.fr" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem' }}>
          {t('project.geofoncier.btn')}
        </a>
      </MotionSection>

      <div className="text-center" style={{ marginTop: '4rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('project.cta.title')}</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{t('project.cta.subtitle')}</p>
        <Link href="/contact" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-color)' }}>{t('project.cta.btn')}</Link>
      </div>
    </div>
  );
}
