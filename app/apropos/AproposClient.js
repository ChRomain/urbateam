'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Tilt from '../../components/Tilt';
import Magnetic from '../../components/Magnetic';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AproposClient() {
  const { t, language } = useLanguage();
  const [teamData, setTeamData] = useState({ header: {}, members: [] });

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const res = await fetch('/data/team.json');
        const data = await res.json();
        if (data && data.members) {
          setTeamData(data);
        }
      } catch (err) {
        console.error('Error loading team data', err);
      }
    };
    loadTeam();
  }, []);

  const teamHeader = teamData.header[language] || { 
    title: t('about.team.title'), 
    subtitle: t('about.team.subtitle') 
  };
  
  const teamMembers = teamData.members.length > 0 ? teamData.members : null;


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

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <Magnetic>
            <Link href="/rse" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.8rem', 
              backgroundColor: 'var(--bg-white)', 
              color: 'var(--primary-color)',
              padding: '1rem 2rem',
              borderRadius: '50px',
              border: '1px solid var(--primary-color)',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}>
              {t('common.learn_more')}
              <ArrowRight size={18} />
            </Link>
          </Magnetic>
        </div>
      </div>

      <div className="mt-4" style={{ marginTop: '6rem' }}>
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
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--accent-color)', transform: 'translateZ(20px)' }}>
                  {member.image ? (
                    <img src={member.image} alt={member[language]?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
