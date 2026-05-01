import { readFile } from 'fs/promises';
import path from 'path';
import SocialClient from './SocialClient';

async function getSocialData() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'social.json');
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

export default async function SocialPage() {
  const posts = await getSocialData();
  return <SocialClient initialPosts={posts} />;
}
