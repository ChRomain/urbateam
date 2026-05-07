import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization');
    const baseUrl = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';

    const res = await fetch(`${baseUrl}/users`, {
      headers: { 'Authorization': token }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ errors: [{ message: 'Erreur lors de la récupération des utilisateurs' }] }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const token = request.headers.get('Authorization');
    const body = await request.json();
    const { id, ...updates } = body;
    const baseUrl = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';

    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const res = await fetch(`${baseUrl}/users/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(updates)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ errors: [{ message: 'Erreur lors de la mise à jour' }] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization');
    const body = await request.json();
    const baseUrl = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';

    const res = await fetch(`${baseUrl}/users/invite`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ email: body.email })
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ errors: [{ message: 'Erreur lors de l\'invitation' }] }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('Authorization');
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const baseUrl = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';

    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const res = await fetch(`${baseUrl}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ errors: [{ message: 'Erreur lors de la suppression' }] }, { status: 500 });
  }
}
