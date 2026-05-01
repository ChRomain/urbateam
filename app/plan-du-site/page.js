"use client";

import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function SitemapHTML() {
  const { t } = useLanguage();

  const links = [
    { href: '/', label: t('header.home') },
    { href: '/apropos', label: t('header.about') },
    { href: '/expertise', label: t('header.expertises') },
    { href: '/projets', label: t('header.projects') },
    { href: '/clients', label: t('header.clients') },
    { href: '/mon-projet', label: t('header.my_project') },
    { href: '/blog', label: t('header.blog') },
    { href: '/nous-suivre', label: t('header.follow_us') },
    { href: '/lexique', label: t('header.glossary') },
    { href: '/moyens-techniques', label: t('header.technical') },
    { href: '/faq', label: t('header.faq') },
    { href: '/contact', label: t('header.contact') },
    { href: '/mentions-legales', label: t('legal_pages.mentions.title') },
    { href: '/vieprivee', label: t('legal_pages.privacy.title') },
    { href: '/privacy', label: t('legal_pages.cookies.title') },
  ];


  return (
    <div className="container py-section">
      <PageHeader 
        title={t('header.sitemap')} 
        subtitle={t('header.sitemap_subtitle')}
      />

      <MotionSection style={{ marginTop: '3rem' }}>
        <GlassCard style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {links.map((link) => (
              <li key={link.href} style={{ marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: link.href === links[links.length - 1].href ? 'none' : '1px solid #f1f5f9' }}>
                <Link 
                  href={link.href} 
                  style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ color: 'var(--secondary-color)' }}>→</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </GlassCard>
      </MotionSection>
    </div>
  );
}
