'use client';

import dynamic from 'next/dynamic';

const EcoDiagnosticClient = dynamic(() => import('./EcoDiagnosticClient'), { 
  ssr: false,
  loading: () => (
    <div className="container py-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)', fontWeight: '500' }}>Chargement de l'Éco-Diagnostic Foncier...</p>
      </div>
    </div>
  )
});

export default function EcoDiagnosticWrapper() {
  return <EcoDiagnosticClient />;
}
