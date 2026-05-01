'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Magnetic from '../../components/Magnetic';
import { useLanguage } from '../../context/LanguageContext';
import { Handshake, ExternalLink, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PartnersClient() {
  const { t, language } = useLanguage();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch('/data/partners.json');
        const data = await res.json();
        setPartners(data);
      } catch (err) {
        console.error('Error fetching partners', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('partners.title')} 
        subtitle={t('partners.subtitle')}
      />

      <div className="grid" style={{ 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2.5rem', 
        marginTop: '4rem' 
      }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <GlassCard key={i} style={{ height: '200px', opacity: 0.5 }}>
              <div className="shimmer" style={{ height: '100%', width: '100%' }}></div>
            </GlassCard>
          ))
        ) : partners.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0' }}>
            <Handshake size={64} style={{ color: 'var(--accent-color)', opacity: 0.3, marginBottom: '1.5rem' }} />
            <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>
              Nos partenaires seront bientôt affichés ici.
            </p>
          </div>
        ) : (
          partners.map((partner, index) => (
            <MotionSection key={partner.id} delay={index * 0.1}>
              <GlassCard style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="partner-card"
              >
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  backgroundColor: 'white', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  padding: '1rem'
                }}>
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Handshake size={40} color="var(--primary-color)" />
                  )}
                </div>
                
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {partner.name}
                </h3>
                
                <div style={{ 
                  backgroundColor: 'var(--primary-color)10', 
                  color: 'var(--primary-color)', 
                  padding: '0.3rem 1rem', 
                  borderRadius: '30px', 
                  fontSize: '0.85rem', 
                  fontWeight: '700',
                  marginBottom: '1.5rem'
                }}>
                  {partner.role}
                </div>

                {partner.website && (
                  <div style={{ marginTop: 'auto' }}>
                    <Magnetic>
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          color: 'var(--accent-color)',
                          textDecoration: 'none',
                          fontWeight: '700',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Globe size={18} />
                        Visiter le site
                        <ExternalLink size={14} />
                      </a>
                    </Magnetic>
                  </div>
                )}
              </GlassCard>
            </MotionSection>
          ))
        )}
      </div>

      {/* CTA Section */}
      <MotionSection style={{ marginTop: '8rem' }}>
        <GlassCard style={{ 
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          padding: '4rem',
          borderRadius: '40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', opacity: 0.1 }}>
            <Handshake size={300} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>
              {t('partners.cta_title')}
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
              {t('partners.cta_desc')}
            </p>
            
            <Magnetic>
              <Link href="/contact" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '1rem',
                backgroundColor: 'white',
                color: 'var(--primary-color)',
                padding: '1.2rem 2.5rem',
                borderRadius: '50px',
                fontWeight: '800',
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                {t('partners.cta_btn')}
                <ArrowRight size={20} />
              </Link>
            </Magnetic>
          </div>
        </GlassCard>
      </MotionSection>

      <style jsx>{`
        .partner-card:hover {
          transform: translateY(-10px);
        }
      `}</style>
    </div>
  );
}
