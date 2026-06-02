'use client';

import dynamic from 'next/dynamic';

const SimulateurEnsoleillementClient = dynamic(() => import('./SimulateurEnsoleillementClient'), { 
  ssr: false,
  loading: () => (
    <div className="container py-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spin-loader" style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid rgba(121, 160, 129, 0.1)', 
          borderLeftColor: 'var(--primary-color)', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1.5rem'
        }} />
        <p style={{ color: 'var(--text-light)', fontFamily: 'var(--font-righteous)', fontSize: '1.2rem' }}>Chargement du simulateur d'ombres 3D...</p>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-main)', opacity: 0.7, fontSize: '0.9rem' }}>Initialisation du moteur physique et astronomique céleste...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
});

export default function SimulateurWrapper() {
  return <SimulateurEnsoleillementClient />;
}
