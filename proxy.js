import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LOCALES = ['en', 'br'];
const DEFAULT_LOCALE = 'fr';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques, l'API et les requêtes internes Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Détecter si l'URL commence par un locale supporté
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let locale = DEFAULT_LOCALE;
  let targetPath = pathname;

  if (pathnameHasLocale) {
    // Extraire le locale et le chemin propre
    const segments = pathname.split('/');
    locale = segments[1];
    targetPath = '/' + segments.slice(2).join('/');
    
    // Si targetPath est vide (cas de /en ou /br), réécrire vers /
    if (targetPath === '') {
      targetPath = '/';
    }
  } else {
    // Si aucun préfixe de langue n'est présent dans l'URL,
    // on lit le cookie pour voir si un choix précédent a été mémorisé.
    const cookieLang = request.cookies.get('urbateam-lang')?.value;
    if (cookieLang && SUPPORTED_LOCALES.includes(cookieLang)) {
      locale = cookieLang;
    } else {
      // Optionnel : détection automatique basée sur les préférences du navigateur
      const acceptLang = request.headers.get('accept-language') || '';
      if (acceptLang.startsWith('en')) {
        locale = 'en';
      } else if (acceptLang.startsWith('br')) {
        locale = 'br';
      }
    }
  }

  // Construire la réponse de réécriture interne
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.rewrite(
    new URL(targetPath + request.nextUrl.search, request.url),
    {
      request: {
        headers: requestHeaders,
      },
    }
  );

  // Si on a explicitement visité un préfixe (/en ou /br), on synchronise le cookie
  if (pathnameHasLocale) {
    response.cookies.set('urbateam-lang', locale, {
      path: '/',
      maxAge: 31536000, // 1 an
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Appliquer le proxy à toutes les requêtes sauf fichiers statiques / api / admin
    '/((?!api|admin|_next|.*\\..*).*)',
  ],
};
