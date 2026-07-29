import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, createItem, updateItem, deleteItem, uploadFile, getAssetUrl } from '../../../../lib/supabase';
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
      .from('social_posts')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    if (rows && rows.length > 0) {
      const formatted = rows.map(r => ({
        id: r.id,
        caption: r.caption || '',
        url: r.url ? getAssetUrl(r.url) : '',
        date: r.date || r.created_at
      }));
      return NextResponse.json(formatted);
    }

    // Fallback JSON
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'social.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      const jsonItems = JSON.parse(fileData);
      return NextResponse.json(jsonItems);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[API Admin Social GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch social posts' }, { status: 500 });
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
    const caption = formData.get('caption');
    const urlInput = formData.get('url');
    const file = formData.get('file');

    const itemData = {
      status: 'published',
      caption: caption || ''
    };

    if (file && typeof file !== 'string' && file.size > 0) {
      const uploadedName = await uploadFile(file);
      if (uploadedName) {
        itemData.url = uploadedName;
      }
    } else if (urlInput) {
      itemData.url = urlInput;
    }

    let result;
    if (id) {
      result = await updateItem('social_posts', id, itemData);
    } else {
      if (!itemData.url) {
        return NextResponse.json({ success: false, message: 'Une photo ou une URL est requise.' }, { status: 400 });
      }
      result = await createItem('social_posts', itemData);
    }

    revalidatePath('/nous-suivre');

    const formattedPost = {
      id: result.id,
      caption: result.caption || '',
      url: getAssetUrl(result.url),
      date: result.date || result.created_at
    };

    return NextResponse.json({ success: true, post: formattedPost });
  } catch (error) {
    console.error('[API Admin Social POST Error]:', error);
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

    const success = await deleteItem('social_posts', id);
    revalidatePath('/nous-suivre');
    return NextResponse.json({ success });
  } catch (error) {
    console.error('[API Admin Social DELETE Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
