'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './Values.module.css';
import { useLanguage } from '../context/LanguageContext';

// Scales of Justice Icon (L'éthique professionnelle)
function ScalesIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 64 64" width="58" height="58" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg viewBox="0 0 64 64" width="58" height="58" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Person head & shoulders */}
      <circle cx="19" cy="23" r="7" />
      <circle cx="17" cy="22" r="1" fill={color} />
      <circle cx="21" cy="22" r="1" fill={color} />
      <path d="M17.8 25.8c.8.6 1.6.6 2.4 0" />
      <path d="M7 49c0-6.5 5.4-11 12-11s12 4.5 12 11" />
      {/* Speech bubble - detached with breathing room */}
      <path d="M35 10h16c3 0 5.5 2.5 5.5 5.5v7c0 3-2.5 5.5-5.5 5.5h-4l-4.5 4.5v-4.5h-1.5c-3 0-5.5-2.5-5.5-5.5v-7c0-3 2.5-5.5 5.5-5.5z" />
      <line x1="40" y1="16" x2="50" y2="16" />
      <line x1="40" y1="20" x2="47" y2="20" />
    </svg>
  );
}

// Precision / Badge Icon (La précision)
function PrecisionIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 64 64" width="58" height="58" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg viewBox="0 0 64 64" width="58" height="58" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Center person */}
      <circle cx="32" cy="19" r="8" />
      <path d="M32 11c-2.8 0-5 1.5-5.8 3.8" />
      <circle cx="29.2" cy="18.5" r="1.4" fill={color} />
      <circle cx="34.8" cy="18.5" r="1.4" fill={color} />
      <path d="M29.5 22.5c1.4 1.2 3.6 1.2 5 0" />
      <path d="M20 44c0-7 5.4-11.5 12-11.5s12 4.5 12 11.5" />

      {/* Left person */}
      <circle cx="15" cy="24" r="6.5" />
      <circle cx="13.2" cy="23.5" r="1.2" fill={color} />
      <circle cx="16.8" cy="23.5" r="1.2" fill={color} />
      <path d="M13.2 27c1 .8 2.5 .8 3.5 0" />
      <path d="M6 46c0-5.5 4-9.5 9-9.5 2.5 0 4.8 1 6.3 2.6" />

      {/* Right person with glasses */}
      <circle cx="49" cy="24" r="6.5" />
      <circle cx="46.3" cy="23.5" r="2.2" strokeWidth="2" />
      <circle cx="51.7" cy="23.5" r="2.2" strokeWidth="2" />
      <line x1="48.5" y1="23.5" x2="49.5" y2="23.5" />
      <path d="M47.2 27c1 .8 2.5 .8 3.5 0" />
      <path d="M58 46c0-5.5-4-9.5-9-9.5-2.5 0-4.8 1-6.3 2.6" />
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
