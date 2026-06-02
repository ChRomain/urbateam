import FAQClient from './FAQClient';
import { getFaq } from '../../lib/supabase';
import { fr } from '../../i18n/fr';

export const revalidate = 3600;

export const metadata = {
  title: fr.meta.faq.title,
  description: fr.meta.faq.description,
  openGraph: {
    title: fr.meta.faq.title,
    description: fr.meta.faq.description,
    url: 'https://urbateam.fr/faq',
    siteName: 'URBATEAM',
    images: [{ url: '/og-image.png' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default async function FAQPage() {
  // Récupère depuis Directus (multilingue), fallback sur les items statiques si DB vide
  const dbItems = await getFaq();
  const faqItemsFr = dbItems.length > 0
    ? dbItems.map(i => ({ question: i.question_fr, answer: i.answer_fr }))
    : (fr.faq.items || []);

  // JSON-LD: FAQPage (toujours en fr pour le SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItemsFr.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://urbateam.fr" },
      { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://urbateam.fr/faq" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <FAQClient dbItems={dbItems} />
    </>
  );
}
