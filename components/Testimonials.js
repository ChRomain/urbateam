'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { MapPin, Quote, ExternalLink, Star } from 'lucide-react';
import styles from './Testimonials.module.css';
import { useLanguage } from '../context/LanguageContext';

const defaultReviews = [
  {
     id: "1",
     name: "Jean-Luc Charles",
     location: "Plouézec (22)",
     text: "Du début à la fin, notre dossier a été parfaitement géré par les professionnels d’Urbateam. Sur le terrain, le plan a été réalisé de manière très précise et efficace et la communication avec les voisins, lors de la réunion de bornage, a été excellente grâce à Urbateam. Quant au délai entre le début et la fin de notre projet, il a été scrupuleusement respecté. Merci encore pour la pertinence de vos conseils ainsi que pour le suivi de l’ensemble de notre dossier. Grâce à votre équipe, tout s’est très bien déroulé et nous pouvons ainsi finaliser ce projet qui nous tient tant à cœur.",
     rating: 5
  },
  {
     id: "2",
     name: "Patrick Cloatre",
     location: "Saint-Renan (29)",
     text: "Accueil agréable et à l'écoute du client. Intervention rapide et efficace pour faire rectifier une erreur du service du cadastre. Je recommande.",
     rating: 5
  },
  {
     id: "3",
     name: "Christelle Abiven",
     location: "Brest (29)",
     text: "Mon ami et moi avons fait appel à Urbateam et nous sommes ravis. Ils sont de bons conseils, sympas et surtout très professionnels. Merci aux géomètres encore.",
     rating: 5
  }
];

export default function Testimonials() {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [displayedReviews, setDisplayedReviews] = useState(defaultReviews);

  useEffect(() => {
    const loadReviews = async () => {
      let sourceList = [];
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            sourceList = data;
          }
        }
      } catch (e) {
        console.warn('API testimonials fetch error:', e);
      }

      if (sourceList.length === 0) {
        const i18nItems = t('testimonials.items');
        if (Array.isArray(i18nItems) && i18nItems.length > 0) {
          sourceList = i18nItems;
        } else {
          sourceList = defaultReviews;
        }
      }

      // Si plus de 3 avis, tirage au sort de 3 avis aléatoires à chaque visite / refresh
      if (sourceList.length > 3) {
        const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
        setDisplayedReviews(shuffled.slice(0, 3));
      } else {
        setDisplayedReviews(sourceList.slice(0, 3));
      }
    };

    loadReviews();
  }, []);

  const cardClasses = [styles.cardLarge, styles.cardMedium, styles.cardSmall];
  const starFills = ["var(--primary-color)", "var(--accent-color)", "var(--primary-color)"];

  return (
    <section ref={containerRef} className={styles.section}>
      <div className="container">
        
        {/* Asymmetric Header */}
        <div className={styles.flexHeader}>
          <motion.div 
            className={styles.headerText}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.title}>
              <svg width="20" height="20" viewBox="0 0 48 48" className={styles.googleIcon}>
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
            className={styles.headerCta}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a 
              href="https://www.google.com/search?q=urbateam+avis+google&rlz=1C5AJCO_enFR1193FR1193&oq=urbateam+avis+google&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDY2NDFqMGo3qAIIsAIB8QXQTwjN9Yg59PEF0E8IzfWIOfQ&sourceid=chrome&ie=UTF-8#lrd=0x481697c895ec95bb:0x4bc856ec49e1d12a,1,,,," 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`btn btn-outline ${styles.googleBtn}`}
            >
              <span>{t('testimonials.cta')}</span>
              <ExternalLink size={14} className={styles.ctaIcon} />
            </a>
          </motion.div>
        </div>

        {/* Dynamic Asymmetric Bento Grid of testimonials */}
        {displayedReviews.length > 0 && (
          <div className={styles.bentoGrid}>
            {displayedReviews.map((rev, idx) => {
              const ratingCount = Math.min(5, Math.max(1, rev.rating || 5));
              const cardClass = cardClasses[idx] || styles.cardMedium;
              const starFill = starFills[idx] || "var(--primary-color)";

              return (
                <motion.div 
                  key={rev.id || `rev-${idx}`}
                  className={`${styles.bentoCard} ${cardClass}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
                  whileHover={{ y: -5 }}
                >
                  <Quote className={styles.quoteBg} size={idx === 0 ? 120 : 80} />
                  
                  <div className={styles.cardHeader}>
                    <div className={styles.ratingStars}>
                      {[...Array(ratingCount)].map((_, i) => (
                        <Star key={`star-${idx}-${i}`} size={16} fill={starFill} stroke="none" />
                      ))}
                    </div>
                  </div>

                  <p className={styles.reviewText}>
                    &ldquo;{rev.text}&rdquo;
                  </p>

                  <div className={styles.cardFooter}>
                    <div className={styles.authorBox}>
                      <h4 className={styles.authorName}>{rev.name}</h4>
                      <span className={styles.sourceText}>{t('testimonials.source')}</span>
                    </div>
                    {rev.location && (
                      <div className={styles.locationTag}>
                        <MapPin size={12} />
                        <span>{rev.location}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
