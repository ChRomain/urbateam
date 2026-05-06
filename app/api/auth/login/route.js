import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const baseUrl = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Auth Login Error]:', error);
    return NextResponse.json({ errors: [{ message: `Erreur technique serveur : ${error.message}` }] }, { status: 500 });
  }
}
