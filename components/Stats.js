'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { Compass, Ruler, Award } from 'lucide-react';
import styles from './Stats.module.css';
import { useLanguage } from '../context/LanguageContext';

function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration: 2.2,
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

  return <span ref={ref} className={styles.counterNum}>0{suffix}</span>;
}

const TechnicalRuler = ({ delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className={styles.rulerWrapper}>
      <svg className={styles.rulerSvg} viewBox="0 0 800 20" width="100%" height="20">
        <motion.line 
          x1="0" 
          y1="10" 
          x2="800" 
          y2="10" 
          stroke="var(--primary-color)" 
          strokeWidth="0.75" 
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, delay, ease: "easeInOut" }}
        />
        {[...Array(41)].map((_, i) => {
          const x = i * 20;
          const isMajor = i % 5 === 0;
          const isDoubleMajor = i % 10 === 0;
          const height = isDoubleMajor ? 14 : isMajor ? 8 : 4;
          const y1 = 10 - height / 2;
          const y2 = 10 + height / 2;

          return (
            <motion.line
              key={`tick-${i}`}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke={isDoubleMajor ? "var(--accent-color)" : "var(--primary-color)"}
              strokeWidth={isDoubleMajor ? "1.25" : "0.75"}
              opacity={isDoubleMajor ? "0.6" : "0.25"}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={isInView ? { scaleY: 1, opacity: isDoubleMajor ? 0.6 : 0.25 } : {}}
              transition={{ duration: 0.5, delay: delay + (i * 0.02), ease: "easeOut" }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default function Stats() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div ref={sectionRef} className={styles.statsContainer}>
      {/* Background Orientation Circle */}
      <div className={styles.compassFiligree} aria-hidden="true">
        <svg viewBox="0 0 200 200" width="100%" height="100%" stroke="rgba(121, 160, 129, 0.03)" fill="none" strokeWidth="0.5">
          <circle cx="100" cy="100" r="90" />
          <circle cx="100" cy="100" r="70" strokeDasharray="2 2" />
          <line x1="100" y1="5" x2="100" y2="195" />
          <line x1="5" y1="100" x2="195" y2="100" />
          <text x="96" y="20" fill="rgba(121, 160, 129, 0.15)" fontSize="10" fontFamily="monospace">N</text>
          <text x="180" y="103" fill="rgba(121, 160, 129, 0.15)" fontSize="10" fontFamily="monospace">E</text>
          <text x="97" y="190" fill="rgba(121, 160, 129, 0.15)" fontSize="10" fontFamily="monospace">S</text>
          <text x="10" y="103" fill="rgba(121, 160, 129, 0.15)" fontSize="10" fontFamily="monospace">O</text>
        </svg>
      </div>

      <div className={`container ${styles.inner}`}>
        <motion.div 
          className={styles.glassBar}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Surveyor's Spirit Level Bubble visual */}
          <div className={styles.spiritLevel} title="Spirit Level / Niveau d'implantation">
            <span className={styles.levelLine} />
            <span className={styles.levelLineRight} />
            <motion.div 
              className={styles.levelBubble}
              animate={isInView ? { x: [-40, 20, -10, 0] } : {}}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>

          <div className={styles.grid}>
            {/* Stat Item 1 */}
            <div className={styles.statItem}>
              <div className={styles.metaRow}>
                <Award size={16} className={styles.statIcon} style={{ color: 'var(--primary-color)' }} />
                <span className={styles.techCoord}>[ LAT: 48.433 ]</span>
              </div>
              <div className={styles.numberRow}>
                <Counter value={2007} />
              </div>
              <div className={styles.label}>{t('stats.creation.label')}</div>
              <div className={styles.description}>{t('stats.creation.desc')}</div>
              <TechnicalRuler delay={0.1} />
            </div>

            {/* Stat Item 2 */}
            <div className={styles.statItemMiddle}>
              <div className={styles.metaRow}>
                <Compass size={16} className={styles.statIcon} style={{ color: 'var(--accent-color)' }} />
                <span className={styles.techCoord}>[ COMPASS: 270° ]</span>
              </div>
              <div className={styles.numberRow}>
                <Counter value={19} />
              </div>
              <div className={styles.label}>{t('stats.collaborators.label')}</div>
              <div className={styles.description}>{t('stats.collaborators.desc')}</div>
              <TechnicalRuler delay={0.3} />
            </div>

            {/* Stat Item 3 */}
            <div className={styles.statItem}>
              <div className={styles.metaRow}>
                <Ruler size={16} className={styles.statIcon} style={{ color: 'var(--primary-color)' }} />
                <span className={styles.techCoord}>[ ELEV: 142m ]</span>
              </div>
              <div className={styles.numberRow}>
                <Counter value={500} suffix="+" />
              </div>
              <div className={styles.label}>{t('stats.projects.label')}</div>
              <div className={styles.description}>{t('stats.projects.desc')}</div>
              <TechnicalRuler delay={0.5} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
