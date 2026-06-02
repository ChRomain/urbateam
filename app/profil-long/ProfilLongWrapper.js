'use client';

import dynamic from 'next/dynamic';

const ProfilLongClient = dynamic(() => import('./ProfilLongClient'), { 
  ssr: false,
  loading: () => (
    <div className="container py-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spin-loader" style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(139, 92, 246, 0.1)',
          borderTop: '4px solid var(--primary-color, #8b5cf6)',
          borderRadius: '50%',
          margin: '0 auto 1.5rem auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-light, #64748b)', fontWeight: '500' }}>
          Chargement de l'outil de profil en long...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
});

export default function ProfilLongWrapper() {
  return <ProfilLongClient />;
}
