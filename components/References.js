'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './References.module.css';
import { useLanguage } from '../context/LanguageContext';

// Liste étendue pour le slider automatique
const clientLogos = [1, 2, 3, 4, 1, 2, 3, 4]; 

export default function References() {
  const { t } = useLanguage();
  const referenceList = t('references.items') || [];

  return (
    <section className={`container ${styles.section}`}>
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

      {/* Slider Automatique Infini */}
      <div className={styles.sliderContainer}>
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
          {clientLogos.concat(clientLogos).concat(clientLogos).map((num, idx) => (
            <div key={`logo-${num}-${idx}`} className={styles.logoItem}>
              <div key={`logo-card-${num}-${idx}`} className={`glass-card ${styles.logoCard}`}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image 
                    src={`/pictures/logo-client-${num}.png`} 
                    alt={`Logo Client ${num}`} 
                    fill
                    sizes="(max-width: 768px) 150px, 200px"
                    loading="lazy"
                    style={{ objectFit: 'contain' }}
                    className={styles.clientLogo}
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Liste des références détaillée */}
      <motion.div 
        className={`glass-card ${styles.refListCard}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className={styles.refTitle}>{t('references.list_title')}</h3>
        <div className={styles.refListGrid}>
          {Array.isArray(referenceList) && referenceList.map((ref, idx) => (
            <div key={`ref-${idx}`} className={styles.refItem}>
              <svg className={styles.refIcon} width="20" height="20" fill="var(--accent-color)" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className={styles.refText}>{ref}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
