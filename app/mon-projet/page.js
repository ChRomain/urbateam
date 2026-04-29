import ProjetClient from './ProjetClient';
import { fr } from '../../i18n/fr';

export const metadata = {
  title: fr.meta.project.title,
  description: fr.meta.project.description,
  openGraph: {
    title: fr.meta.project.title,
    description: fr.meta.project.description,
    url: 'https://urbateam.fr/mon-projet',
    siteName: 'URBATEAM',
    images: [{ url: '/og-image.png' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function ProjetPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://urbateam.fr" },
      { "@type": "ListItem", "position": 2, "name": "Mon Projet", "item": "https://urbateam.fr/mon-projet" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProjetClient />
    </>
  );
}
