'use client';

import { useState, useMemo } from 'react';

import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

// dbItems : données brutes Directus {question_fr, answer_fr, question_en, ...}
// Si vide, fallback sur les items i18n statiques
export default function FAQClient({ dbItems = [] }) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const staticFaqItems = t('faq.items') || [];

  // Mapper les items Directus selon la langue active
  const items = useMemo(() => {
    if (dbItems.length > 0) {
      return dbItems.map(item => ({
        question: item[`question_${language}`] || item.question_fr || '',
        answer: item[`answer_${language}`] || item.answer_fr || '',
      }));
    }
    return staticFaqItems;
  }, [dbItems, language, staticFaqItems]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => 
      item.question.toLowerCase().includes(searchLower) || 
      item.answer.toLowerCase().includes(searchLower)
    );
  }, [items, searchTerm]);


  return (
    <div className="container py-section">
      <PageHeader 
        title={t('faq.header.title')} 
        subtitle={t('faq.header.subtitle')}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <label
            htmlFor="faq-search"
            style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
          >
            Rechercher dans la FAQ
          </label>
          <input
            id="faq-search"
            type="search"
            placeholder={t('faq.header.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Rechercher dans la FAQ"
            autoComplete="off"
            style={{
              paddingLeft: '3rem',
              height: '56px',
              fontSize: '1.1rem',
              boxShadow: 'var(--shadow-sm)',
              background: 'var(--bg-white)',
              border: '1px solid var(--glass-border)'
            }}
          />
          <span style={{ 
            position: 'absolute', 
            left: '1.2rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: '1.2rem',
            opacity: 0.5
          }}>
            🔍
          </span>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '1.2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                opacity: 0.5
              }}
            >
              ✕
            </button>
          )}
        </div>

        {filteredItems.length > 0 ? (
          filteredItems.map((faq, idx) => (
            <GlassCard key={`faq-${idx}`} style={{ marginBottom: '1.5rem', padding: '2.5rem' }}>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-color)', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Q.</span>
                {faq.question}
              </h3>
              <p style={{ color: 'var(--text-main)', display: 'flex', gap: '10px', margin: 0, lineHeight: '1.6' }}>
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>R.</span>
                <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </p>
            </GlassCard>
          ))
        ) : (
          <div className="text-center" style={{ padding: '3rem', opacity: 0.7 }}>
            <p>Aucun résultat trouvé pour "{searchTerm}"</p>
          </div>
        )}
      </div>

      <MotionSection className="text-center" style={{ marginTop: '4rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('faq.cta.title')}</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{t('faq.cta.subtitle')}</p>
        <Link href="/contact" className="btn btn-primary">{t('faq.cta.btn')}</Link>
      </MotionSection>
    </div>
  );
}
