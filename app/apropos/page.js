import AproposClient from './AproposClient';
import { fr } from '../../i18n/fr';

export const metadata = {
  title: fr.meta.about.title,
  description: fr.meta.about.description,
  openGraph: {
    title: fr.meta.about.title,
    description: fr.meta.about.description,
    url: 'https://urbateam.fr/apropos',
    siteName: 'URBATEAM',
    images: [{ url: '/og-image.png' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function AproposPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://urbateam.fr" },
      { "@type": "ListItem", "position": 2, "name": "À propos", "item": "https://urbateam.fr/apropos" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AproposClient />
    </>
  );
}
