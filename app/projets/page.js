import ProjetsClient from './ProjetsClient';

export const metadata = {
  title: 'Nos Réalisations | Géomètre-Expert & Aménagement | URBATEAM',
  description: 'Découvrez les projets et réalisations du cabinet URBATEAM en Bretagne-Ouest : expertise foncière, topographie haute précision, urbanisme et ingénierie VRD à Brest, Saint-Renan et Douarnenez.',
  keywords: 'projets géomètre, réalisations topographie, aménagement urbain bretagne, bornage brest, vrd finistère',
  openGraph: {
    title: 'Nos Réalisations | URBATEAM',
    description: 'De la topographie de précision à l\'aménagement urbain, découvrez nos projets en Bretagne-Ouest.',
    url: 'https://urbateam.fr/projets',
    images: [{ url: '/og-image.png' }],
  }
};

export default function ProjetsPage() {
  return <ProjetsClient />;
}
