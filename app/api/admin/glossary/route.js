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
      .from('glossaire')
      .select('*')
      .order('sort', { ascending: true });

    if (error) throw error;

    if (rows && rows.length > 0) {
      const formatted = rows.map(r => ({
        id: r.id,
        fr: { term: r.term_fr || '', definition: r.definition_fr || '' },
        en: { term: r.term_en || '', definition: r.definition_en || '' },
        br: { term: r.term_br || '', definition: r.definition_br || '' },
        relatedExpertise: r.related_expertise || null
      }));
      return NextResponse.json(formatted);
    }

    // Fallback : lecture du fichier JSON si la base est vide
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'glossary.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      const jsonItems = JSON.parse(fileData);
      return NextResponse.json(jsonItems);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[API Admin Glossary GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch glossary' }, { status: 500 });
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

    // Récupération des IDs existants dans la table Supabase 'glossaire'
    const { data: existingRows, error: fetchErr } = await supabaseAdmin
      .from('glossaire')
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
        term_fr: item.fr?.term || '',
        definition_fr: item.fr?.definition || '',
        term_en: item.en?.term || '',
        definition_en: item.en?.definition || '',
        term_br: item.br?.term || '',
        definition_br: item.br?.definition || '',
        related_expertise: item.relatedExpertise || null
      };

      if (isExisting) {
        payloadIds.add(numericId);
        const { error: updateErr } = await supabaseAdmin
          .from('glossaire')
          .update(record)
          .eq('id', numericId);
        if (updateErr) throw updateErr;
      } else {
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from('glossaire')
          .insert([record])
          .select();
        if (insertErr) throw insertErr;
        if (inserted && inserted[0]) {
          payloadIds.add(inserted[0].id);
        }
      }
    }

    // Supprimer les éléments supprimés côté admin
    const idsToDelete = (existingRows || [])
      .map(r => r.id)
      .filter(id => !payloadIds.has(id));

    if (idsToDelete.length > 0) {
      const { error: deleteErr } = await supabaseAdmin
        .from('glossaire')
        .delete()
        .in('id', idsToDelete);
      if (deleteErr) throw deleteErr;
    }

    // Revalidation du cache public Next.js
    revalidatePath('/lexique');
    revalidatePath('/api/glossary');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin Glossary POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
