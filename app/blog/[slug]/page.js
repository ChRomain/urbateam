import { readFile } from 'fs/promises';
import path from 'path';
import ArticleClient from './ArticleClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const posts = await getBlogData();
  const post = posts.find((p) => p.slug === slug);
  
  if (!post) return { title: 'Article non trouvé | URBATEAM' };

  return {
    title: `${post.title} | URBATEAM`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

async function getBlogData() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'blog.json');
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

export async function generateStaticParams() {
  const posts = await getBlogData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const posts = await getBlogData();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return <div style={{ textAlign: 'center', padding: '10rem' }}>Article non trouvé.</div>;
  }

  return <ArticleClient post={post} />;
}
