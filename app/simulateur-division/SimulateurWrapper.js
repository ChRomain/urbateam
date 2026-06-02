'use client';

import dynamic from 'next/dynamic';

const SimulateurDivisionClient = dynamic(() => import('./SimulateurDivisionClient'), { 
  ssr: false,
  loading: () => (
    <div className="container py-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Chargement du découpeur de terrain...</p>
      </div>
    </div>
  )
});

export default function SimulateurWrapper() {
  return <SimulateurDivisionClient />;
}
