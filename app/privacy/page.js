'use client';

import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

export default function PrivacyCookies() {
  const { t } = useLanguage();

  return (
    <div className="container py-section">
      <PageHeader title={t('legal_pages.cookies.title')} />
      
      <GlassCard style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          {t('legal_pages.cookies.desc')}
        </p>

        <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--secondary-color)' }}>{t('legal_pages.cookies.usage')}</h2>
        <p style={{ marginBottom: '1rem' }}>
          {t('legal_pages.cookies.usage_desc')}
        </p>

        <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--secondary-color)' }}>{t('legal_pages.cookies.control')}</h2>
        <p style={{ marginBottom: '1rem' }}>
          {t('legal_pages.cookies.control_desc')}
        </p>
        <p>
          {t('legal_pages.common.more_info')} <a href="https://www.cnil.fr/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>CNIL</a>.
        </p>
      </GlassCard>
    </div>
  );
}
