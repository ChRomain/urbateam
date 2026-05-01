'use client';

import { Globe, ShieldCheck } from 'lucide-react';

export default function SEOPreview({ title, excerpt, slug }) {
  const displayTitle = title || "Titre de l'article...";
  const displayExcerpt = excerpt || "Le résumé de votre article apparaîtra ici. Veillez à inclure vos mots-clés principaux pour un meilleur référencement sur Google...";
  const displaySlug = slug || "titre-de-l-article";

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '1.5rem', 
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      maxWidth: '600px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <Globe size={14} /> Aperçu Google (SEO)
      </div>

      <div style={{ fontFamily: 'arial, sans-serif' }}>
        {/* URL / Breadcrumbs */}
        <div style={{ color: '#202124', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <span>https://urbateam.fr</span>
          <span style={{ color: '#5f6368' }}>› blog › {displaySlug}</span>
        </div>

        {/* Title */}
        <h3 style={{ 
          color: '#1a0dab', 
          fontSize: '20px', 
          fontWeight: '400', 
          margin: '0 0 4px 0', 
          lineHeight: '1.3',
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          {displayTitle.length > 60 ? displayTitle.substring(0, 57) + '...' : displayTitle}
        </h3>

        {/* Description */}
        <div style={{ color: '#4d5156', fontSize: '14px', lineHeight: '1.58' }}>
          <span style={{ color: '#70757a' }}>{new Date().toLocaleDateString('fr-FR')} — </span>
          {displayExcerpt.length > 160 ? displayExcerpt.substring(0, 157) + '...' : displayExcerpt}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', marginBottom: '0.3rem' }}>SCORE TITRE</div>
          <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}>
            <div style={{ 
              height: '100%', 
              backgroundColor: title.length > 10 && title.length < 60 ? '#10b981' : '#f59e0b', 
              width: `${Math.min((title.length / 60) * 100, 100)}%`,
              borderRadius: '2px'
            }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', marginBottom: '0.3rem' }}>SCORE DESCRIPTION</div>
          <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}>
            <div style={{ 
              height: '100%', 
              backgroundColor: excerpt.length > 50 && excerpt.length < 160 ? '#10b981' : '#f59e0b', 
              width: `${Math.min((excerpt.length / 160) * 100, 100)}%`,
              borderRadius: '2px'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
