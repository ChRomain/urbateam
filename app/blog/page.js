import { readFile } from 'fs/promises';
import path from 'path';
import BlogClient from './BlogClient';

export const metadata = {
  title: 'Actualités & Innovation | URBATEAM',
  description: 'Suivez les actualités d\'URBATEAM : conseils d\'experts géomètres, innovation Scanner 3D, projets d\'urbanisme et vie du cabinet en Bretagne.',
};

async function getBlogData() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'blog.json');
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogData();
  return <BlogClient posts={posts} />;
}
