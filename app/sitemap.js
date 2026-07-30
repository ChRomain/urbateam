export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://urbateam.fr';

  const expertiseSlugs = [
    'bornage',
    'division',
    'copropriete',
    'lotissement',
    'urbanisme',
    'vrd',
    'sport',
    'topographie',
    'geometre'
  ];

  const staticRoutes = [
    { path: '', priority: 1.0, changeFreq: 'weekly' },
    { path: '/expertise', priority: 0.9, changeFreq: 'weekly' },
    { path: '/contact', priority: 0.9, changeFreq: 'monthly' },
    { path: '/eco-diagnostic', priority: 0.9, changeFreq: 'weekly' },
    { path: '/simulateur-division', priority: 0.9, changeFreq: 'weekly' },
    { path: '/apropos', priority: 0.8, changeFreq: 'monthly' },
    { path: '/projets', priority: 0.8, changeFreq: 'weekly' },
    { path: '/mon-projet', priority: 0.8, changeFreq: 'monthly' },
    { path: '/blog', priority: 0.8, changeFreq: 'weekly' },
    { path: '/faq', priority: 0.8, changeFreq: 'monthly' },
    { path: '/lexique', priority: 0.8, changeFreq: 'monthly' },
    { path: '/simulateur-ensoleillement', priority: 0.8, changeFreq: 'monthly' },
    { path: '/carte-cadastre', priority: 0.8, changeFreq: 'monthly' },
    { path: '/profil-long', priority: 0.8, changeFreq: 'monthly' },
    { path: '/clients-et-partenaires', priority: 0.7, changeFreq: 'monthly' },
    { path: '/moyens-techniques', priority: 0.7, changeFreq: 'monthly' },
    { path: '/rse', priority: 0.7, changeFreq: 'monthly' },
    { path: '/nous-suivre', priority: 0.6, changeFreq: 'monthly' },
    { path: '/mentions-legales', priority: 0.3, changeFreq: 'yearly' },
    { path: '/vieprivee', priority: 0.3, changeFreq: 'yearly' }
  ];

  const expertiseRoutes = expertiseSlugs.map(slug => ({
    path: `/expertise/${slug}`,
    priority: 0.9,
    changeFreq: 'weekly'
  }));

  const allRoutes = [...staticRoutes, ...expertiseRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
