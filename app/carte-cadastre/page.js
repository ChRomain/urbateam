import CarteCadastreWrapper from './CarteCadastreWrapper';
import { getProjets } from '../../lib/supabase';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Carte Cadastre & Bornage Interactif | URBATEAM',
  description: 'Vérifiez gratuitement les limites de votre propriété, consultez le cadastre en direct et découvrez si votre terrain a déjà fait l\'objet d\'un bornage par nos experts à Brest, Saint-Renan et Douarnenez.',
};

export default async function CarteCadastrePage() {
  // Récupère les projets géoréférencés existants pour vérifier les bornages à proximité
  const projects = await getProjets();
  return <CarteCadastreWrapper projects={projects} />;
}
