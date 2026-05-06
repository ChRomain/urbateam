import ProjetDetailClient from './ProjetDetailClient';
import { getProjets, getProjetBySlug } from '../../../lib/directus';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjets();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjetPage({ params }) {
  const { slug } = await params;
  const project = await getProjetBySlug(slug);
  return <ProjetDetailClient project={project} />;
}

