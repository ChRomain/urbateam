'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import styles from './Testimonials.module.css';
import { useLanguage } from '../context/LanguageContext';

function GlassCard({ children, variants, className = "" }) {
// ... (rest of GlassCard same)
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
      whileHover={{ y: -5 }}
      style={{
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: -2,
          zIndex: 0,
          background: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </motion.div>
  );
}

const reviews = [
  {
     name: "jean luc Charles",
     text: "Du début à la fin, notre dossier a été parfaitement géré par les professionnels d’Urbateam. Sur le terrain, le plan a été réalisé de manière très précise et efficace et la communication avec les voisins, lors de la réunion de bornage, a été excellente grâce à Urbateam. Quant au délai entre le début et la fin de notre projet, il a été scrupuleusement respecté. Merci encore pour la pertinence de vos conseils ainsi que pour le suivi de l’ensemble de notre dossier. Grâce à votre équipe, tout s’est très bien déroulé et nous pouvons ainsi finaliser ce projet qui nous tient tant à cœur."
  },
  {
     name: "Patrick Cloatre",
     text: "Accueil agréable et à l'écoute du client. Intervention rapide et efficace pour faire rectifier une erreur du service du cadastre. Je recommande."
  },
  {
     name: "Christelle Abiven",
     text: "Mon ami et moi avons fait appel à Urbateam et nous sommes ravis. Ils sont de bons conseils, sympas et surtout très professionnels. Merci aux géomètres encore."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className={`container ${styles.section}`}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className={styles.title}>
          <svg width="32" height="32" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {t('testimonials.title')}
        </h2>
        <p className={styles.subtitle}>
          {t('testimonials.subtitle')}
        </p>
      </motion.div>

      <motion.div 
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {reviews.map((review) => (
          <GlassCard 
            key={review.name.toLowerCase().replace(/\s+/g, '-')} 
            variants={cardVariants}
            className={styles.bubbleCard}
          >
            <div className={styles.stars}>
              {[...Array(5)].map((_, j) => (
                <svg key={`star-${j}`} width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className={styles.reviewText}>"{review.text}"</p>
            {review.text.length > 200 && (
              <a 
                href="https://www.google.com/search?q=urbateam+avis+google" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.readMore}
              >
                ...
              </a>
            )}
            <h4 className={styles.author}>{review.name}</h4>
            <span className={styles.source}>{t('testimonials.source')}</span>
          </GlassCard>
        ))}
      </motion.div>
      
      <motion.div 
        className={styles.footer}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        <a 
          href="https://www.google.com/search?q=urbateam+avis+google&rlz=1C5AJCO_enFR1193FR1193&oq=urbateam+avis+google&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDY2NDFqMGo3qAIIsAIB8QXQTwjN9Yg59PEF0E8IzfWIOfQ&sourceid=chrome&ie=UTF-8#lrd=0x481697c895ec95bb:0x4bc856ec49e1d12a,1,,,," 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`btn btn-outline ${styles.exploreBtn}`}
        >
          {t('testimonials.cta')}
        </a>
      </motion.div>
    </section>
  );
}
