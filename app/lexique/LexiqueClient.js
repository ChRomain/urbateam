'use client';

import { useEffect, useState, useMemo } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function LexiqueClient() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const staticGlossaryItems = t('glossary.items') || [];

  useEffect(() => {
    const loadGlossary = async () => {
      try {
        const res = await fetch('/data/glossary.json');
        const data = await res.json();
        if (data && data.length > 0) {
          const mappedItems = data.map(item => ({
            term: item[language]?.term || item.fr?.term || '',
            definition: item[language]?.definition || item.fr?.definition || ''
          }));
          setItems(mappedItems);
        } else {
          setItems(staticGlossaryItems);
        }
      } catch (err) {
        setItems(staticGlossaryItems);
      }
    };
    loadGlossary();
  }, [language, staticGlossaryItems]);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, []);

  const filteredItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.term.localeCompare(b.term));
    if (!searchTerm.trim()) return sorted;
    
    const searchLower = searchTerm.toLowerCase();
    return sorted.filter(item => 
      item.term.toLowerCase().includes(searchLower) || 
      item.definition.toLowerCase().includes(searchLower)
    );
  }, [items, searchTerm]);


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
  }, [filteredItems]);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('glossary.header.title')} 
        subtitle={t('glossary.header.subtitle')}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder={t('glossary.header.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
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
              {item.relatedExpertise && (
                <Link 
                  href={`/expertise/${item.relatedExpertise}`}
                  className="btn btn-outline" 
                  style={{ 
                    marginTop: '1.5rem', 
                    padding: '0.6rem 1rem', 
                    fontSize: '0.85rem',
                    alignSelf: 'flex-start',
                    borderColor: 'var(--primary-color)',
                    color: 'var(--primary-color)'
                  }}
                >
                  {t('common.learn_more')} : {t(`expertise.items.${item.relatedExpertise}.title`)}
                </Link>
              )}
            </GlassCard>
          ))
        ) : (
          <div className="text-center" style={{ gridColumn: '1 / -1', padding: '3rem', opacity: 0.7 }}>
            <p>Aucun terme trouvé pour "{searchTerm}"</p>
          </div>
        )}
      </div>

      <MotionSection className="text-center" style={{ marginTop: '4rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('glossary.cta.title')}</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{t('glossary.cta.subtitle')}</p>
        <Link href="/contact" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-color)' }}>{t('glossary.cta.btn')}</Link>
      </MotionSection>
    </div>
  );
}
