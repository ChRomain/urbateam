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

    const { data: rows, error } = await supabaseAdmin
      .from('faq')
      .select('*')
      .order('sort', { ascending: true });

    if (error) throw error;

    if (rows && rows.length > 0) {
      const formatted = rows.map(r => ({
        id: r.id,
        fr: { question: r.question_fr || '', answer: r.answer_fr || '' },
        en: { question: r.question_en || '', answer: r.answer_en || '' },
        br: { question: r.question_br || '', answer: r.answer_br || '' },
        category: r.category || null
      }));
      return NextResponse.json(formatted);
    }

    // Fallback: lecture du fichier JSON si la base est vide
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'faq.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      const jsonItems = JSON.parse(fileData);
      return NextResponse.json(jsonItems);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[API Admin FAQ GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
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

    const { data: existingRows, error: fetchErr } = await supabaseAdmin
      .from('faq')
      .select('id');

    if (fetchErr) throw fetchErr;

    const existingIds = new Set((existingRows || []).map(r => r.id));
    const payloadIds = new Set();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const numericId = Number(item.id);
      const isExisting = !isNaN(numericId) && existingIds.has(numericId);

      const record = {
        status: 'published',
        sort: i,
        question_fr: item.fr?.question || '',
        answer_fr: item.fr?.answer || '',
        question_en: item.en?.question || '',
        answer_en: item.en?.answer || '',
        question_br: item.br?.question || '',
        answer_br: item.br?.answer || '',
        category: item.category || null
      };

      if (isExisting) {
        payloadIds.add(numericId);
        const { error: updateErr } = await supabaseAdmin
          .from('faq')
          .update(record)
          .eq('id', numericId);
        if (updateErr) throw updateErr;
      } else {
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from('faq')
          .insert([record])
          .select();
        if (insertErr) throw insertErr;
        if (inserted && inserted[0]) {
          payloadIds.add(inserted[0].id);
        }
      }
    }

    // Supprimer les éléments supprimés
    const idsToDelete = (existingRows || [])
      .map(r => r.id)
      .filter(id => !payloadIds.has(id));

    if (idsToDelete.length > 0) {
      const { error: deleteErr } = await supabaseAdmin
        .from('faq')
        .delete()
        .in('id', idsToDelete);
      if (deleteErr) throw deleteErr;
    }

    revalidatePath('/faq');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin FAQ POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
