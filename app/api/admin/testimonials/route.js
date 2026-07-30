import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '../../../../lib/supabase';
import { verifyAdminSession } from '../../../../lib/auth-helper';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Try Supabase site_texts table
    try {
      const { data, error } = await supabaseAdmin
        .from('site_texts')
        .select('*')
        .eq('key', 'testimonials.items')
        .single();

      if (!error && data && data.fr) {
        const parsed = typeof data.fr === 'string' ? JSON.parse(data.fr) : data.fr;
        if (Array.isArray(parsed)) {
          return NextResponse.json(parsed);
        }
      }
    } catch (dbErr) {
      console.warn('Supabase fetch for testimonials skipped:', dbErr?.message);
    }

    // 2. Fallback to public/data/testimonials.json
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'testimonials.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      const jsonItems = JSON.parse(fileData);
      return NextResponse.json(jsonItems);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[API Admin Testimonials GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const jsonString = JSON.stringify(items);

    // 1. Save to Supabase site_texts table
    try {
      await supabaseAdmin
        .from('site_texts')
        .upsert({
          key: 'testimonials.items',
          fr: jsonString,
          en: jsonString,
          br: jsonString,
          updated_at: new Date().toISOString()
        });
    } catch (dbErr) {
      console.warn('Supabase save for testimonials skipped:', dbErr?.message);
    }

    // 2. Save to public/data/testimonials.json file
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'testimonials.json');
      await fs.writeFile(jsonPath, JSON.stringify(items, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('File save for testimonials skipped:', fsErr?.message);
    }

    revalidatePath('/');
    revalidatePath('/api/testimonials');

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[API Admin Testimonials POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
