'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Map, Ruler, Droplets, Trophy, Compass, Layers, ArrowRight, Crosshair, Check } from 'lucide-react';
import styles from './Expertise.module.css';
import { useLanguage } from '../context/LanguageContext';
import Magnetic from './Magnetic';

const expertiseItems = [
  { key: 'urbanisme', index: '01', icon: <Map size={20} />, image: '/pictures/urbanisme-bureau.png' },
  { key: 'geometre', index: '02', icon: <Ruler size={20} />, image: '/pictures/geometre-bornage.png' },
  { key: 'vrd', index: '03', icon: <Droplets size={20} />, image: '/pictures/vrd-ingenierie.png' },
  { key: 'sport', index: '04', icon: <Trophy size={20} />, image: '/pictures/sport-ingenierie.png' },
  { key: 'topographie', index: '05', icon: <Compass size={20} />, image: '/pictures/topographie-final.png' },
  { key: 'copropriete', index: '06', icon: <Layers size={20} />, image: '/pictures/bim-3d-scan.png' }
];

export default function Expertise() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('urbanisme');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const activeItem = expertiseItems.find(item => item.key === activeTab);

  // Safely retrieve array of missions from translations
  const activeMissions = t(`expertise.items.${activeTab}.missions`) || [];

  return (
    <section ref={sectionRef} className={`section-dark ${styles.section}`}>
      {/* Background blueprint grid overlay */}
      <div className={styles.gridOverlay} aria-hidden="true" />

      <div className="container">
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className={styles.techLabel}>[ CATALOGUE SYSTÉMIQUE ]</span>
          <h2 className={styles.title}>{t('expertise.title')}</h2>
          <p className={styles.subtitle}>{t('expertise.subtitle')}</p>
        </motion.div>

        {/* Blueprint Split Reader */}
        <div className={styles.readerGrid}>
          
          {/* LEFT COLUMN: Asymmetric selector list */}
          <div className={styles.selectorCol}>
            {expertiseItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(item.key)}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span className={styles.tabIndex}>{item.index}</span>
                  <div className={styles.tabText}>
                    <span className={styles.tabTitle}>
                      {t(`expertise.items.${item.key}.title`)}
                    </span>
                    <span className={styles.tabDesc}>
                      {t(`expertise.items.${item.key}.desc`).slice(0, 50)}...
                    </span>
                  </div>
                  
                  {/* Sliding target visée cursor line */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeViserLine"
                      className={styles.activeIndicator}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    >
                      <Crosshair size={14} className={styles.indicatorCross} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Interactive Blueprint Viewer */}
          <div className={styles.viewerCol}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className={styles.blueprintCard}
                initial={{ opacity: 0, scale: 0.98, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Tech Blueprint Frame details */}
                <div className={styles.blueprintHeader}>
                  <div className={styles.bulletGroup}>
                    <span className={styles.bulletBlue} />
                    <span className={styles.bulletText}>READER_MODE // ACTIVE: {activeItem.index}</span>
                  </div>
                  <span className={styles.coordLabel}>[ GPS: 48°26'N 4°37'W ]</span>
                </div>

                <div className={styles.blueprintBody}>
                  {/* Photo & Vector superposition */}
                  <div className={styles.visualCanvas}>
                    <div className={styles.blueprintImageWrapper}>
                      <Image 
                        src={activeItem.image} 
                        alt={t(`expertise.items.${activeTab}.title`)}
                        fill
                        sizes="(max-width: 1024px) 100vw, 550px"
                        style={{ objectFit: 'cover' }}
                        className={styles.blueprintImage}
                      />
                    </div>
                    {/* SVG Blueprint grids superposed */}
                    <div className={styles.blueprintLinesOverlay}>
                      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
                        <line x1="0" y1="10" x2="100" y2="10" />
                        <line x1="0" y1="50" x2="100" y2="50" />
                        <line x1="0" y1="90" x2="100" y2="90" />
                        <line x1="10" y1="0" x2="10" y2="100" />
                        <line x1="50" y1="0" x2="50" y2="100" />
                        <line x1="90" y1="0" x2="90" y2="100" />
                        <circle cx="50" cy="50" r="40" strokeDasharray="2 2" />
                      </svg>
                    </div>
                  </div>

                  {/* Rich details */}
                  <div className={styles.detailsContent}>
                    <h3 className={styles.blueprintTitle}>
                      {t(`expertise.items.${activeTab}.title`)}
                    </h3>
                    <p 
                      className={styles.blueprintLongDesc}
                      dangerouslySetInnerHTML={{ __html: t(`expertise.items.${activeTab}.longDesc`) }}
                    />

                    {/* Missions list */}
                    {activeMissions.length > 0 && (
                      <div className={styles.missionsBox}>
                        <span className={styles.missionsTitle}>MISSIONS CLÉS :</span>
                        <div className={styles.missionsList}>
                          {activeMissions.slice(0, 3).map((mission, index) => (
                            <div key={`mission-${index}`} className={styles.missionItem}>
                              <div className={styles.checkIcon}>
                                <Check size={12} strokeWidth={3} />
                              </div>
                              <div className={styles.missionTexts}>
                                <strong className={styles.missionTitle}>{mission.title}</strong>
                                <span className={styles.missionDesc}>{mission.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.actionRow}>
                      <Magnetic strength={0.15}>
                        <Link href={`/expertise/${activeTab}`} className={`btn btn-primary ${styles.learnMoreBtn}`}>
                          {t('common.learn_more')}
                          <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                        </Link>
                      </Magnetic>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic bottom banner */}
        <motion.div
          className={styles.contactBanner}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.contactContent}>
            <div className={styles.contactInfo}>
              <Crosshair size={24} className={styles.crosshairIcon} />
              <div>
                <h3>{t('expertise.cta_title')}</h3>
                <p>{t('expertise.cta_desc')}</p>
              </div>
            </div>
            <Magnetic strength={0.2}>
              <Link href="/contact" className={`btn btn-primary ${styles.bannerBtn}`}>
                {t('expertise.cta_btn')}
                <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
