'use client';

import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function FAQ() {
  const { t } = useLanguage();
  const faqItems = t('faq.items') || [];

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('faq.header.title')} 
        subtitle={t('faq.header.subtitle')}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {faqItems.map((faq) => (
          <GlassCard key={faq.question.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')} style={{ marginBottom: '1.5rem', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-color)', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Q.</span>
              {faq.question}
            </h3>
            <p style={{ color: 'var(--text-main)', display: 'flex', gap: '10px', margin: 0, lineHeight: '1.6' }}>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>R.</span>
              <span>{faq.answer}</span>
            </p>
          </GlassCard>
        ))}
      </div>

      <MotionSection className="text-center" style={{ marginTop: '4rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('faq.cta.title')}</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{t('faq.cta.subtitle')}</p>
        <Link href="/contact" className="btn btn-primary">{t('faq.cta.btn')}</Link>
      </MotionSection>
    </div>
  );
}
