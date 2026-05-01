'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function StatsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Éviter de tracker l'admin
    if (pathname.includes('interface-admin-urbateam-inc')) return;

    const trackVisit = async () => {
      try {
        await fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            path: pathname,
            isArticle: pathname.startsWith('/blog/') && pathname !== '/blog'
          }),
        });
      } catch (err) {
        // Silencieux si erreur
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}
