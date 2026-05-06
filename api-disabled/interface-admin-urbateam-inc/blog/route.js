import { NextResponse } from 'next/server';
export const dynamic = 'force-static';



import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '../../../../lib/imageOptimizer';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'blog.json');

async function getBlogData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function saveBlogData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getBlogData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const author = formData.get('author');
    const tags = formData.get('tags');
    const content = formData.get('content'); // HTML content
    const excerpt = formData.get('excerpt');
    const file = formData.get('featuredImage');

    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Titre et contenu requis' }, { status: 400 });
    }

    const data = await getBlogData();
    let post;

    if (id) {
      const index = data.findIndex(p => p.id.toString() === id.toString());
      if (index === -1) return NextResponse.json({ success: false, message: 'Article non trouvé' }, { status: 404 });
      post = data[index];
    }

    let imageUrl = post ? post.featuredImage : '';
    if (file && typeof file !== 'string' && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = await optimizeImage(buffer, 'uploads/blog', file.name);
    }

    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const updatedPost = {
      id: id ? parseInt(id) : Date.now(),
      title,
      slug,
      author,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      content,
      excerpt,
      featuredImage: imageUrl,
      date: id ? post.date : new Date().toISOString()
    };

    if (id) {
      const index = data.findIndex(p => p.id.toString() === id.toString());
      data[index] = updatedPost;
    } else {
      data.unshift(updatedPost);
    }
    
    await saveBlogData(data);

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Blog upload error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la création de l\'article' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let data = await getBlogData();
    data = data.filter(post => post.id !== id);
    await saveBlogData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
