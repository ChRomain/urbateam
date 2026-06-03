'use client';

import NextLink from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Link({ href, children, ...props }) {
  const { language } = useLanguage();

  let localizedHref = href;
  if (language && language !== 'fr' && typeof href === 'string') {
    // Localise uniquement les liens internes absolus commençant par /
    // N'affecte pas les liens externes, ancres, API et panel d'administration
    if (
      href.startsWith('/') &&
      !href.startsWith('/en') &&
      !href.startsWith('/br') &&
      !href.startsWith('/api') &&
      !href.startsWith('/admin')
    ) {
      localizedHref = `/${language}${href}`;
    }
  }

  return (
    <NextLink href={localizedHref} {...props}>
      {children}
    </NextLink>
  );
}
