import PartnersClient from './PartnersClient';
import { getPartenaires } from '../../lib/directus';

export const revalidate = 3600;

export const metadata = {
  title: 'Partenaires | URBATEAM',
  description: 'Découvrez notre réseau de partenaires experts : notaires, avocats et architectes.',
};

export default async function PartnersPage() {
  const partners = await getPartenaires();
  return <PartnersClient partners={partners} />;
}
