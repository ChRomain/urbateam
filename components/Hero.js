'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Hero.module.css';
import { useLanguage } from '../context/LanguageContext';

const TopoBackground = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const generatedPoints = [...Array(15)].map((_, i) => ({
      cx: Math.random() * 1000,
      cy: Math.random() * 500,
      duration: 3 + Math.random() * 4
    }));
    setPoints(generatedPoints);
  }, []);

  return (
    <div className={styles.topoWrapper}>
      <svg className={styles.svg} viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Topo lines (simplified) */}
        <motion.path
          d="M0,250 Q250,150 500,250 T1000,250"
          fill="none"
          stroke="rgba(16, 185, 129, 0.3)"
          strokeWidth="1.5"
          animate={{ d: ["M0,250 Q250,150 500,250 T1000,250", "M0,250 Q250,350 500,250 T1000,250", "M0,250 Q250,150 500,250 T1000,250"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M0,350 Q300,250 600,350 T1000,350"
          fill="none"
          stroke="rgba(16, 185, 129, 0.25)"
          strokeWidth="1.5"
          animate={{ d: ["M0,350 Q300,250 600,350 T1000,350", "M0,350 Q300,450 600,350 T1000,350", "M0,350 Q300,250 600,350 T1000,350"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Survey Points */}
        {points.map((pt, i) => (
          <motion.circle
            key={`topo-point-${i}`}
            cx={pt.cx}
            cy={pt.cy}
            r="2.5"
            fill="var(--accent-color)"
            opacity="0.6"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: pt.duration, repeat: Infinity }}
          />
        ))}
      </svg>
    </div>
  );
};

export default function Hero() {
  const targetRef = useRef(null);
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={targetRef} className={styles.hero}>
      <TopoBackground />
      
      <motion.div 
        className={`container ${styles.container}`}
        style={{ y: textY, opacity }}
      >
        <motion.h1 
          className={`hero-title ${styles.title}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {t('hero.title_part1')}<br />{t('hero.title_part2')}
        </motion.h1>
        
        <motion.p 
          className={styles.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ fontSize: '1.25rem', maxWidth: '850px', margin: '0 auto 3rem auto' }}
        >
          {t('hero.description')}
        </motion.p>
        
        <motion.div 
          className={styles.buttons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Link href="/contact" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>{t('hero.cta_contact')}</Link>
          <Link href="/apropos" className={`btn ${styles.btnSecondary}`} style={{ padding: '1rem 2rem' }}>{t('hero.cta_more')}</Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
