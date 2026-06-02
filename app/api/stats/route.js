import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const { path, isArticle } = await request.json();
    
    // Si pas de chemin spécifié, on ignore
    if (!path) {
      return NextResponse.json({ success: false, error: 'Path is required' }, { status: 400 });
    }

    // Extraction et analyse rudimentaire du User-Agent
    const ua = request.headers.get('user-agent') || '';
    
    let device = 'Desktop';
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
      device = 'Mobile';
    } else if (/Tablet|iPad/i.test(ua)) {
      device = 'Tablet';
    }

    let browser = 'Autre';
    if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr|opios/i.test(ua)) {
      browser = 'Chrome';
    } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua)) {
      browser = 'Safari';
    } else if (/firefox|fxios/i.test(ua)) {
      browser = 'Firefox';
    } else if (/edge|edg/i.test(ua)) {
      browser = 'Edge';
    }

    // Insertion directe dans la table 'visits' de Supabase
    const { error } = await supabase.from('visits').insert([
      {
        path,
        is_article: !!isArticle,
        device,
        browser
      }
    ]);

    if (error) {
      console.error('[API Stats Error]: Failed to save to Supabase:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Stats Exception]:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
