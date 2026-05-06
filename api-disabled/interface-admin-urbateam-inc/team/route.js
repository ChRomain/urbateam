import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'team.json');

async function getTeamData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return { header: {}, members: [] };
  }
}

async function saveTeamData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getTeamData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    await saveTeamData(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team update error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la mise à jour de l\'équipe' }, { status: 500 });
  }
}
