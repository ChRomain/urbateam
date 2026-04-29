'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import styles from './Stats.module.css';
import { useLanguage } from '../context/LanguageContext';

function Counter({ value, suffix = "" }) {
// ...
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Math.round(latest).toLocaleString() + suffix;
          }
        }
      });
      return controls.stop;
    }
  }, [isInView, motionValue, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function Stats() {
  const { t } = useLanguage();

  const containerVariants = {
// ...
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className={styles.statsContainer}>
      <motion.div 
        className={`container ${styles.inner}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className={styles.grid}>
          <motion.div className={styles.statItem} variants={itemVariants}>
            <div className={`stat-number ${styles.number}`} style={{ color: 'var(--primary-color)' }}>
              <Counter value={2007} />
            </div>
            <div className={styles.label}>{t('stats.creation.label')}</div>
            <div className={styles.description}>{t('stats.creation.desc')}</div>
          </motion.div>
          <motion.div className={styles.statItemMiddle} variants={itemVariants}>
            <div className={`stat-number ${styles.number}`} style={{ color: 'var(--secondary-color)' }}>
              <Counter value={19} />
            </div>
            <div className={styles.label}>{t('stats.collaborators.label')}</div>
            <div className={styles.description}>{t('stats.collaborators.desc')}</div>
          </motion.div>
          <motion.div className={styles.statItem} variants={itemVariants}>
            <div className={`stat-number ${styles.number}`} style={{ color: 'var(--accent-color)' }}>
              <Counter value={500} suffix="+" />
            </div>
            <div className={styles.label}>{t('stats.projects.label')}</div>
            <div className={styles.description}>{t('stats.projects.desc')}</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
