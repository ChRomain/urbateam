import ExpertiseClient from './ExpertiseClient';
import { fr } from '../../../i18n/fr';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const meta = fr.meta.expertises[slug];
  
  return {
    title: meta?.title || "URBATEAM | Expertise",
    description: meta?.description || "Expertise foncière et aménagement.",
    openGraph: {
      title: meta?.title,
      description: meta?.description,
      url: `https://urbateam.fr/expertise/${slug}`,
      siteName: 'URBATEAM',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'fr_FR',
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return [
    { slug: 'urbanisme' },
    { slug: 'geometre' },
    { slug: 'vrd' },
    { slug: 'sport' },
    { slug: 'topographie' },
    { slug: 'copropriete' },
  ];
}

export default async function ExpertisePage({ params }) {
  const { slug } = await params;
  const meta = fr.meta.expertises[slug];
  
  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://urbateam.fr"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Expertises",
        "item": "https://urbateam.fr/#expertises"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": meta?.title || "Expertise",
        "item": `https://urbateam.fr/expertise/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ExpertiseClient slug={slug} />
    </>
  );
}
