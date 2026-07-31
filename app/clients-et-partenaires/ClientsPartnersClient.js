'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Magnetic from '../../components/Magnetic';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, Globe, ExternalLink, ArrowRight } from 'lucide-react';

export default function ClientsPartnersClient({ clients = [], partners = [] }) {
  const { t } = useLanguage();
  const [clientFilter, setClientFilter] = useState('all');

  const clientTypes = [
    { title: t('references.categories.collectivite') || 'Collectivités', icon: "🏛️", key: 'Collectivite' },
    { title: t('references.categories.amenageur') || 'Aménageurs & Promoteurs', icon: "🏗️", key: 'Aménageur' },
    { title: t('references.categories.architecte') || 'Architectes, Constructeurs, Maîtres d’œuvre', icon: "📐", key: 'Architecte' },
    { title: t('references.categories.immobilier') || 'Professionnels de l’immobilier', icon: "🏢", key: 'Immobilier' }
  ];

  const filteredClients = clientFilter === 'all' 
    ? clients 
    : clients.filter(c => c.tags?.some(tag => tag.toLowerCase() === clientFilter.toLowerCase()));

  const toggleClientFilter = (key) => {
    if (clientFilter === key) setClientFilter('all');
    else setClientFilter(key);
  };

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('references.title') || "Ils nous font confiance"} 
        subtitle="Parce que chaque projet est unique, nous nous entourons des meilleurs experts (notaires, avocats, architectes) pour sécuriser vos opérations."
      />

      {/* SECTION: NOS CLIENTS & RÉFÉRENCES */}
      <MotionSection style={{ marginTop: '4rem', marginBottom: '6rem' }}>
        {/* Clients Filter Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '1.2rem', 
          maxWidth: '900px',
          margin: '0 auto 3rem'
        }}>
          {clientTypes.map((type, i) => (
            <button 
              key={i}
              onClick={() => toggleClientFilter(type.key)}
              style={{ 
                border: 'none', 
                background: 'none', 
                padding: 0, 
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <GlassCard style={{ 
                padding: '1.2rem', 
                aspectRatio: '1 / 1', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                textAlign: 'center',
                border: clientFilter === type.key ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                transform: clientFilter === type.key ? 'translateY(-5px)' : 'none',
                boxShadow: clientFilter === type.key ? 'var(--shadow-md)' : 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{type.icon}</div>
                <h3 style={{ 
                  color: 'var(--primary-color)', 
                  fontSize: '0.8rem', 
                  margin: 0, 
                  lineHeight: '1.2',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {type.title}
                </h3>
              </GlassCard>
            </button>
          ))}
        </div>

        {/* Clients Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: '2rem',
          alignItems: 'center'
        }}>
          <AnimatePresence mode='popLayout'>
            {filteredClients.map((client) => (
              <motion.div 
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                style={{ 
                  backgroundColor: 'white', 
                  padding: '2rem', 
                  borderRadius: '16px', 
                  height: '120px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9'
                }}
              >
                {client.logo ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={client.logo}
                      alt={client.name}
                      fill
                      sizes="180px"
                      style={{
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ fontWeight: '700', color: '#94a3b8', textAlign: 'center', fontSize: '0.9rem' }}>{client.name}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </MotionSection>

      {/* Dynamic Call to Action */}
      <MotionSection style={{ marginTop: '6rem' }}>
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

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
              <div style={{ maxWidth: '600px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>
                  {t('clients.cta') || "Vous souhaitez nous confier un projet ?"}
                </h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
                  {t('expertise.cta_desc') || "Notre équipe vous accompagne pour la réussite de vos projets d'aménagement."}
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
                    {t('expertise.cta_btn') || "Nous contacter"}
                    <ArrowRight size={20} />
                  </Link>
                </Magnetic>
              </div>
            </div>
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
