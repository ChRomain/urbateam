'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <h3 className={styles.title}>URBATEAM</h3>
          <p className={styles.brandText} style={{ fontSize: '0.9rem', lineHeight: '1.8', maxWidth: '300px' }}>
            {t('footer.brand_text')}
          </p>
          <div className={styles.socialList}>
            {/* ... Social icons ... */}
            <a href="https://www.instagram.com/urbateam29_/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/urbateam/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
            </a>
            <a href="https://www.facebook.com/urbateam" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className={styles.title}>{t('footer.agencies')}</h3>
          <ul className={`footer-links ${styles.linksList}`} style={{ fontSize: '0.9rem' }}>
            <li><strong>Saint-Renan (Brest)</strong><br />10 Rue Joseph le Velly</li>
            <li style={{ marginTop: '1rem' }}><strong>Douarnenez</strong><br />5 r Breiz Izel Za Ste Croix</li>
          </ul>
        </div>
        <div>
          <h3 className={styles.title}>{t('footer.resources')}</h3>
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
            <ul className={`footer-links ${styles.linksList}`} style={{ fontSize: '0.9rem' }}>
              <li><Link href="/projets">{t('footer.projects')}</Link></li>
              <li><Link href="/clients">{t('footer.clients')}</Link></li>
              <li><Link href="/nous-suivre">{t('footer.follow_us')}</Link></li>
              <li><Link href="/blog">{t('header.blog')}</Link></li>
              <li><Link href="/lexique">{t('footer.glossary')}</Link></li>
              <li><Link href="/plan-du-site">{t('header.sitemap')}</Link></li>
              <li><Link href="/mentions-legales">{t('footer.legal')}</Link></li>
              <li><Link href="/vieprivee">{t('footer.privacy')}</Link></li>
              <li><Link href="/privacy">{t('footer.cookies')}</Link></li>
            </ul>
            <div className={styles.partnersColumn}>
              <a href="https://www.geometre-expert.fr/" target="_blank" rel="noopener noreferrer" className={styles.partnerLogo}>
                <img src="/pictures/ordre_geometre.png" alt="Ordre des Géomètres-Experts" height="28" />
              </a>
              <a href="https://www.unge.net/" target="_blank" rel="noopener noreferrer" className={styles.partnerLogo}>
                <img src="/pictures/ungee.png" alt="UNGE" height="28" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Intervention Zones */}
      <div className={styles.seoZones}>
        <div className="container">
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
            <strong>Zones d'intervention :</strong> Saint-Renan, Brest, Douarnenez, Saint-Urbain, Landerneau, Plouzané, Guilers, Locmaria-Plouzané, Daoulas, et sur toute la Bretagne-Ouest.
          </p>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          &copy; {new Date().getFullYear()} URBATEAM SARL. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
