'use client';

import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Map, Ruler, Droplets, Trophy, Compass, CheckCircle2, Layers } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';

const iconMap = {
  bornage: <Ruler size={48} />,
  division: <Compass size={48} />,
  copropriete: <Layers size={48} />,
  lotissement: <Map size={48} />,
  urbanisme: <Map size={48} />,
  vrd: <Droplets size={48} />,
  sport: <Trophy size={48} />,
  topographie: <Compass size={48} />,
  geometre: <Ruler size={48} />
};

const slugImageMap = {
  bornage: { src: '/pictures/geometre-bornage.png', alt: 'Bornage et Limites de Propriété URBATEAM', badge: 'Sécurité Juridique & Bornage', desc: 'Seul professionnel habilité à définir vos limites de propriété avec une valeur juridique incontestable.' },
  division: { src: '/pictures/topographie-final.png', alt: 'Division Parcellaire URBATEAM', badge: 'Division Parcellaire & Cadastre', desc: 'Création de terrains à bâtir et documents de modification du parcellaire cadastral (DMPC).' },
  copropriete: { src: '/pictures/bim-3d-scan.png', alt: 'Copropriété et Division en Volumes URBATEAM', badge: 'Système Scan-to-BIM & Copropriété', desc: 'Nos relevés par scanner laser 3D permettent une modélisation millimétrée pour une gestion digitale de vos bâtiments.' },
  lotissement: { src: '/pictures/lotissement-pro.png', alt: 'Aménagement de Lotissements URBATEAM', badge: 'Aménagement de Lotissements & Éco-quartiers', desc: 'Accompagnement global de la conception à la maîtrise d’œuvre des voiries et réseaux (VRD).' },
  urbanisme: { src: '/pictures/urbanisme-bureau.png', alt: 'Urbanisme et Paysage URBATEAM', badge: 'Expertise & Planification Urbaine', desc: 'Analyse rigoureuse et conception de projets d\'aménagement ancrés dans la réalité de vos territoires.' },
  vrd: { src: '/pictures/vrd-ingenierie.png', alt: 'Maîtrise d’œuvre et VRD URBATEAM', badge: 'Infrastructures & Réseaux VRD', desc: 'Conception technique et dimensionnement optimisé des réseaux et de la voirie pour vos projets.' },
  sport: { src: '/pictures/sport-ingenierie.png', alt: 'Ingénierie Sportive URBATEAM', badge: 'Homologation & Topométrie Sportive', desc: 'Expertise pointue dans le traçage et le contrôle géométrique des infrastructures sportives.' },
  topographie: { src: '/pictures/topographie-pro.png', alt: 'Relevé Topographique de Précision URBATEAM', badge: 'Précision Centimétrique & Levés', desc: 'Nos stations totales robotisées et récepteurs GPS de pointe garantissent une fiabilité absolue de vos relevés de terrain.' },
  geometre: { src: '/pictures/geometre-foncier-v2.png', alt: 'Géomètre-Expert Foncier URBATEAM', badge: 'Expertise Foncière & Juridique', desc: 'Analyse foncière, étude des servitudes, droits de passage et délimitation de la propriété.' }
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
            <p 
              style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '3rem', color: 'var(--text-main)' }}
              dangerouslySetInnerHTML={{ __html: expertise.longDesc || expertise.desc }}
            />

            {slugImageMap[slug] && (
              <div style={{ 
                width: '100%', 
                height: '450px', 
                borderRadius: 'var(--border-radius-lg)', 
                overflow: 'hidden', 
                position: 'relative',
                marginBottom: '3rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <img 
                  src={t(`expertise.items.${slug}.image`) || slugImageMap[slug].src} 
                  alt={slugImageMap[slug].alt} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2.5rem',
                  zIndex: 3
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color, #10b981)', boxShadow: '0 0 10px var(--accent-color, #10b981)' }}></span>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {slugImageMap[slug].badge}
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '550px', margin: 0 }}>
                      {slugImageMap[slug].desc}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <h3 style={{ marginBottom: '2rem' }}>Nos missions types</h3>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {(expertise.missions || [1, 2, 3, 4]).map((mission, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
                  <CheckCircle2 className="text-primary" size={24} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: 'var(--secondary-color)', marginBottom: '0.2rem' }}>
                      {mission.title || `Mission spécialisée ${mission}`}
                    </h4>
                    <p 
                      style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}
                      dangerouslySetInnerHTML={{ __html: mission.desc || "Accompagnement rigoureux et expertise technique de pointe pour garantir la conformité et la pérennité de vos aménagements." }}
                    />
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
