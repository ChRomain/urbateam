import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    // Ici tu pourrais plus tard enregistrer les stats en DB
    // console.log('Stats received:', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
