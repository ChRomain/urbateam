import { readFile } from 'fs/promises';
import path from 'path';
import ProjetDetailClient from './ProjetDetailClient';

async function getProjetsData() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'projets.json');
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

export async function generateStaticParams() {
  const projects = await getProjetsData();
  return projects.map((p) => ({
    slug: p.slug || p.id.toString(), // Support both slug and id
  }));
}

export default async function ProjetPage({ params }) {
  const { slug } = await params;
  return <ProjetDetailClient slug={slug} />;
}
