'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientsClient() {
  const { t } = useLanguage();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/data/clients.json');
        const data = await res.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const clientTypes = [
    { title: t('references.categories.collectivite'), icon: "🏛️", key: 'Collectivite' },
    { title: t('references.categories.amenageur'), icon: "🏗️", key: 'Aménageur' },
    { title: t('references.categories.architecte'), icon: "📐", key: 'Architecte' },
    { title: t('references.categories.particulier'), icon: "🏠", key: 'Particulier' },
    { title: t('references.categories.entreprise'), icon: "🚧", key: 'Entreprise' }
  ];

  const filteredClients = filter === 'all' 
    ? clients 
    : clients.filter(c => c.tags?.some(tag => tag.toLowerCase() === filter.toLowerCase()));

  const toggleFilter = (key) => {
    if (filter === key) setFilter('all');
    else setFilter(key);
  };

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('clients.title')} 
        subtitle={t('clients.subtitle')}
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '1.2rem', 
        marginTop: '4rem',
        maxWidth: '900px',
        margin: '4rem auto 0'
      }}>
        {clientTypes.map((type, i) => (
          <button 
            key={i}
            onClick={() => toggleFilter(type.key)}
            style={{ 
              border: 'none', 
              background: 'none', 
              padding: 0, 
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <GlassCard style={{ 
              padding: '1.2rem', 
              aspectRatio: '1 / 1', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              textAlign: 'center',
              border: filter === type.key ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
              transform: filter === type.key ? 'translateY(-5px)' : 'none',
              boxShadow: filter === type.key ? 'var(--shadow-md)' : 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{type.icon}</div>
              <h3 style={{ 
                color: 'var(--primary-color)', 
                fontSize: '0.8rem', 
                margin: 0, 
                lineHeight: '1.2',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {type.title}
              </h3>
            </GlassCard>
          </button>
        ))}
      </div>

      <MotionSection style={{ marginTop: '6rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--secondary-color)' }}>
          {t('references.title')}
        </h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>{t('header.loading_references')}</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '2rem',
            alignItems: 'center'
          }}>
            <AnimatePresence mode='popLayout'>
              {filteredClients.map((client) => (
                <motion.div 
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '2rem', 
                    borderRadius: '16px', 
                    height: '120px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  {client.logo ? (
                    <img src={client.logo} alt={client.name} style={{ maxWidth: '100%', maxHeight: '100%', filter: 'grayscale(100%) opacity(0.7)', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.filter = 'none'} onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(100%) opacity(0.7)'} />
                  ) : (
                    <span style={{ fontWeight: '700', color: '#94a3b8', textAlign: 'center', fontSize: '0.9rem' }}>{client.name}</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </MotionSection>

      <div style={{ marginTop: '8rem', textAlign: 'center' }}>
        <GlassCard style={{ padding: '4rem', backgroundColor: 'var(--secondary-color)', color: 'white' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>{t('clients.cta')}</h2>
          <p style={{ marginBottom: '2.5rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto 2.5rem' }}>
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
