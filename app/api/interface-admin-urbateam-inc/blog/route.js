import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'blog.json');

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
    const title = formData.get('title');
    const author = formData.get('author');
    const tags = formData.get('tags');
    const content = formData.get('content'); // HTML content
    const excerpt = formData.get('excerpt');
    const file = formData.get('featuredImage');

    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Titre et contenu requis' }, { status: 400 });
    }

    let imageUrl = '';
    if (file && typeof file !== 'string') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'blog', filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/blog/${filename}`;
    }

    const data = await getBlogData();
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const newPost = {
      id: Date.now(),
      title,
      slug,
      author,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      content,
      excerpt,
      featuredImage: imageUrl,
      date: new Date().toISOString()
    };

    data.unshift(newPost);
    await saveBlogData(data);

    return NextResponse.json({ success: true, post: newPost });
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
