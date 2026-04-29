'use client';

import { useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function Lexique() {
  const { t } = useLanguage();
  const glossaryItems = t('glossary.items') || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const topEntry = entries.find(e => e.isIntersecting);
        if (topEntry) {
          const term = topEntry.target.getAttribute('data-term');
          document.title = `${term} | Lexique URBATEAM`;
        }
      },
      { threshold: 0.5 }
    );

    const cards = document.querySelectorAll('[data-term]');
    cards.forEach(card => observer.observe(card));

    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, [glossaryItems]);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('glossary.header.title')} 
        subtitle={t('glossary.header.subtitle')}
      />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {[...glossaryItems].sort((a, b) => a.term.localeCompare(b.term)).map((item) => (
          <GlassCard 
            key={item.term.toLowerCase().replace(/\s+/g, '-')} 
            id={item.term.toLowerCase().replace(/\s+/g, '-')}
            data-term={item.term}
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}
          >
            <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-color)', marginBottom: '1rem', borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
              {item.term}
            </h3>
            <p style={{ color: 'var(--text-main)', margin: 0, lineHeight: '1.6', flex: 1 }}>
              {item.definition}
            </p>
          </GlassCard>
        ))}
      </div>

      <MotionSection className="text-center" style={{ marginTop: '4rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('glossary.cta.title')}</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{t('glossary.cta.subtitle')}</p>
        <Link href="/contact" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-color)' }}>{t('glossary.cta.btn')}</Link>
      </MotionSection>
    </div>
  );
}
