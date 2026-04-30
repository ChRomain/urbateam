'use client';

import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

export default function ClientsClient() {
  const { t } = useLanguage();

  const clientTypes = [
    { title: "Collectivités", icon: "🏛️" },
    { title: "Aménageurs & Promoteurs", icon: "🏗️" },
    { title: "Architectes", icon: "📐" },
    { title: "Particuliers", icon: "🏠" },
    { title: "Entreprises de Travaux", icon: "🚧" }
  ];

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('clients.title')} 
        subtitle={t('clients.subtitle')}
      />

      <div className="grid grid-cols-3" style={{ gap: '2rem', marginTop: '4rem' }}>
        {clientTypes.map((type, i) => (
          <GlassCard key={i} className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{type.icon}</div>
            <h3 style={{ color: 'var(--primary-color)', fontSize: '1.2rem', marginBottom: '0' }}>{type.title}</h3>
          </GlassCard>
        ))}
      </div>

      <MotionSection style={{ marginTop: '6rem', textAlign: 'center' }}>
        <div style={{ padding: '4rem 2rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--border-radius-lg)', border: '2px dashed #cbd5e1' }}>
          <h2 style={{ color: 'var(--secondary-color)', marginBottom: '1.5rem' }}>{t('clients.placeholder')}</h2>
          <p style={{ color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>
            Nous mettons à jour notre liste de références pour inclure nos partenariats récents avec les acteurs publics et privés de Bretagne-Ouest.
          </p>
        </div>
      </MotionSection>

      <div style={{ marginTop: '6rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>{t('clients.cta')}</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/contact'}>
          Parlons de votre projet
        </button>
      </div>
    </div>
  );
}
