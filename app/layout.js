import { Montserrat, Righteous } from "next/font/google";
import "./globals.css";
import Header from './Header';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';
import CookieBanner from '../components/CookieBanner';
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
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://www.google.com;" />
        <meta name="permissions-policy" content="geolocation=(), camera=(), microphone=(), payment=()" />
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="require-corp" />
        
        {/* DNS & Connection Optimization */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google.com" />
        
        {/* HTTP/3 Hint */}
        <meta httpEquiv="alt-svc" content='h3=":443"; ma=86400' />

        {/* JSON-LD: ProfessionalService */}
        <script
          key="ld-json-professional"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "URBATEAM",
              "image": "https://urbateam.fr/og-image.png",
              "@id": "https://urbateam.fr",
              "url": "https://urbateam.fr",
              "telephone": "+33298842965",
              "address": [
                {
                  "@type": "PostalAddress",
                  "streetAddress": "10 Rue Joseph le Velly",
                  "addressLocality": "Saint-Renan",
                  "postalCode": "29290",
                  "addressCountry": "FR"
                },
                {
                  "@type": "PostalAddress",
                  "streetAddress": "Za Ste Croix, 5 Rue Breizh Izel",
                  "addressLocality": "Douarnenez",
                  "postalCode": "29100",
                  "addressCountry": "FR"
                }
              ],
              "geo": [
                {
                  "@type": "GeoCoordinates",
                  "latitude": 48.4334336,
                  "longitude": -4.6247953
                },
                {
                  "@type": "GeoCoordinates",
                  "latitude": 48.0836644,
                  "longitude": -4.311875
                }
              ],
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
              },
              "sameAs": [
                "https://www.linkedin.com/company/urbateam"
              ],
              "description": "Cabinet de Géomètres-Experts et urbanistes à Brest, Saint-Renan et Douarnenez."
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
