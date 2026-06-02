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

    // Agrégation dynamique des vraies statistiques de Supabase uniquement (pas de fausses visites)
    const aggregated = {
      totalVisits: (visits || []).length,
      pages: {},
      articles: {},
      daily: {},
      devices: {
        "Desktop": 0,
        "Mobile": 0,
        "Tablet": 0
      },
      browsers: {}
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
