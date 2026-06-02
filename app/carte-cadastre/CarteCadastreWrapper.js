'use client';

import dynamic from 'next/dynamic';

const CarteCadastreClient = dynamic(() => import('./CarteCadastreClient'), { 
  ssr: false,
  loading: () => (
    <div className="container py-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Chargement de la carte interactive...</p>
      </div>
    </div>
  )
});

export default function CarteCadastreWrapper({ projects }) {
  return <CarteCadastreClient projects={projects} />;
}
