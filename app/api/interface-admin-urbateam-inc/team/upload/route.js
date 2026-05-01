import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '../../../../lib/imageOptimizer';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const memberId = formData.get('memberId');
    const isTeamPhoto = formData.get('isTeamPhoto');

    if (!file) {
      return NextResponse.json({ success: false, message: 'Aucun fichier fourni' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimisation avec Sharp
    const prefix = isTeamPhoto ? 'team' : (memberId || 'member');
    const url = await optimizeImage(buffer, 'uploads/team', `${prefix}-${file.name}`);

    return NextResponse.json({ 
      success: true, 
      url: url 
    });
  } catch (error) {
    console.error('Team upload error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
