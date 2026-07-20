import ClientsPartnersClient from './ClientsPartnersClient';
import { getClients, getPartenaires } from '../../lib/supabase';

export const revalidate = 3600;

export const metadata = {
  title: 'Nos Clients & Partenaires | URBATEAM',
  description: 'Découvrez notre écosystème : les collectivités, aménageurs, entreprises et particuliers qui nous font confiance, ainsi que notre réseau de partenaires experts (notaires, avocats, architectes).',
};

export default async function ClientsPartnersPage() {
  const [clients, partners] = await Promise.all([
    getClients(),
    getPartenaires()
  ]);

  return <ClientsPartnersClient clients={clients} partners={partners} />;
}
