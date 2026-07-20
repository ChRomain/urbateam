import { NextResponse } from 'next/server';
import { getGlossaire } from '../../../lib/supabase';

export async function GET() {
  try {
    const data = await getGlossaire();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[API Glossary] Error fetching glossary:', error);
    return NextResponse.json({ error: 'Failed to fetch glossary' }, { status: 500 });
  }
}
