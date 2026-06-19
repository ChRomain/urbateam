import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { verifyAdminSession } from '../../../../lib/auth-helper';

export async function GET(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('site_texts')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch site texts:', error);
    return NextResponse.json({ error: 'Failed to fetch site texts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, fr, en, br } = body;

    if (!key || fr === undefined) {
      return NextResponse.json({ error: 'Key and French translation are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('site_texts')
      .upsert({
        key,
        fr,
        en: en || null,
        br: br || null,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, text: data?.[0] });
  } catch (error) {
    console.error('Failed to update site text:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('site_texts')
      .delete()
      .eq('key', key);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete site text:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
