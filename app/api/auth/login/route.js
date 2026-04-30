import { NextResponse } from 'next/server';
import { ADMIN_CONFIG } from '../../../../lib/admin-config';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
      // Authentification réussie
      const response = NextResponse.json(
        { success: true, message: 'Connexion réussie' },
        { status: 200 }
      );

      // Création d'un cookie de session simple (pour l'exemple)
      // En production, utilisez un vrai JWT ou NextAuth
      response.cookies.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 jour
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Identifiants incorrects' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
