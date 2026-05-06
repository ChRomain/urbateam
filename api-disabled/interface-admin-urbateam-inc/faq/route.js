import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'faq.json');

async function getFaqData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Si le fichier n'existe pas, on retourne une structure par défaut
    return [];
  }
}

async function saveFaqData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getFaqData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body; // On s'attend à recevoir la liste complète des items

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: 'Données invalides' }, { status: 400 });
    }

    await saveFaqData(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('FAQ update error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la mise à jour de la FAQ' }, { status: 500 });
  }
}
