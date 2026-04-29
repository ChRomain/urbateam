'use client';

import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Map, Ruler, Droplets, Trophy, Compass, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';

const iconMap = {
  urbanisme: <Map size={48} />,
  geometre: <Ruler size={48} />,
  vrd: <Droplets size={48} />,
  sport: <Trophy size={48} />,
  topographie: <Compass size={48} />
};

export default function ExpertiseClient({ slug }) {
  const { t } = useLanguage();

  const expertise = t(`expertise.items.${slug}`);
  
  if (!expertise || typeof expertise === 'string') {
    return (
      <div className="container py-section text-center">
        <h1>404</h1>
        <p>Expertise non trouvée</p>
        <Link href="/" className="btn btn-primary mt-4">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <main>
      <PageHeader 
        title={expertise.title} 
        subtitle={expertise.desc}
      />

      <section className="container py-section">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '4rem', 
          alignItems: 'start' 
        }}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ position: 'sticky', top: '120px' }}
          >
            <div style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>
              {iconMap[slug] || <Map size={48} />}
            </div>
            <h3 style={{ marginBottom: '1rem' }}>{expertise.title}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              {expertise.desc}
            </p>
            <Link href="/contact" className="btn btn-primary mt-4" style={{ width: '100%' }}>
              Demander un devis
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{ marginBottom: '1rem' }}>Notre Expertise en {expertise.title}</h2>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '3rem', color: 'var(--text-main)' }}>
              {expertise.longDesc || expertise.desc}
            </p>

            <h3 style={{ marginBottom: '2rem' }}>Nos missions types</h3>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {(expertise.missions || [1, 2, 3, 4]).map((mission, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
                  <CheckCircle2 className="text-primary" size={24} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: 'var(--secondary-color)', marginBottom: '0.2rem' }}>
                      {mission.title || `Mission spécialisée ${mission}`}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                      {mission.desc || "Accompagnement rigoureux et expertise technique de pointe pour garantir la conformité et la pérennité de vos aménagements."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4" style={{ marginTop: '4rem', padding: '3rem', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--border-radius-lg)', color: 'white' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Pourquoi choisir URBATEAM ?</h3>
              <p style={{ opacity: 0.9, marginBottom: '2rem' }}>
                Notre approche pluridisciplinaire nous permet d'appréhender chaque projet dans sa globalité. En tant que Géomètres-Experts, nous garantissons la sécurité juridique de vos fonciers tout en apportant une vision d'urbaniste et une rigueur d'ingénieur VRD.
              </p>
              <Link href="/apropos" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
                Découvrir notre démarche qualité
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-dark py-section">
        <div className="container text-center">
          <h2 style={{ color: 'white', marginBottom: '2rem' }}>Un projet en {expertise.title} ?</h2>
          <p style={{ color: 'var(--beige)', maxWidth: '700px', margin: '0 auto 3rem' }}>
            Nos experts basés à Saint-Renan et Douarnenez interviennent sur toute la Bretagne-Ouest pour vous conseiller.
          </p>
          <Link href="/contact" className="btn btn-primary">Nous contacter</Link>
        </div>
      </section>
    </main>
  );
}
