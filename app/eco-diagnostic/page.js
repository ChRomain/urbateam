import EcoDiagnosticWrapper from './EcoDiagnosticWrapper';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Éco-Diagnostic Foncier & Risques Environnementaux | URBATEAM",
  description: "Évaluez instantanément les contraintes environnementales, les risques géologiques (retrait-gonflement des argiles, sismicité) et le potentiel solaire de votre parcelle cadastrale en temps réel. Obtenez un rapport d'expert.",
};

export default function EcoDiagnosticPage() {
  return <EcoDiagnosticWrapper />;
}
