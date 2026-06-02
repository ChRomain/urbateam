import SocialClient from './SocialClient';
import { getSocialPosts } from '../../lib/supabase';

export const revalidate = 3600;

export const metadata = {
  title: 'Nous Suivre | URBATEAM',
  description: 'Suivez URBATEAM sur les réseaux sociaux et découvrez nos dernières publications Instagram, LinkedIn et Facebook.',
};

export default async function SocialPage() {
  const posts = await getSocialPosts();
  return <SocialClient initialPosts={posts} />;
}
