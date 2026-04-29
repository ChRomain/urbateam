'use client';

import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

export default function Apropos() {
  const { t } = useLanguage();

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

      <div className="mt-4" style={{ marginTop: '6rem' }}>
        <MotionSection>
          <h2 className="text-center mb-4">{t('about.team.title')}</h2>
          <p className="text-center" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {t('about.team.subtitle')}
          </p>
        </MotionSection>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Frank Le Gall */}
          <GlassCard key="member-frank" className="text-center" style={{ padding: '2rem 1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--secondary-color)' }}>
              <img src="/pictures/FrankLeGall.jpg" alt={t('about.team.members.frank.name')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.2rem', fontSize: '1.1rem' }}>{t('about.team.members.frank.name')}</h4>
            <div style={{ color: 'var(--secondary-color)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('about.team.members.frank.role')}</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>{t('about.team.members.frank.desc')}</p>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <a href={`mailto:${t('about.team.members.frank.email')}`} style={{ textDecoration: 'underline' }}>{t('about.team.members.frank.email')}</a>
              <a href={`tel:${t('about.team.members.frank.phone').replace(/\s/g, '')}`} style={{ fontWeight: 'bold' }}>{t('about.team.members.frank.phone')}</a>
            </div>
          </GlassCard>

          {/* Laura Charretteur */}
          <GlassCard key="member-laura" className="text-center" style={{ padding: '2rem 1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--accent-color)' }}>
              <img src="/pictures/LauraCharretteur.jpg" alt={t('about.team.members.laura.name')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {t('about.team.members.laura.name')}
              <a 
                href="https://www.linkedin.com/in/laura-charretteur/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="LinkedIn"
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <svg width="18" height="18" fill="#0077b5" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </h4>
            <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('about.team.members.laura.role')}</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>{t('about.team.members.laura.desc')}</p>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <a href={`mailto:${t('about.team.members.laura.email')}`} style={{ textDecoration: 'underline' }}>{t('about.team.members.laura.email')}</a>
              <a href={`tel:${t('about.team.members.laura.phone').replace(/\s/g, '')}`} style={{ fontWeight: 'bold' }}>{t('about.team.members.laura.phone')}</a>
            </div>
          </GlassCard>

          {/* Reste de l'équipe */}
          {[
             { key: 'yves' },
             { key: 'trang' },
             { key: 'camille' },
             { key: 'urbanistes', generic: true },
             { key: 'engineers', generic: true },
             { key: 'topographers', generic: true },
             { key: 'drafters', generic: true },
             { key: 'lawyers', generic: true },
             { key: 'assistants', generic: true }
          ].map((member) => (
            <GlassCard key={`member-${member.key}`} className="text-center" style={{ padding: '2rem 1rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <h4 style={{ marginBottom: '0.2rem', color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                {member.generic ? t(`about.team.members.${member.key}.role`) : t(`about.team.members.${member.key}.name`)}
              </h4>
              <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {member.generic ? "" : t(`about.team.members.${member.key}.role`)}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: member.generic ? '0' : '0.5rem' }}>{t(`about.team.members.${member.key}.desc`)}</p>
              {!member.generic && (
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <a href={`mailto:${t(`about.team.members.${member.key}.email`)}`} style={{ textDecoration: 'underline' }}>{t(`about.team.members.${member.key}.email`)}</a>
                  <a href={`tel:${t(`about.team.members.${member.key}.phone`).replace(/\s/g, '')}`} style={{ fontWeight: 'bold' }}>{t(`about.team.members.${member.key}.phone`)}</a>
                </div>
              )}
            </GlassCard>
          ))}
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
