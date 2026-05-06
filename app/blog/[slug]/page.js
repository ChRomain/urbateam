import ArticleClient from './ArticleClient';
import { getArticles, getArticleBySlug } from '../../../lib/directus';

// ISR : revalider toutes les 60 secondes
export const revalidate = 3600;

// Rendre dynamique les slugs non connus au build
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);

  if (!post) return { title: 'Article non trouvé | URBATEAM' };

  return {
    title: `${post.title} | URBATEAM`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featured_image],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getArticles();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);

  if (!post) {
    return <div style={{ textAlign: 'center', padding: '10rem' }}>Article non trouvé.</div>;
  }

  return <ArticleClient post={post} />;
}
