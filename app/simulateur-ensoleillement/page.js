import SimulateurWrapper from './SimulateurWrapper';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Simulateur d'Ombre Portée & d'Ensoleillement | URBATEAM",
  description: "Calculez et simulez en direct 3D l'impact d'un projet de construction voisin sur votre ensoleillement. Visualisez les ombres portées, déterminez le pourcentage exact d'heures d'ensoleillement perdues par mois, et générez un rapport officiel d'expert.",
};

export default function SimulateurEnsoleillementPage() {
  return <SimulateurWrapper />;
}
