import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // 1. Try fetching from Supabase site_texts table
    try {
      const { data, error } = await supabase
        .from('site_texts')
        .select('*')
        .eq('key', 'testimonials.items')
        .single();

      if (!error && data && data.fr) {
        const parsed = typeof data.fr === 'string' ? JSON.parse(data.fr) : data.fr;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json(parsed);
        }
      }
    } catch (dbErr) {
      console.warn('Supabase fetch for testimonials skipped:', dbErr?.message);
    }

    // 2. Fallback to reading public/data/testimonials.json
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'testimonials.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      const jsonItems = JSON.parse(fileData);
      return NextResponse.json(jsonItems);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[API Testimonials GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}
