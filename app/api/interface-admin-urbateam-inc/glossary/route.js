import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'glossary.json');

async function getGlossaryData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function saveGlossaryData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getGlossaryData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: 'Données invalides' }, { status: 400 });
    }

    await saveGlossaryData(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Glossary update error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la mise à jour du lexique' }, { status: 500 });
  }
}
