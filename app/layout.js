import { Montserrat, Righteous } from "next/font/google";
import "./globals.css";
import Header from './Header';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import CookieBanner from '../components/CookieBanner';
import StatsTracker from '../components/StatsTracker';
import { LanguageProvider } from '../context/LanguageContext';
import { headers } from 'next/headers';


const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: ["400"],
});

export const viewport = {
  themeColor: "#79a081",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL('https://urbateam.fr'),
  title: "URBATEAM | Géomètre-Expert & Topographe à Brest, Saint-Renan et Douarnenez",
  description: "Cabinet de Géomètres-Experts et urbanistes à Brest, Saint-Renan et Douarnenez. Expertise foncière, topographie et aménagement à Landerneau, Saint-Urbain et Finistère-Nord.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  openGraph: {
    title: "URBATEAM | Géomètres-Experts & Aménagement",
    description: "Expertise foncière, urbanisme et ingénierie d'infrastructure en Bretagne-Ouest. Nos deux agences de Saint-Renan et Douarnenez vous accompagnent dans tous vos projets.",
    url: 'https://urbateam.fr',
    siteName: 'URBATEAM',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'URBATEAM - Géomètres-Experts & Aménagement',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URBATEAM | Géomètres-Experts',
    description: "Expertise foncière et aménagement du territoire en Bretagne-Ouest.",
    images: ['/og-image.png'],
  },
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const lang = headersList.get('x-locale') || 'fr';
  const pathname = headersList.get('x-pathname') || '/';

  // Calculer les URLs alternatives pour chaque langue
  const cleanPath = pathname.replace(/^\/(en|br)/, '') || '';
  const canonicalUrl = `https://urbateam.fr${pathname === '/' ? '' : pathname}`;
  const frUrl = `https://urbateam.fr${cleanPath}`;
  const enUrl = `https://urbateam.fr/en${cleanPath}`;
  const brUrl = `https://urbateam.fr/br${cleanPath}`;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta name="permissions-policy" content="geolocation=(self), camera=(), microphone=(), payment=()" />
        
        {/* Hreflang - Signaux multilingues pour les moteurs de recherche */}
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="fr" href={frUrl} />
        <link rel="alternate" hrefLang="en" href={enUrl} />
        <link rel="alternate" hrefLang="br" href={brUrl} />
        <link rel="alternate" hrefLang="x-default" href={frUrl} />

        {/* DNS & Connection Optimization */}
        {/* Note : Google Fonts n'est plus utilisé ici — next/font auto-héberge les polices */}
        {/* On préconnecte uniquement aux domaines tiers réellement utilisés à l'écran */}
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />

        {/* JSON-LD: ProfessionalService & LocalBusiness branches */}
        <script
          key="ld-json-professional"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "ProfessionalService",
                  "@id": "https://urbateam.fr/#organization",
                  "name": "URBATEAM",
                  "url": "https://urbateam.fr",
                  "logo": "https://urbateam.fr/apple-touch-icon.png",
                  "image": "https://urbateam.fr/og-image.png",
                  "description": "Cabinet de Géomètres-Experts et urbanistes à Brest, Saint-Renan et Douarnenez.",
                  "telephone": "+33298842965",
                  "priceRange": "$$",
                  "sameAs": ["https://www.linkedin.com/company/urbateam"]
                },
                {
                  "@type": "LocalBusiness",
                  "parentOrganization": { "@id": "https://urbateam.fr/#organization" },
                  "name": "URBATEAM Saint-Renan",
                  "image": "https://urbateam.fr/og-image.png",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "10 Rue Joseph le Velly",
                    "addressLocality": "Saint-Renan",
                    "postalCode": "29290",
                    "addressCountry": "FR"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 48.4334336,
                    "longitude": -4.6247953
                  },
                  "telephone": "+33298842965",
                  "openingHours": "Mo,Tu,Th,Fr 09:00-12:00, 14:00-18:00",
                  "areaServed": [
                    { "@type": "City", "name": "Brest" },
                    { "@type": "City", "name": "Saint-Renan" },
                    { "@type": "City", "name": "Plouzané" },
                    { "@type": "City", "name": "Guilers" },
                    { "@type": "City", "name": "Gouesnou" },
                    { "@type": "City", "name": "Landerneau" },
                    { "@type": "City", "name": "Milizac" },
                    { "@type": "City", "name": "Locmaria-Plouzané" },
                    { "@type": "City", "name": "Plougastel-Daoulas" }
                  ]
                },
                {
                  "@type": "LocalBusiness",
                  "parentOrganization": { "@id": "https://urbateam.fr/#organization" },
                  "name": "URBATEAM Douarnenez",
                  "image": "https://urbateam.fr/og-image.png",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Za Ste Croix, 5 Rue Breizh Izel",
                    "addressLocality": "Douarnenez",
                    "postalCode": "29100",
                    "addressCountry": "FR"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 48.0836644,
                    "longitude": -4.311875
                  },
                  "telephone": "+33298920756",
                  "openingHours": "Mo,Tu,Th,Fr 09:00-12:00, 14:00-18:00",
                  "areaServed": [
                    { "@type": "City", "name": "Douarnenez" },
                    { "@type": "City", "name": "Quimper" },
                    { "@type": "City", "name": "Pont-Croix" },
                    { "@type": "City", "name": "Audierne" },
                    { "@type": "City", "name": "Plogonnec" },
                    { "@type": "City", "name": "Beuzec-Cap-Sizun" }
                  ]
                }
              ]
            })
          }}
        />

        {/* JSON-LD: Breadcrumbs */}
        <script
          key="ld-json-breadcrumbs"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Accueil",
                  "item": "https://urbateam.fr/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "À propos",
                  "item": "https://urbateam.fr/apropos"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${righteous.variable}`}>
        <LanguageProvider defaultLanguage={lang}>
          <ScrollProgress key="scroll-progress" />
          <BackToTop key="back-to-top" />
          <CookieBanner key="cookie-banner" />
          <StatsTracker key="stats-tracker" />
          <Header key="header" />

          <main id="main-content" key="main-content">
            {children}
          </main>
          <Footer key="footer" />
        </LanguageProvider>
      </body>
    </html>
  );
}
