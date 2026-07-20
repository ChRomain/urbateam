'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './References.module.css';
import { useLanguage } from '../context/LanguageContext';
import Link from './Link';

const defaultPlaceholders = [
  { id: 'placeholder-1', name: 'Brest Métropole', logo: '/pictures/logo-client-1.png' },
  { id: 'placeholder-2', name: 'Finistère Le Département', logo: '/pictures/logo-client-2.png' },
  { id: 'placeholder-3', name: 'Région Bretagne', logo: '/pictures/logo-client-3.png' },
  { id: 'placeholder-4', name: 'Logeo', logo: '/pictures/logo-client-4.png' }
];

export default function References({ clients = [] }) {
  const { t } = useLanguage();
  const referenceList = t('references.items') || [];

  const displayClients = [...clients];
  if (displayClients.length < 4) {
    const missingCount = 4 - displayClients.length;
    for (let i = 0; i < missingCount; i++) {
      displayClients.push(defaultPlaceholders[i]);
    }
  }

  return (
    <section className={`container ${styles.section}`}>
      <motion.div 
        className={`glass-card ${styles.refListCard}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '6rem' }}
      >
        <h3 className={styles.refTitle}>{t('references.list_title')}</h3>
        <div className={styles.refListGrid}>
          {Array.isArray(referenceList) && referenceList.map((ref, idx) => (
            <Link key={`ref-${idx}`} href="/projets" className={styles.refItem}>
              <svg className={styles.refIcon} width="20" height="20" fill="var(--accent-color)" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className={styles.refText}>{ref}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Ils nous font confiance (Slider Automatique Infini) */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2>{t('references.title')}</h2>
        <p className={styles.subtitle}>
          {t('references.subtitle')}
        </p>
      </motion.div>

      <div className={styles.sliderContainer} style={{ marginBottom: 0 }}>
        <motion.div 
          className={styles.sliderTrack}
          style={{ willChange: 'transform' }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            ease: "linear", 
            duration: 40, 
            repeat: Infinity 
          }}
        >
          {displayClients.concat(displayClients).concat(displayClients).map((client, idx) => (
            <Link key={`logo-${client.id}-${idx}`} href="/clients-et-partenaires" className={styles.logoItem}>
              <div className={`glass-card ${styles.logoCard}`}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {client.logo ? (
                    <Image 
                      src={client.logo} 
                      alt={client.name} 
                      fill
                      sizes="(max-width: 768px) 150px, 200px"
                      loading="lazy"
                      style={{ objectFit: 'contain' }}
                      className={styles.clientLogo}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-light)', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
                      {client.name}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
