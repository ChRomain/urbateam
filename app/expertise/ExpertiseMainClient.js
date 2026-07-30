'use client';

import { useLanguage } from '../../context/LanguageContext';
import Link from '@/components/Link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Ruler, 
  Compass, 
  Layers, 
  Map, 
  Droplets, 
  Trophy, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const iconMap = {
  bornage: <Ruler size={32} />,
  division: <Compass size={32} />,
  copropriete: <Layers size={32} />,
  lotissement: <Map size={32} />,
  urbanisme: <Map size={32} />,
  vrd: <Droplets size={32} />,
  sport: <Trophy size={32} />,
  topographie: <Compass size={32} />,
  geometre: <Ruler size={32} />
};

const expertiseItems = [
  { key: 'bornage', index: '01', image: '/pictures/geometre-bornage.webp' },
  { key: 'division', index: '02', image: '/pictures/topographie-final.webp' },
  { key: 'copropriete', index: '03', image: '/pictures/bim-3d-scan.webp' },
  { key: 'lotissement', index: '04', image: '/pictures/lotissement-pro.webp' },
  { key: 'urbanisme', index: '05', image: '/pictures/urbanisme-bureau.webp' },
  { key: 'vrd', index: '06', image: '/pictures/vrd-ingenierie.webp' },
  { key: 'sport', index: '07', image: '/pictures/sport-ingenierie.webp' },
  { key: 'topographie', index: '08', image: '/pictures/topographie-pro.webp' },
  { key: 'geometre', index: '09', image: '/pictures/geometre-foncier-v2.webp' }
];

export default function ExpertiseMainClient() {
  const { t } = useLanguage();

  const handleNavClick = (e, key) => {
    e.preventDefault();
    const elem = document.getElementById(key);
    if (elem) {
      const yOffset = -100; // Account for fixed header
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main style={{ paddingBottom: '6rem' }}>
      {/* Hero Header */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <PageHeader 
          title={t('expertise.title')} 
          subtitle={t('expertise.subtitle')}
        />

        {/* Quick Nav Anchor Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.75rem',
          margin: '2.5rem 0 3.5rem 0',
          position: 'sticky',
          top: '90px',
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '0.85rem 1.25rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          {expertiseItems.map((item) => {
            const title = t(`expertise.items.${item.key}.title`);
            return (
              <a
                key={item.key}
                href={`#${item.key}`}
                onClick={(e) => handleNavClick(e, item.key)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary-color)',
                  backgroundColor: 'var(--bg-light, #f8fafc)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-light, #f8fafc)';
                  e.currentTarget.style.color = 'var(--primary-color)';
                }}
              >
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.index}</span>
                <span>{title}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main Content: 9 Expertise Blocks */}
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
        {expertiseItems.map((item, idx) => {
          const expertiseData = t(`expertise.items.${item.key}`) || {};
          const title = expertiseData.title || item.key;
          const desc = expertiseData.desc || '';
          const longDesc = expertiseData.longDesc || desc;
          const missions = Array.isArray(expertiseData.missions) ? expertiseData.missions : [];
          const isEven = idx % 2 === 1;

          return (
            <motion.section 
              key={item.key} 
              id={item.key}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="glass-card"
              style={{
                borderRadius: '24px',
                padding: '2.5rem',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                scrollMarginTop: '110px'
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '3rem',
                alignItems: 'center'
              }}>
                {/* Content Side */}
                <div style={{ order: isEven ? 2 : 1 }}>
                  {/* Top Badge & Number */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {iconMap[item.key] || <Ruler size={32} />}
                    </div>
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        color: 'var(--accent-color, #10b981)',
                        textTransform: 'uppercase'
                      }}>
                        EXPERT {item.index} // URBATEAM
                      </span>
                      <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                        fontWeight: 700,
                        color: 'var(--primary-color)',
                        marginTop: '0.2rem'
                      }}>
                        {title}
                      </h2>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <p 
                    style={{
                      fontSize: '1.05rem',
                      lineHeight: '1.7',
                      color: 'var(--text-main)',
                      marginBottom: '1.8rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: longDesc }}
                  />

                  {/* Key Missions */}
                  {missions.length > 0 && (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      marginBottom: '2rem'
                    }}>
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--primary-color)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
                        MISSIONS & INTERVENTIONS CLÉS :
                      </h4>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1rem'
                      }}>
                        {missions.map((m, mIdx) => (
                          <div key={mIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '0.2rem' }} />
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--primary-color)' }}>
                                {m.title}
                              </strong>
                              {m.desc && (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
                                  {m.desc}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    <Link 
                      href="/contact" 
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                    >
                      Demander un devis
                    </Link>
                    <Link 
                      href={`/expertise/${item.key}`} 
                      style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        color: 'var(--primary-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span>Fiche dédiée</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Illustration Image Side */}
                <div style={{ order: isEven ? 1 : 2 }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '380px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.4)'
                  }}>
                  {(() => {
                    const itemImage = t(`expertise.items.${item.key}.image`) || item.image;
                    return (
                      <Image 
                        src={itemImage}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        style={{ objectFit: 'cover' }}
                        priority={idx < 2}
                      />
                    );
                  })()}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      right: '1rem',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                      background: 'rgba(0,0,0,0.35)',
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>URBATEAM // {title}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>SAINT-RENAN & DOUARNENEZ</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Global Bottom CTA */}
      <div className="container" style={{ marginTop: '5rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card text-center"
          style={{
            borderRadius: '24px',
            padding: '3.5rem 2rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            {t('expertise.cta_title')}
          </h3>
          <p style={{ color: 'var(--text-light)', maxWidth: '650px', margin: '0 auto 2rem auto', fontSize: '1.1rem' }}>
            {t('expertise.cta_desc')}
          </p>
          <Link href="/contact" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
            {t('expertise.cta_btn')}
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
