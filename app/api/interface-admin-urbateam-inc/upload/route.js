import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'Aucun fichier' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'blog', filename);

    await writeFile(uploadPath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/blog/${filename}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
