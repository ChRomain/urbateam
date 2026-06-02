import ProfilLongWrapper from './ProfilLongWrapper';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profil en Long Dynamique & Coupe de Terrain | URBATEAM',
  description: 'Calculez instantanément le profil altimétrique (la coupe verticale) de votre terrain en 2 clics. Visualisez les dénivelés, pentes moyennes et simulez des terrassements en temps réel.',
};

export default function ProfilLongPage() {
  return <ProfilLongWrapper />;
}
