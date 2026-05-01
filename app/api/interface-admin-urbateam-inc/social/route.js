import { NextResponse } from 'next/server';
export const dynamic = 'force-static';


import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '../../../../lib/imageOptimizer';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'social.json');

// Helper pour lire les données
async function getSocialData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

// Helper pour sauvegarder les données
async function saveSocialData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getSocialData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const file = formData.get('file');
    const caption = formData.get('caption') || '';
    const category = formData.get('category') || 'terrain';

    const data = await getSocialData();
    let post;

    if (id) {
      post = data.find(p => p.id.toString() === id.toString());
      if (!post) return NextResponse.json({ success: false, message: 'Photo non trouvée' }, { status: 404 });
    }

    let url = post ? post.url : '';

    if (file && typeof file !== 'string' && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      url = await optimizeImage(buffer, 'uploads/social', file.name);
    }

    if (!id && !file) {
      return NextResponse.json({ success: false, message: 'Fichier requis pour une nouvelle photo' }, { status: 400 });
    }

    const updatedPost = {
      id: id ? parseInt(id) : Date.now(),
      url,
      caption,
      category,
      date: post ? post.date : new Date().toISOString()
    };
    
    if (id) {
      const index = data.findIndex(p => p.id.toString() === id.toString());
      data[index] = updatedPost;
    } else {
      data.unshift(updatedPost);
    }
    
    await saveSocialData(data);

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let data = await getSocialData();
    data = data.filter(post => post.id !== id);
    await saveSocialData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
