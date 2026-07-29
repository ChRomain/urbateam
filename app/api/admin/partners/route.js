import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, createItem, updateItem, deleteItem, uploadFile, getLogoUrl } from '../../../../lib/supabase';
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
      .from('partenaires')
      .select('*')
      .order('sort', { ascending: true });

    if (error) throw error;

    if (rows && rows.length > 0) {
      const formatted = rows.map(r => ({
        id: r.id,
        name: r.name,
        role: r.role || '',
        website: r.website || '',
        logo: r.logo ? getLogoUrl(r.logo) : null
      }));
      return NextResponse.json(formatted);
    }

    // Fallback JSON
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'partners.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      const jsonItems = JSON.parse(fileData);
      return NextResponse.json(jsonItems);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[API Admin Partners GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const role = formData.get('role');
    const website = formData.get('website');
    const logoFile = formData.get('logo');

    if (!name) {
      return NextResponse.json({ success: false, message: 'Le nom est obligatoire.' }, { status: 400 });
    }

    const itemData = {
      status: 'published',
      name,
      role: role || '',
      website: website || ''
    };

    if (logoFile && typeof logoFile !== 'string' && logoFile.size > 0) {
      const uploadedName = await uploadFile(logoFile);
      if (uploadedName) {
        itemData.logo = uploadedName;
      }
    }

    let result;
    if (id) {
      result = await updateItem('partenaires', id, itemData);
    } else {
      const { data: lastRows } = await supabaseAdmin
        .from('partenaires')
        .select('sort')
        .order('sort', { ascending: false })
        .limit(1);

      itemData.sort = lastRows && lastRows.length > 0 ? (lastRows[0].sort || 0) + 1 : 0;
      result = await createItem('partenaires', itemData);
    }

    revalidatePath('/clients-et-partenaires');

    return NextResponse.json({ success: true, partner: result });
  } catch (error) {
    console.error('[API Admin Partners POST Error]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const success = await deleteItem('partenaires', id);
    revalidatePath('/clients-et-partenaires');
    return NextResponse.json({ success });
  } catch (error) {
    console.error('[API Admin Partners DELETE Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
