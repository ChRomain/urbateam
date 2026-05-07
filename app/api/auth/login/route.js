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

    // On crée la réponse
    const response = NextResponse.json({ success: true });

    // On définit le cookie de session de manière sécurisée (httpOnly)
    // Le token Directus est dans data.data.access_token
    if (data.data?.access_token) {
      response.cookies.set('admin_session', data.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400, // 24 heures
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[API Auth Login Error]:', error);
    return NextResponse.json({ errors: [{ message: `Erreur technique serveur : ${error.message}` }] }, { status: 500 });
  }
}
