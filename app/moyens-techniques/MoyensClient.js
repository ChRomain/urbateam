'use client';

import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { Building2, MapPin, Monitor, Cpu, Printer, HelpCircle } from 'lucide-react';

const iconMap = {
  building: <Building2 size={28} />,
  'map-pin': <MapPin size={28} />,
  monitor: <Monitor size={28} />,
  software: <Cpu size={28} />,
  printer: <Printer size={28} />
};

export default function MoyensClient() {
  const { t } = useLanguage();

  const defaultSections = [
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

  const rawSections = t('technical.sections');
  const items = Array.isArray(rawSections) ? rawSections : defaultSections;

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('technical.header.title')} 
        subtitle={t('technical.header.subtitle')}
      />

      <div className="grid grid-cols-2" style={{ gap: '2rem', marginTop: '4rem' }}>
        {items.map((item) => {
          const isFullWidth = item.fullWidth;
          const cardStyle = isFullWidth ? { gridColumn: '1 / -1' } : {};
          const icon = iconMap[item.icon] || <HelpCircle size={28} />;
          
          const themeColor = item.id === 'field' ? 'var(--accent-color)' : item.id === 'software' ? '#6366f1' : 'var(--secondary-color)';
          const borderTopColor = item.id === 'field' ? 'var(--accent-color)' : item.id === 'software' ? '#6366f1' : 'var(--primary-color)';

          return (
            <GlassCard key={item.id} style={{ ...cardStyle, borderTop: `4px solid ${borderTopColor}` }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: themeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {icon}
              </div>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>{item.title}</h2>
              
              {item.desc && (
                <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              )}

              {item.list && Array.isArray(item.list) && (
                <ul className={item.fullWidth ? "multi-column-list" : ""} style={{ 
                  paddingLeft: '1.5rem', 
                  color: 'var(--text-light)', 
                  listStyleType: 'disc',
                  columnCount: item.fullWidth ? 2 : 1,
                  columnGap: item.fullWidth ? '2rem' : '0'
                }}>
                  {item.list.map((listItem, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{listItem}</li>
                  ))}
                </ul>
              )}

              {item.showFieldImages && (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem 0', marginTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <img src="/pictures/scanner-3d-final.png" alt="Scanner 3D" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>Scanner 3D</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <img src="/pictures/station-trimble-final.png" alt="Station Trimble" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>Station Trimble</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <img src="/pictures/gps-trimble-final.png" alt="GPS Trimble" style={{ height: '95px', width: 'auto', objectFit: 'contain' }} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>GPS Trimble</p>
                  </div>
                </div>
              )}

              {item.showSoftwareImages && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', padding: '1rem 0', marginTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <img src="/pictures/autocad.png" alt="AutoCAD" style={{ height: '30px', width: 'auto' }} title="AutoCAD" />
                  <img src="/pictures/covadis.png" alt="Covadis" style={{ height: '30px', width: 'auto' }} title="Covadis" />
                  <img src="/pictures/sketchup.png" alt="SketchUp" style={{ height: '30px', width: 'auto' }} title="SketchUp" />
                  <img src="/pictures/photoshop.png" alt="Photoshop" style={{ height: '30px', width: 'auto' }} title="Photoshop" />
                  <img src="/pictures/illustrator.png" alt="Illustrator" style={{ height: '30px', width: 'auto' }} title="Illustrator" />
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
