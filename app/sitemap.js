export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://urbateam.fr';
  
  const routes = [
    '',
    '/apropos',
    '/moyens-techniques',
    '/faq',
    '/lexique',
    '/mon-projet',
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
