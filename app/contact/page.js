import ContactClient from './ContactClient';
import { fr } from '../../i18n/fr';

export const metadata = {
  title: fr.meta.contact.title,
  description: fr.meta.contact.description,
  openGraph: {
    title: fr.meta.contact.title,
    description: fr.meta.contact.description,
    url: 'https://urbateam.fr/contact',
    siteName: 'URBATEAM',
    images: [{ url: '/og-image.png' }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://urbateam.fr" },
      { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://urbateam.fr/contact" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
