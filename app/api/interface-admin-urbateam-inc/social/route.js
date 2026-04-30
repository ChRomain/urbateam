import { NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'social.json');

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
    const file = formData.get('file');
    const caption = formData.get('caption') || '';

    if (!file) {
      return NextResponse.json({ success: false, message: 'Aucun fichier fourni' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nom de fichier unique
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'social', filename);

    // Sauvegarde physique de l'image
    await writeFile(uploadPath, buffer);

    // Mise à jour du JSON
    const data = await getSocialData();
    const newPost = {
      id: Date.now(),
      url: `/uploads/social/${filename}`,
      caption,
      date: new Date().toISOString()
    };
    
    data.unshift(newPost); // Ajouter au début
    await saveSocialData(data);

    return NextResponse.json({ success: true, post: newPost });
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
