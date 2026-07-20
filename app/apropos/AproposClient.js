'use client';

import Image from 'next/image';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Tilt from '../../components/Tilt';
import Magnetic from '../../components/Magnetic';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, Building2, MapPin, Monitor, Cpu, Printer, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  building: <Building2 size={24} />,
  'map-pin': <MapPin size={24} />,
  monitor: <Monitor size={24} />,
  software: <Cpu size={24} />,
  printer: <Printer size={24} />
};

// teamData est passé depuis le server component (page.js) via getTeam()
export default function AproposClient({ teamData = { header: {}, members: [] } }) {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const teamHeader = teamData.header[language] || {
    title: t('about.team.title'),
    subtitle: t('about.team.subtitle')
  };

  const teamMembers = teamData.members.length > 0 ? teamData.members : null;

  const defaultTechnicalSections = [
    {
      id: "infra",
      title: t('technical.infrastructure.title'),
      icon: "building",
      list: t('technical.infrastructure.list')
    },
    {
      id: "field",
      title: t('technical.field.title'),
      icon: "map-pin",
      list: t('technical.field.list'),
      showFieldImages: true
    },
    {
      id: "computing",
      title: t('technical.computing.title'),
      icon: "monitor",
      list: t('technical.computing.list')
    },
    {
      id: "software",
      title: t('technical.software.title'),
      icon: "software",
      desc: t('technical.software.desc'),
      showSoftwareImages: true
    },
    {
      id: "reprography",
      title: t('technical.reprography.title'),
      icon: "printer",
      list: t('technical.reprography.list'),
      fullWidth: true
    }
  ];

  const rawTechnicalSections = t('technical.sections');
  const technicalItems = Array.isArray(rawTechnicalSections) ? rawTechnicalSections : defaultTechnicalSections;

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('about.header.title')} 
        subtitle={t('about.header.subtitle')}
      />

      <MotionSection className="grid grid-cols-2" style={{ alignItems: 'center', marginTop: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--secondary-color)' }}>{t('about.society.title')}</h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('about.society.p1')}
          </p>
          <p style={{ marginBottom: '1rem' }}>
            {t('about.society.p2')}
          </p>
          <p>
            {t('about.society.p3')}
          </p>
        </div>
        
        <GlassCard style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))' }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '1.2rem', textAlign: 'center', padding: '2rem' }}>
            {t('about.society.media_placeholder')}
          </div>
        </GlassCard>
      </MotionSection>

      {/* Section Frise Chronologique */}
      <MotionSection style={{ marginTop: '2rem' }}>
        <h2 className="text-center mb-4">{t('about.timeline.title')}</h2>
        <p className="text-center" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 0.5rem' }}>
          {t('about.timeline.subtitle')}
        </p>

        <div className="timeline-section">
          <div className="timeline-horizontal">
            {t('about.timeline.items') && Array.isArray(t('about.timeline.items')) && t('about.timeline.items').map((item, index) => {
              const displayTitle = item.year === '2027' ? item.title.replace('2027', currentYear.toString()) : item.title;
              return (
                <div key={index} className="timeline-col">
                  {/* Top Card Wrapper */}
                  {item.position === 'top' && (
                    <div className="timeline-card-wrapper top">
                      <div className={`timeline-card ${item.year === '2024' ? 'timeline-card-2024' : ''}`}>
                        <div>
                          <span className="timeline-year">{displayTitle}</span>
                          <p className="timeline-desc" dangerouslySetInnerHTML={{ __html: item.desc }} />
                        </div>
                        {item.image && item.year === '2024' && (
                          <img src={item.image} alt={item.year} className="timeline-avatar" />
                        )}
                        {item.image && item.year !== '2024' && (
                          <div className="timeline-media">
                            <img src={item.image} alt={item.year} className="timeline-avatar" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Middle Axis (Dot) */}
                  <div className="timeline-axis">
                    <div className="timeline-dot" />
                  </div>

                  {/* Bottom Card Wrapper */}
                  {item.position === 'bottom' && (
                    <div className="timeline-card-wrapper bottom">
                      <div className="timeline-card">
                        <span className="timeline-year">{displayTitle}</span>
                        <p className="timeline-desc" dangerouslySetInnerHTML={{ __html: item.desc }} />
                        {item.image && (
                          <div className="timeline-media">
                            <img src={item.image} alt={item.year} className="timeline-avatar" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </MotionSection>
      
      <div className="mt-4" style={{ marginTop: '1.5rem' }}>
        <MotionSection>
          <h2 className="text-center mb-4">{teamHeader.title}</h2>
          <p className="text-center" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {teamHeader.subtitle}
          </p>

          {teamData.header.teamPhoto && (
            <div style={{ 
              width: '100%', 
              height: '450px', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              marginBottom: '4rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <img 
                src={teamData.header.teamPhoto} 
                alt="Equipe Urbateam" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          )}
        </MotionSection>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {teamMembers ? teamMembers.map((member) => (
            <Tilt key={`member-${member.id}`} strength={10}>
              <GlassCard className="text-center" style={{ padding: '2rem 1rem', height: '100%' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--accent-color)', transform: 'translateZ(20px)', position: 'relative' }}>
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member[language]?.name || 'Membre équipe'}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <svg width="40" height="40" fill="#94a3b8" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  )}
                </div>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transform: 'translateZ(30px)' }}>
                  {member.generic ? member[language]?.role : member[language]?.name}
                  {!member.generic && member.linkedin && (
                    <a 
                      href={member.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <svg width="18" height="18" fill="#0077b5" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                </h4>
                <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem', transform: 'translateZ(20px)' }}>
                  {member.generic ? "" : member[language]?.role}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: member.generic ? '0' : '0.5rem', transform: 'translateZ(10px)' }}>
                  {member[language]?.desc}
                </p>
                {!member.generic && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', display: 'flex', flexDirection: 'column', gap: '2px', transform: 'translateZ(15px)' }}>
                    {member[language]?.email && <a href={`mailto:${member[language].email}`} style={{ textDecoration: 'underline' }}>{member[language].email}</a>}
                    {member[language]?.phone && <a href={`tel:${member[language].phone.replace(/\s/g, '')}`} style={{ fontWeight: 'bold' }}>{member[language].phone}</a>}
                  </div>
                )}
              </GlassCard>
            </Tilt>
          )) : (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', opacity: 0.5 }}>{t('header.loading_references')}</div>
          )}
        </div>
      </div>

      {/* Section Moyens Techniques */}
      <div className="mt-4" style={{ marginTop: '6rem' }}>
        <MotionSection>
          <h2 className="text-center mb-4">{t('technical.header.title')}</h2>
          <p className="text-center" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {t('technical.header.subtitle')}
          </p>
        </MotionSection>
        <div className="grid grid-cols-6" style={{ gap: '1.5rem' }}>
          {technicalItems.map((item) => {
            const isFirstRow = item.id === 'infra' || item.id === 'field' || item.id === 'computing';
            const cardClass = item.id === 'reprography' ? 'col-span-4' : 'col-span-2';
            const icon = iconMap[item.icon] || <HelpCircle size={20} />;
            
            const themeColor = item.id === 'field' ? 'var(--accent-color)' : item.id === 'software' ? '#6366f1' : 'var(--secondary-color)';
            const borderTopColor = item.id === 'field' ? 'var(--accent-color)' : item.id === 'software' ? '#6366f1' : 'var(--primary-color)';

            const cardPadding = isFirstRow ? '1rem 1.25rem' : '1.25rem 1.5rem';

            return (
              <GlassCard key={item.id} className={cardClass} style={{ padding: cardPadding, borderTop: `4px solid ${borderTopColor}` }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: themeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isFirstRow ? '0.75rem' : '1rem' }}>
                  {icon}
                </div>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: isFirstRow ? '0.5rem' : '0.75rem', fontSize: '1.2rem' }}>{item.title}</h3>
                
                {item.desc && (
                  <p style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {item.desc}
                  </p>
                )}

                {item.list && Array.isArray(item.list) && (
                  <ul className={item.fullWidth ? "multi-column-list" : ""} style={{ 
                    paddingLeft: '1.2rem', 
                    color: 'var(--text-light)', 
                    listStyleType: 'disc',
                    columnCount: item.fullWidth ? 2 : 1,
                    columnGap: item.fullWidth ? '2rem' : '0'
                  }}>
                    {item.list.map((listItem, i) => (
                      <li key={i} style={{ marginBottom: isFirstRow ? '0.25rem' : '0.4rem', fontSize: '0.85rem' }}>{listItem}</li>
                    ))}
                  </ul>
                )}

                {item.showFieldImages && (
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0.5rem 0', marginTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img src="/pictures/scanner-3d-final.png" alt="Scanner 3D" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>Scanner 3D</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <img src="/pictures/station-trimble-final.png" alt="Station Trimble" style={{ height: '58px', width: 'auto', objectFit: 'contain' }} />
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>Station Trimble</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <img src="/pictures/gps-trimble-final.png" alt="GPS Trimble" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>GPS Trimble</p>
                    </div>
                  </div>
                )}

                {item.showSoftwareImages && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0', marginTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <img src="/pictures/autocad.png" alt="AutoCAD" style={{ height: '24px', width: 'auto' }} title="AutoCAD" />
                    <img src="/pictures/covadis.png" alt="Covadis" style={{ height: '24px', width: 'auto' }} title="Covadis" />
                    <img src="/pictures/sketchup.png" alt="SketchUp" style={{ height: '24px', width: 'auto' }} title="SketchUp" />
                    <img src="/pictures/photoshop.png" alt="Photoshop" style={{ height: '24px', width: 'auto' }} title="Photoshop" />
                    <img src="/pictures/illustrator.png" alt="Illustrator" style={{ height: '24px', width: 'auto' }} title="Illustrator" />
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Section RSE */}
      <div className="mt-4" style={{ marginTop: '6rem' }}>
        <MotionSection>
          <h2 className="text-center mb-4">{t('about.rse.title')}</h2>
          <p className="text-center" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {t('about.rse.subtitle')}
          </p>
        </MotionSection>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <GlassCard style={{ borderTop: '4px solid var(--primary-color)' }}>
            <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.2rem', marginBottom: '1rem' }}>{t('about.rse.environmental.title')}</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{t('about.rse.environmental.desc')}</p>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-light)', listStyleType: 'circle' }}>
              {t('about.rse.environmental.items').slice(0, 3).map((item, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{item}</li>)}
            </ul>
          </GlassCard>
          
          <GlassCard style={{ borderTop: '4px solid var(--accent-color)' }}>
            <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.2rem', marginBottom: '1rem' }}>{t('about.rse.social.title')}</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{t('about.rse.social.desc')}</p>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-light)', listStyleType: 'circle' }}>
              {t('about.rse.social.items').slice(0, 3).map((item, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{item}</li>)}
            </ul>
          </GlassCard>

          <GlassCard style={{ borderTop: '4px solid var(--secondary-color)' }}>
            <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.2rem', marginBottom: '1rem' }}>{t('about.rse.territorial.title')}</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{t('about.rse.territorial.desc')}</p>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-light)', listStyleType: 'circle' }}>
              {t('about.rse.territorial.items').slice(0, 3).map((item, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{item}</li>)}
            </ul>
          </GlassCard>
        </div>
      </div>

      <div className="mt-4" style={{ marginTop: '6rem' }}>
        <MotionSection>
          <h2 className="text-center mb-4">{t('about.quality.title')}</h2>
          <p className="text-center" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {t('about.quality.subtitle')}
          </p>
        </MotionSection>

        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
          <GlassCard>
            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{t('about.quality.engagement.title')}</h3>
            <p style={{ marginBottom: '1rem' }}>
              {t('about.quality.engagement.p1')}
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', listStyleType: 'disc' }}>
              {t('about.quality.engagement.list').map((item, i) => (
                <li key={`engage-${i}`} style={{ marginBottom: '0.5rem' }}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{t('about.quality.assurance.title')}</h3>
            <p style={{ marginBottom: '1rem' }}>
              {t('about.quality.assurance.p1')}
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', listStyleType: 'disc' }}>
              {t('about.quality.assurance.list').map((item, i) => (
                <li key={`assure-${i}`} style={{ marginBottom: '0.5rem' }}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{t('about.quality.control.title')}</h3>
            <p style={{ marginBottom: '1rem' }}>
              {t('about.quality.control.p1')}
            </p>
            <p style={{ color: 'var(--text-light)' }}>
              {t('about.quality.control.p2')}
            </p>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{t('about.quality.communication.title')}</h3>
            <p style={{ marginBottom: '1rem' }}>
              {t('about.quality.communication.p1')}
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', listStyleType: 'disc' }}>
              {t('about.quality.communication.list').map((item, i) => (
                <li key={`comm-${i}`} style={{ marginBottom: '0.5rem' }}>{item}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      <MotionSection style={{ marginTop: '6rem' }}>
        <GlassCard style={{ backgroundColor: 'var(--bg-white)', maxWidth: '900px', margin: '0 auto', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <h2 className="text-center mb-4" style={{ color: 'var(--primary-color)' }}>{t('about.video.title')}</h2>
            <p className="text-center mb-4" style={{ color: 'var(--text-light)' }}>
              {t('about.video.subtitle')}
            </p>
            <div style={{ width: '100%', maxWidth: '350px', height: '620px', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', backgroundColor: '#000', position: 'relative' }}>
              <video 
                src="/video/reelPres.mp4" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                controls
                loop
                muted
                autoPlay
                playsInline
              >
                {t('about.video.fallback')}
              </video>
            </div>
          </div>
        </GlassCard>
      </MotionSection>
    </div>
  );
}
