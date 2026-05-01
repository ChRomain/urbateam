import { Montserrat, Righteous } from "next/font/google";
import "./globals.css";
import Header from './Header';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import CookieBanner from '../components/CookieBanner';
import StatsTracker from '../components/StatsTracker';
import { LanguageProvider } from '../context/LanguageContext';


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

export const metadata = {
  title: "URBATEAM | Géomètre-Expert & Topographe à Brest, Saint-Renan et Douarnenez",
  description: "Cabinet de Géomètres-Experts et urbanistes à Brest, Saint-Renan et Douarnenez. Expertise foncière, topographie et aménagement à Landerneau, Saint-Urbain et Finistère-Nord.",
  icons: {
    icon: [
      { url: '/favicon.jpg', sizes: '32x32' },
      { url: '/web-app-icon.png', sizes: '192x192' }
    ],
    apple: '/apple-touch-icon.png',
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

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://www.google.com; connect-src 'self' https://www.google.com; media-src 'self' https://assets.mixkit.co https://player.vimeo.com https://vimeo.com https://*.pexels.com https://*.vimeocdn.com;" />
        <meta name="permissions-policy" content="geolocation=(self), camera=(), microphone=(), payment=()" />
        
        {/* DNS & Connection Optimization */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google.com" />

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
                  "logo": "https://urbateam.fr/favicon.jpg",
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
        <LanguageProvider>
          <ScrollProgress key="scroll-progress" />
          <BackToTop key="back-to-top" />
          <CookieBanner key="cookie-banner" />
          <StatsTracker key="stats-tracker" />
          <Header key="header" />

          <main key="main-content">
            {children}
          </main>
          <Footer key="footer" />
        </LanguageProvider>
      </body>
    </html>
  );
}
