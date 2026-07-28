'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './Values.module.css';
import { useLanguage } from '../context/LanguageContext';

// Scales of Justice Icon (L'éthique professionnelle)
function ScalesIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Central Pillar & Base */}
      <path d="M22 56h20M32 56V18" />
      <circle cx="32" cy="14" r="3" />
      {/* Top Beam */}
      <path d="M12 24c0-2 4-4 20-4s20 2 20 4" />
      <circle cx="32" cy="20" r="1.8" fill={color} />
      {/* Left scale pan & strings */}
      <path d="M12 24l-6 18M12 24l6 18" />
      <path d="M4 42c0 4.5 3.6 8 8 8s8-3.5 8-8H4z" />
      {/* Right scale pan & strings */}
      <path d="M52 24l-6 18M52 24l6 18" />
      <path d="M44 42c0 4.5 3.6 8 8 8s8-3.5 8-8H44z" />
    </svg>
  );
}

// Advice / Speech Bubble Icon (Le conseil)
function AdviceIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Person head & body */}
      <circle cx="25" cy="21" r="8" />
      <circle cx="22.5" cy="20" r="1" fill={color} />
      <circle cx="27.5" cy="20" r="1" fill={color} />
      <path d="M23.5 24.5c1.2.8 2 1 3 0" />
      <path d="M11 50c0-7.5 6-12.5 14-12.5s14 5 14 12.5" />
      {/* Speech bubble */}
      <path d="M37 12h14c3.3 0 6 2.7 6 6v7c0 3.3-2.7 6-6 6h-3.5l-4.5 4.5v-4.5h-6c-3.3 0-6-2.7-6-6v-7c0-3.3 2.7-6 6-6z" />
      <line x1="42" y1="18" x2="52" y2="18" />
      <line x1="42" y1="22" x2="50" y2="22" />
      <line x1="42" y1="26" x2="47" y2="26" />
    </svg>
  );
}

// Precision / Badge Icon (La précision)
function PrecisionIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Scalloped badge seal */}
      <path d="M32 7l3.2 2.8 4.2-1.4 1.9 3.9 4.4 0.5 0.3 4.5 4 2-1.3 4.2 3 3.4-2.7 3.5 1.5 4.1-3.9 2-0.4 4.4-4.4 0.4-2 4-4.2-1.4L32 48.5l-3.2-2.8-4.2 1.4-2-4-4.4-0.4-0.4-4.4-3.9-2 1.5-4.1-2.7-3.5 3-3.4-1.3-4.2 4-2 0.3-4.5 4.4-0.5 1.9-3.9 4.2 1.4L32 7z" />
      {/* Checkmark inside */}
      <path d="M23 27.5l6.5 6.5 11.5-12" strokeWidth="2.8" />
      {/* Ribbons at bottom */}
      <path d="M23 44.5l-5.5 12.5 6.5-2.8 4.5 2.8v-9" />
      <path d="M41 44.5l5.5 12.5-6.5-2.8-4.5 2.8v-9" />
    </svg>
  );
}

// Teamwork Icon (L'esprit d'équipe)
function TeamIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Center person */}
      <circle cx="32" cy="19" r="6.5" />
      <path d="M32 12.5c-2.3 0-4.2 1.3-4.8 3.2" />
      <circle cx="30.2" cy="19" r="0.9" fill={color} />
      <circle cx="33.8" cy="19" r="0.9" fill={color} fillOpacity="0.8" />
      <path d="M30 22c1.2.8 2.8.8 4 0" />
      <path d="M22 43c0-6 4.5-10 10-10s10 4 10 10" />

      {/* Left person */}
      <circle cx="17" cy="23" r="5.5" />
      <circle cx="15.5" cy="23" r="0.8" fill={color} />
      <circle cx="18.5" cy="23" r="0.8" fill={color} />
      <path d="M9 45c0-4.8 3.8-8.5 8.5-8.5 2.2 0 4.2.8 5.7 2.2" />

      {/* Right person with glasses */}
      <circle cx="47" cy="23" r="5.5" />
      <circle cx="44.5" cy="22.5" r="1.8" />
      <circle cx="49.5" cy="22.5" r="1.8" />
      <line x1="46.3" y1="22.5" x2="47.7" y2="22.5" />
      <path d="M55 45c0-4.8-3.8-8.5-8.5-8.5-2.2 0-4.2.8-5.7 2.2" />
    </svg>
  );
}

export default function Values() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const valuesData = [
    {
      key: 'ethique',
      title: t('values.items.ethique.title'),
      desc: t('values.items.ethique.desc'),
      circleClass: styles.circleBeige,
      iconColor: '#3c3c3c',
      Icon: ScalesIcon,
    },
    {
      key: 'conseil',
      title: t('values.items.conseil.title'),
      desc: t('values.items.conseil.desc'),
      circleClass: styles.circleLightGreen,
      iconColor: '#3c3c3c',
      Icon: AdviceIcon,
    },
    {
      key: 'precision',
      title: t('values.items.precision.title'),
      desc: t('values.items.precision.desc'),
      circleClass: styles.circleBeige,
      iconColor: '#3c3c3c',
      Icon: PrecisionIcon,
    },
    {
      key: 'equipe',
      title: t('values.items.equipe.title'),
      desc: t('values.items.equipe.desc'),
      circleClass: styles.circleDarkGreen,
      iconColor: '#ffffff',
      Icon: TeamIcon,
    },
  ];

  return (
    <section ref={sectionRef} className={styles.valuesSection}>
      <div className={styles.bannerContainer}>
        <motion.div
          className={styles.titleBanner}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className={styles.titleText}>{t('values.title')}</h2>
        </motion.div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {valuesData.map((item, index) => {
            const { Icon } = item;
            return (
              <motion.div
                key={item.key}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
              >
                <div className={`${styles.circle} ${item.circleClass}`}>
                  <div className={styles.iconWrapper}>
                    <Icon color={item.iconColor} />
                  </div>
                  <h3 className={styles.circleTitle}>{item.title}</h3>
                </div>
                <p className={styles.description}>{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
