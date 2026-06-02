import SimulateurWrapper from './SimulateurWrapper';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Simulateur de Division de Terrain & Faisabilité | URBATEAM',
  description: 'Simulez en direct la division parcellaire de votre propriété foncière. Dessinez votre ligne de découpe virtuelle, calculez les surfaces estimées et vérifiez la faisabilité réglementaire de vos terrains avec URBATEAM.',
};

export default function SimulateurDivisionPage() {
  return <SimulateurWrapper />;
}
