'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Map, Ruler, Droplets, Trophy, Compass, ArrowRight } from 'lucide-react';
import styles from './Expertise.module.css';
import { useLanguage } from '../context/LanguageContext';

function GlassCard({ children, variants, className = "" }) {
// ... (Logic stays the same) ...
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className={`glass-card ${className}`}
      variants={variants}
      onMouseMove={onMouseMove}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: -2,
          zIndex: 0,
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}

const expertiseItems = [
  { key: 'urbanisme', icon: <Map className={styles.icon} size={32} /> },
  { key: 'geometre', icon: <Ruler className={styles.icon} size={32} /> },
  { key: 'vrd', icon: <Droplets className={styles.icon} size={32} /> },
  { key: 'sport', icon: <Trophy className={styles.icon} size={32} /> },
  { key: 'topographie', icon: <Compass className={styles.icon} size={32} /> }
];

const containerVariants = {
// ...
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

export default function Expertise() {
  const { t } = useLanguage();

  return (
    <section className={`container ${styles.section}`}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>{t('expertise.title')}</h2>
        <p className={styles.subtitle}>
          {t('expertise.subtitle')}
        </p>
      </motion.div>

      <motion.div 
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {expertiseItems.map((item) => (
          <GlassCard 
            key={item.key} 
            variants={cardVariants}
          >
            <div className={styles.iconWrapper}>
              {item.icon}
            </div>
            <h3 className={styles.cardTitle}>{t(`expertise.items.${item.key}.title`)}</h3>
            <p>{t(`expertise.items.${item.key}.desc`)}</p>
          </GlassCard>
        ))}

        <GlassCard 
          key="contact-card"
          className={styles.contactCard}
          variants={cardVariants}
        >
          <h3>{t('expertise.cta_title')}</h3>
          <p className={styles.contactText}>{t('expertise.cta_desc')}</p>
          <Link href="/contact" className={`btn btn-primary ${styles.contactBtn}`}>
            {t('expertise.cta_btn')} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
        </GlassCard>
      </motion.div>
    </section>
  );
}
