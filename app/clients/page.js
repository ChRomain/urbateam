import ClientsClient from './ClientsClient';
import { getClients } from '../../lib/supabase';

export const revalidate = 3600;

export const metadata = {
  title: 'Nos Clients | URBATEAM',
  description: 'Découvrez les clients qui font confiance au cabinet URBATEAM pour leurs projets d\'aménagement, de topographie et de foncier en Bretagne.',
};

export default async function ClientsPage() {
  const clients = await getClients();
  return <ClientsClient clients={clients} />;
}
