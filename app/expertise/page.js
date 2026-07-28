import ExpertiseMainClient from './ExpertiseMainClient';
import { fr } from '../../i18n/fr';

export const metadata = {
  title: fr.meta.expertises.main.title,
  description: fr.meta.expertises.main.description,
  openGraph: {
    title: fr.meta.expertises.main.title,
    description: fr.meta.expertises.main.description,
    url: 'https://urbateam.fr/expertise',
    siteName: 'URBATEAM',
    images: [{ url: '/og-image.png' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function ExpertiseMainPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://urbateam.fr" },
      { "@type": "ListItem", "position": 2, "name": "Nos Domaines d'Expertise", "item": "https://urbateam.fr/expertise" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ExpertiseMainClient />
    </>
  );
}
