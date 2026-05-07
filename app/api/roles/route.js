import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization');
    const baseUrl = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';

    const res = await fetch(`${baseUrl}/roles`, {
      headers: { 'Authorization': token }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ errors: [{ message: 'Erreur lors de la récupération des rôles' }] }, { status: 500 });
  }
}
