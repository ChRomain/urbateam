import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LOCALES = ['en', 'br'];
const DEFAULT_LOCALE = 'fr';
const MAINTENANCE_BYPASS_COOKIE = 'urbateam_preview_access';

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 1. Ignorer les fichiers statiques, l'API et l'administration
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. Traiter le pass secret d'accès (ex: ?pass=urbateam2026)
  const passParam = searchParams.get('pass');
  const validSecret = process.env.MAINTENANCE_BYPASS_SECRET || 'urbateam2026';

  if (passParam && passParam === validSecret) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('pass');

    const redirectResponse = NextResponse.redirect(cleanUrl);
    redirectResponse.cookies.set(MAINTENANCE_BYPASS_COOKIE, 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      sameSite: 'lax',
    });
    return redirectResponse;
  }

  // 3. Si la page /en-construction elle-même est appelée directement
  if (pathname.startsWith('/en-construction')) {
    requestHeaders.set('x-pathname', '/en-construction');
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 4. Vérifier si le navigateur possède le cookie d'accès autorisé
  const hasAccessCookie = request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value === 'true';

  if (!hasAccessCookie) {
    // Visiteur non autorisé -> Affichage de la page "En construction" sans Header/Footer
    requestHeaders.set('x-pathname', '/en-construction');
    return NextResponse.rewrite(new URL('/en-construction', request.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 5. Détecter le locale si l'accès est autorisé
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let locale = DEFAULT_LOCALE;
  let targetPath = pathname;

  if (pathnameHasLocale) {
    const segments = pathname.split('/');
    locale = segments[1];
    targetPath = '/' + segments.slice(2).join('/');
    
    if (targetPath === '') {
      targetPath = '/';
    }
  } else {
    const cookieLang = request.cookies.get('urbateam-lang')?.value;
    const allLocales = [DEFAULT_LOCALE, ...SUPPORTED_LOCALES];
    
    if (cookieLang && allLocales.includes(cookieLang)) {
      locale = cookieLang;
    } else {
      const acceptLang = request.headers.get('accept-language') || '';
      if (acceptLang.startsWith('en')) {
        locale = 'en';
      } else if (acceptLang.startsWith('br')) {
        locale = 'br';
      }
    }
  }

  requestHeaders.set('x-locale', locale);

  const response = NextResponse.rewrite(
    new URL(targetPath + request.nextUrl.search, request.url),
    {
      request: {
        headers: requestHeaders,
      },
    }
  );

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
    '/((?!api|admin|_next|.*\\..*).*)',
  ],
};
