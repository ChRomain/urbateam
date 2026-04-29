'use client';

import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Map, Ruler, Droplets, Trophy, Compass, CheckCircle2, Layers } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';

const iconMap = {
  urbanisme: <Map size={48} />,
  geometre: <Ruler size={48} />,
  vrd: <Droplets size={48} />,
  sport: <Trophy size={48} />,
  topographie: <Compass size={48} />,
  copropriete: <Layers size={48} />
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

            {slug === 'copropriete' && (
              <div style={{ 
                width: '100%', 
                height: '450px', 
                borderRadius: 'var(--border-radius-lg)', 
                overflow: 'hidden', 
                position: 'relative',
                marginBottom: '3rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <img 
                  src="/pictures/bim-3d-scan.png" 
                  alt="Visualisation BIM 3D" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                />
                
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(to right, transparent, var(--primary-color), transparent)',
                    boxShadow: '0 0 15px var(--primary-color)',
                    zIndex: 2,
                    opacity: 0.6
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.05) 1px, transparent 0)',
                  backgroundSize: '30px 30px',
                  zIndex: 1
                }} />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2.5rem',
                  zIndex: 3
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', boxShadow: '0 0 10px var(--primary-color)' }}></span>
                      <h4 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Système Scan-to-BIM</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: '500px' }}>
                      Nos relevés par scanner laser 3D permettent une modélisation millimétrée pour une gestion digitale de vos bâtiments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {slug === 'topographie' && (
              <div style={{ 
                width: '100%', 
                height: '450px', 
                borderRadius: 'var(--border-radius-lg)', 
                overflow: 'hidden', 
                position: 'relative',
                marginBottom: '3rem',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: '#f8f8f8',
                border: '1px solid var(--glass-border)'
              }}>
                <img 
                  src="/pictures/topographie-final.png" 
                  alt="Relevé Topographique URBATEAM" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* Subtle Radar/Pulse effect in white */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.5],
                    opacity: [0.3, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeOut" 
                  }}
                  style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    width: '150px',
                    height: '150px',
                    marginLeft: '-75px',
                    marginTop: '-75px',
                    borderRadius: '50%',
                    border: '1px solid white',
                    zIndex: 2
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2.5rem',
                  zIndex: 3
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></span>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Précision Centimétrique</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '500px', margin: 0 }}>
                      Nos stations totales robotisées et récepteurs GPS de pointe garantissent une fiabilité absolue de vos relevés de terrain.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {slug === 'urbanisme' && (
              <div style={{ 
                width: '100%', 
                height: '450px', 
                borderRadius: 'var(--border-radius-lg)', 
                overflow: 'hidden', 
                position: 'relative',
                marginBottom: '3rem',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: '#f8f8f8',
                border: '1px solid var(--glass-border)'
              }}>
                <motion.img 
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                  src="/pictures/urbanisme-bureau.png" 
                  alt="Bureau d'études Urbanisme URBATEAM" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2.5rem',
                  zIndex: 3
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></span>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Expertise & Planification</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '500px', margin: 0 }}>
                      Analyse rigoureuse et conception de projets d'aménagement ancrés dans la réalité de vos territoires.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {slug === 'geometre' && (
              <div style={{ 
                width: '100%', 
                height: '450px', 
                borderRadius: 'var(--border-radius-lg)', 
                overflow: 'hidden', 
                position: 'relative',
                marginBottom: '3rem',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: '#f8f8f8',
                border: '1px solid var(--glass-border)'
              }}>
                <img 
                  src="/pictures/geometre-bornage.png" 
                  alt="Bornage et Foncier URBATEAM" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* Property line animation */}
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: '65%',
                    left: '10%',
                    right: '10%',
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                    zIndex: 2,
                    transformOrigin: 'left'
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2.5rem',
                  zIndex: 3
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffd700' }}></span>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Sécurité Juridique & Bornage</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '500px', margin: 0 }}>
                      Seul professionnel habilité à définir vos limites de propriété avec une valeur juridique incontestable.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {slug === 'vrd' && (
              <div style={{ 
                width: '100%', 
                height: '450px', 
                borderRadius: 'var(--border-radius-lg)', 
                overflow: 'hidden', 
                position: 'relative',
                marginBottom: '3rem',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: '#f8f8f8',
                border: '1px solid var(--glass-border)'
              }}>
                <img 
                  src="/pictures/vrd-ingenierie.png" 
                  alt="Ingénierie VRD URBATEAM" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* Network flow effect */}
                <motion.div 
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    top: '60%',
                    width: '100%',
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(16, 185, 129, 0.4), transparent)',
                    zIndex: 2
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2.5rem',
                  zIndex: 3
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4da3ff' }}></span>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Infrastructures & Réseaux</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '500px', margin: 0 }}>
                      Conception technique et dimensionnement optimisé des réseaux et de la voirie pour vos projets d'aménagement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {slug === 'sport' && (
              <div style={{ 
                width: '100%', 
                height: '450px', 
                borderRadius: 'var(--border-radius-lg)', 
                overflow: 'hidden', 
                position: 'relative',
                marginBottom: '3rem',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: '#f8f8f8',
                border: '1px solid var(--glass-border)'
              }}>
                <img 
                  src="/pictures/sport-ingenierie.png" 
                  alt="Ingénierie Sportive URBATEAM" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* Subtle line drawing effect */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    height: '1px',
                    background: 'rgba(255,255,255,0.4)',
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)',
                    zIndex: 2
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2.5rem',
                  zIndex: 3
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4d4d' }}></span>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Homologation & Topométrie</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '500px', margin: 0 }}>
                      Expertise pointue dans le traçage et le contrôle géométrique des infrastructures sportives de haut niveau.
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
