import BlogClient from './BlogClient';
import { getArticles } from '../../lib/supabase';

export const metadata = {
  title: 'Actualités & Innovation | URBATEAM',
  description: 'Suivez les actualités d\'URBATEAM : conseils d\'experts géomètres, innovation Scanner 3D, projets d\'urbanisme et vie du cabinet en Bretagne.',
};

// ISR : revalider la page toutes les 60 secondes
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getArticles();
  return <BlogClient posts={posts} />;
}
