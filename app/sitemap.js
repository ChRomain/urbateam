export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://urbateam.fr';
  
  const routes = [
    '',
    '/apropos',
    '/expertise',
    '/projets',
    '/clients',
    '/mon-projet',
    '/blog',
    '/nous-suivre',
    '/lexique',
    '/moyens-techniques',
    '/faq',
    '/contact',
    '/mentions-legales',
    '/vieprivee'

  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
