import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    const baseUrl = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';

    const res = await fetch(`${baseUrl}/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ errors: [{ message: 'Erreur serveur' }] }, { status: 500 });
  }
}
