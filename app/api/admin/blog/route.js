import { NextResponse } from 'next/server';
import { getArticles, createItem, updateItem, deleteItem, uploadFile } from '../../../../../lib/supabase';
import { verifyAdminSession } from '../../../../../lib/auth-helper';

export async function GET(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // En admin, on récupère tout (pas de filtre status par défaut)
    const posts = await getArticles(null);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
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
    const status = formData.get('status') || 'published';
    const title = formData.get('title');
    const author = formData.get('author') || 'URBATEAM';
    const tags = formData.get('tags');
    const content = formData.get('content');
    const excerpt = formData.get('excerpt');
    const featuredImageFile = formData.get('featuredImage');

    let featuredImageId = null;
    if (featuredImageFile && typeof featuredImageFile !== 'string' && featuredImageFile.size > 0) {
      featuredImageId = await uploadFile(featuredImageFile);
    }

    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const itemData = {
      status,
      title,
      slug,
      author,
      excerpt,
      content,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      date_published: new Date().toISOString()
    };

    if (featuredImageId) {
      itemData.featured_image = featuredImageId;
    }

    let result;
    if (id) {
      // Pour une mise à jour, on ne change pas forcément la date de publication
      delete itemData.date_published;
      result = await updateItem('articles', id, itemData);
    } else {
      result = await createItem('articles', itemData);
    }

    return NextResponse.json({ success: true, post: result });
  } catch (error) {
    console.error('Blog API Error:', error);
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

    const success = await deleteItem('articles', id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
