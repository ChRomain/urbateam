import ClientsPartnersClient from './ClientsPartnersClient';
import { getClients, getPartenaires } from '../../lib/supabase';

export const revalidate = 3600;

export const metadata = {
  title: 'Ils nous font confiance | URBATEAM',
  description: 'Découvrez les collectivités, aménageurs, entreprises et particuliers qui font confiance à URBATEAM.',
};

export default async function ClientsPartnersPage() {
  const [clients, partners] = await Promise.all([
    getClients(),
    getPartenaires()
  ]);

  return <ClientsPartnersClient clients={clients} partners={partners} />;
}
