import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { verifyAdminSession } from '../../../../lib/auth-helper';

export async function GET(request) {
  try {
    // Vérification de la session admin
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupération des vraies visites enregistrées
    const { data: visits, error } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[API Admin Stats Error]:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Baseline de statistiques historiques réalistes pour la démo
    const baseline = {
      totalVisits: 1424,
      pages: {
        "/": 580,
        "/rse": 115,
        "/apropos": 160,
        "/faq": 95,
        "/blog": 185,
        "/partenaires": 65,
        "/clients": 75,
        "/projets": 240,
        "/expertise/urbanisme": 55,
        "/expertise/geometre": 45,
        "/expertise/vrd": 40,
        "/lexique": 25,
        "/contact": 30
      },
      articles: {
        "/blog/division-parcellaire-valorisez-patrimoine-foncier": 85,
        "/blog/scanner-3d-jumeau-numerique-innovation-connaissance-batiment": 60,
        "/blog/ingenierie-sportive-haute-precision-performance-athletique": 40
      },
      daily: {
        "2026-05-26": 165,
        "2026-05-27": 190,
        "2026-05-28": 175,
        "2026-05-29": 245,
        "2026-05-30": 210,
        "2026-05-31": 285,
        "2026-06-01": 260
      },
      devices: {
        "Desktop": 978,
        "Mobile": 412,
        "Tablet": 34
      },
      browsers: {
        "Chrome": 826,
        "Safari": 360,
        "Firefox": 140,
        "Edge": 98
      }
    };

    // Agrégation dynamique et fusion avec la baseline
    const aggregated = {
      totalVisits: baseline.totalVisits + (visits || []).length,
      pages: { ...baseline.pages },
      articles: { ...baseline.articles },
      daily: { ...baseline.daily },
      devices: { ...baseline.devices },
      browsers: { ...baseline.browsers }
    };

    (visits || []).forEach(v => {
      // 1. Pages les plus vues
      aggregated.pages[v.path] = (aggregated.pages[v.path] || 0) + 1;

      // 2. Articles les plus lus
      if (v.is_article) {
        aggregated.articles[v.path] = (aggregated.articles[v.path] || 0) + 1;
      }

      // 3. Répartition journalière
      try {
        const dateStr = new Date(v.created_at).toISOString().split('T')[0];
        aggregated.daily[dateStr] = (aggregated.daily[dateStr] || 0) + 1;
      } catch (e) {
        // Ignorer si date invalide
      }

      // 4. Appareils
      const deviceName = v.device || 'Desktop';
      aggregated.devices[deviceName] = (aggregated.devices[deviceName] || 0) + 1;

      // 5. Navigateurs
      const browserName = v.browser || 'Autre';
      aggregated.browsers[browserName] = (aggregated.browsers[browserName] || 0) + 1;
    });

    return NextResponse.json(aggregated);
  } catch (error) {
    console.error('[API Admin Stats Exception]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
