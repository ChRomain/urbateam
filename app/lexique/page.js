import LexiqueClient from './LexiqueClient';
import { getGlossaire } from '../../lib/directus';
import { fr } from '../../i18n/fr';

export const revalidate = 3600;

export const metadata = {
  title: fr.meta.glossary.title,
  description: fr.meta.glossary.description,
  openGraph: {
    title: fr.meta.glossary.title,
    description: fr.meta.glossary.description,
    url: 'https://urbateam.fr/lexique',
    siteName: 'URBATEAM',
    images: [{ url: '/og-image.png' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default async function LexiquePage() {
  const dbItems = await getGlossaire();
  const glossaryItems = dbItems.length > 0
    ? dbItems.map(i => ({ term: i.term_fr, definition: i.definition_fr }))
    : (fr.glossary.items || []);

  // JSON-LD: DefinedTermSet
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": fr.glossary.header.title,
    "description": fr.glossary.header.subtitle,
    "hasDefinedTerm": glossaryItems.map((item) => ({
      "@type": "DefinedTerm",
      "name": item.term,
      "description": item.definition
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://urbateam.fr" },
      { "@type": "ListItem", "position": 2, "name": "Lexique", "item": "https://urbateam.fr/lexique" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <LexiqueClient dbItems={dbItems} />
    </>
  );
}
