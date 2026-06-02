import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('[DEBUG Login API] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT DEFINED');
    console.log('[DEBUG Login API] Anon Key Length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ errors: [{ message: error.message }] }, { status: 400 });
    }

    // On crée la réponse
    const response = NextResponse.json({ success: true });

    // On définit le cookie de session de manière sécurisée (httpOnly)
    if (data.session?.access_token) {
      response.cookies.set('admin_session', data.session.access_token, {
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
