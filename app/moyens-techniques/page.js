import MoyensClient from './MoyensClient';
import { fr } from '../../i18n/fr';

export const metadata = {
  title: fr.meta.technical.title,
  description: fr.meta.technical.description,
  openGraph: {
    title: fr.meta.technical.title,
    description: fr.meta.technical.description,
    url: 'https://urbateam.fr/moyens-techniques',
    siteName: 'URBATEAM',
    images: [{ url: '/og-image.png' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function MoyensPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://urbateam.fr" },
      { "@type": "ListItem", "position": 2, "name": "Moyens Techniques", "item": "https://urbateam.fr/moyens-techniques" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MoyensClient />
    </>
  );
}
