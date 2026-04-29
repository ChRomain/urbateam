'use client';

import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

export default function MentionsLegales() {
  const { t } = useLanguage();

  return (
    <div className="container py-section">
      <PageHeader title={t('legal_pages.mentions.title')} />
      
      <GlassCard style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: 'var(--secondary-color)' }}>{t('legal_pages.mentions.editor')}</h2>
          <p><strong>{t('contact.info.renan')} :</strong> URBATEAM Saint-Renan</p>
          <p><strong>{t('contact.info.douarnenez')} :</strong> URBATEAM Douarnenez</p>
          <p><strong>{t('legal_pages.common.reason')} :</strong> Urbateam SARL</p>
          <p><strong>SIRET :</strong> 49890426700040</p>
          <p><strong>{t('legal_pages.common.address')} :</strong> 5 r Breiz Izel Za Ste Croix 29100 Douarnenez, France</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: 'var(--secondary-color)' }}>{t('legal_pages.mentions.contact')}</h2>
          <p><strong>{t('legal_pages.common.email')} :</strong> contact@urbateam.fr</p>
          <p><strong>{t('legal_pages.common.phone')} :</strong> 02 98 92 07 56</p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: 'var(--secondary-color)' }}>{t('legal_pages.mentions.hosting')}</h2>
          <p style={{ lineHeight: '1.6' }}>
            {t('legal_pages.mentions.hosting_desc')}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
            RCS Lille Métropole 424 761 419 00045 | Siège social : 2 rue Kellermann - 59100 Roubaix - France
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
