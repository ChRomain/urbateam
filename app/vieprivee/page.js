'use client';

import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

export default function ViePrivee() {
  const { t } = useLanguage();

  return (
    <div className="container py-section">
      <PageHeader title={t('legal_pages.privacy.title')} subtitle={t('legal_pages.privacy.subtitle')} />
      
      <GlassCard style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          {t('legal_pages.privacy.intro')}
        </p>

        <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--secondary-color)' }}>{t('legal_pages.privacy.identity')}</h2>
        <p>
          <strong>{t('legal_pages.common.reason')} :</strong> Urbateam SARL<br/>
          <strong>SIRET :</strong> 49890426700040<br/>
          <strong>{t('legal_pages.common.address')} :</strong> 5 r Breiz Izel Za Ste Croix 29100 Douarnenez<br/>
          <strong>{t('legal_pages.common.email')} :</strong> contact@urbateam.fr<br/>
          <strong>{t('legal_pages.common.phone')} :</strong> 02 98 92 07 56
        </p>

        <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--secondary-color)' }}>{t('legal_pages.privacy.collection')}</h2>
        <p style={{ marginBottom: '1rem' }}>
          {t('legal_pages.privacy.collection_desc')}
        </p>

        <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--secondary-color)' }}>{t('legal_pages.privacy.rights')}</h2>
        <p style={{ marginBottom: '1rem' }}>
          {t('legal_pages.privacy.rights_desc')}
        </p>
        <p>
          {t('legal_pages.common.contact_text')} <strong>contact@urbateam.fr</strong>.
        </p>
      </GlassCard>
    </div>
  );
}
