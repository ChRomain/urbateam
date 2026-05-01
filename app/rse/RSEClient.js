'use client';

import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Magnetic from '../../components/Magnetic';
import { useLanguage } from '../../context/LanguageContext';
import { Leaf, Heart, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RSEClient() {
  const { t } = useLanguage();

  const pillars = [
    {
      key: 'environmental',
      icon: <Leaf size={40} color="#79a081" />,
      color: 'var(--primary-color)'
    },
    {
      key: 'social',
      icon: <Heart size={40} color="#d6b99f" />,
      color: 'var(--accent-color)'
    },
    {
      key: 'territorial',
      icon: <MapPin size={40} color="#3c3c3c" />,
      color: 'var(--secondary-color)'
    }
  ];

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('rse_page.title')} 
        subtitle={t('rse_page.subtitle')}
      />

      <div className="grid" style={{ 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '2.5rem', 
        marginTop: '5rem' 
      }}>
        {pillars.map((pillar, index) => (
          <MotionSection key={pillar.key} delay={index * 0.1}>
            <GlassCard style={{ 
              height: '100%', 
              padding: '3rem 2rem',
              borderTop: `6px solid ${pillar.color}`,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '18px', 
                backgroundColor: `${pillar.color}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                {pillar.icon}
              </div>

              <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                {t(`rse_page.pillars.${pillar.key}.title`)}
              </h2>
              
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.6' }}>
                {t(`rse_page.pillars.${pillar.key}.desc`)}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, marginTop: 'auto' }}>
                {t(`rse_page.pillars.${pillar.key}.items`).map((item, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    gap: '0.8rem', 
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.4'
                  }}>
                    <CheckCircle size={18} style={{ color: pillar.color, flexShrink: 0, marginTop: '2px' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </MotionSection>
        ))}
      </div>

      {/* Impact Stats Placeholder */}
      <MotionSection style={{ marginTop: '8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>Notre Impact en chiffres</h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {[
            { label: "Réduction Papier", value: "95%", icon: "📄" },
            { label: "Formation / An / Collab.", value: "35h", icon: "📚" },
            { label: "Agences de Proximité", value: "2", icon: "🏠" },
            { label: "Matériel Électrique", value: "100%", icon: "⚡" }
          ].map((stat, i) => (
            <GlassCard key={i} style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-color)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>{stat.label}</div>
            </GlassCard>
          ))}
        </div>
      </MotionSection>

      {/* CTA Section */}
      <MotionSection style={{ marginTop: '8rem' }}>
        <GlassCard style={{ 
          background: 'linear-gradient(135deg, var(--secondary-color), #1a1a1a)',
          padding: '5rem 3rem',
          borderRadius: '40px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle eco pattern background */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--primary-color) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.8rem', marginBottom: '1.5rem', color: 'white' }}>
              {t('rse_page.cta_title')}
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8, lineHeight: '1.6' }}>
              {t('rse_page.cta_desc')}
            </p>
            
            <Magnetic>
              <Link href="/contact" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '1rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '1.2rem 3rem',
                borderRadius: '50px',
                fontWeight: '800',
                textDecoration: 'none',
                boxShadow: '0 15px 35px rgba(121, 160, 129, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                {t('rse_page.cta_btn')}
                <ArrowRight size={22} />
              </Link>
            </Magnetic>
          </div>
        </GlassCard>
      </MotionSection>
    </div>
  );
}
