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
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'partners'
  const [clientFilter, setClientFilter] = useState('all');

  const clientTypes = [
    { title: t('references.categories.collectivite') || 'Collectivités', icon: "🏛️", key: 'Collectivite' },
    { title: t('references.categories.amenageur') || 'Aménageurs', icon: "🏗️", key: 'Aménageur' },
    { title: t('references.categories.architecte') || 'Architectes', icon: "📐", key: 'Architecte' },
    { title: t('references.categories.particulier') || 'Particuliers', icon: "🏠", key: 'Particulier' },
    { title: t('references.categories.entreprise') || 'Entreprises', icon: "🚧", key: 'Entreprise' }
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
        title={t('footer.clients_partners') || "Nos Clients & Partenaires"} 
        subtitle={t('partners.subtitle') || "Notre écosystème de confiance."}
      />

      {/* Premium Tab Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '3rem',
        marginBottom: '4rem'
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '0.4rem',
          borderRadius: '100px',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          {['clients', 'partners'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                position: 'relative',
                padding: '0.8rem 2rem',
                borderRadius: '100px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                color: activeTab === tab ? 'white' : '#64748b',
                zIndex: 1,
                transition: 'color 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {tab === 'clients' ? (t('clients.title') || "Nos Clients") : (t('header.partners') || "Partenaires")}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabBackground"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: '100px',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'clients' ? (
          <motion.div
            key="clients-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Clients Filter Buttons */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '1.2rem', 
              maxWidth: '900px',
              margin: '0 auto 4rem'
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
            <MotionSection>
              <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--secondary-color)' }}>
                {t('references.title') || "Nos Références"}
              </h2>
              
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
                              objectFit: 'contain',
                              filter: 'grayscale(100%) opacity(0.7)',
                              transition: 'filter 0.3s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.filter = 'none'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(100%) opacity(0.7)'}
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
          </motion.div>
        ) : (
          <motion.div
            key="partners-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Partners Grid */}
            <div className="grid" style={{ 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '2.5rem'
            }}>
              {partners.length === 0 ? (
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
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              fill
                              sizes="100px"
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        ) : (
                          <Handshake size={40} color="var(--primary-color)" />
                        )}
                      </div>
                      
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                        {partner.name}
                      </h3>
                      
                      <div style={{ 
                        backgroundColor: 'rgba(var(--primary-rgb, 12, 74, 96), 0.08)', 
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Combined Call to Action */}
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

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', md: { gridTemplateColumns: '1fr 1fr' } }}>
              <div style={{ maxWidth: '600px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>
                  {activeTab === 'clients' ? (t('clients.cta') || "Vous souhaitez nous confier un projet ?") : (t('partners.cta_title') || "Vous êtes un professionnel ?")}
                </h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
                  {activeTab === 'clients' ? (t('expertise.cta_desc') || "Notre équipe vous accompagne pour vos projets d'aménagement.") : (t('partners.cta_desc') || "Nous collaborons avec les meilleurs acteurs locaux.")}
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
                    {activeTab === 'clients' ? (t('expertise.cta_btn') || "Nous contacter") : (t('partners.cta_btn') || "Devenir partenaire")}
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
