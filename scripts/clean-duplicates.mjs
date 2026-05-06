// scripts/clean-duplicates.mjs
import { readFile } from 'fs/promises';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@urbateam.fr';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'db3633bc45'; // Ton nouveau MDP

async function getToken() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const { data } = await res.json();
  return data.access_token;
}

async function cleanCollection(token, collection, uniqueKey) {
  console.log(`\n🧹 Nettoyage de la collection "${collection}"...`);
  
  const res = await fetch(`${DIRECTUS_URL}/items/${collection}?limit=-1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data: items } = await res.json();

  const seen = new Set();
  const duplicates = [];

  for (const item of items) {
    const key = item[uniqueKey];
    if (seen.has(key)) {
      duplicates.push(item.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicates.length === 0) {
    console.log(`✅ Aucun doublon trouvé dans "${collection}".`);
    return;
  }

  console.log(`🗑️  Suppression de ${duplicates.length} doublon(s)...`);
  
  await fetch(`${DIRECTUS_URL}/items/${collection}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(duplicates),
  });

  console.log(`✨ Collection "${collection}" nettoyée.`);
}

async function main() {
  try {
    const token = await getToken();
    console.log('🔐 Connecté à Directus');

    // Nettoyer les membres de l'équipe (clé unique : name_fr)
    await cleanCollection(token, 'team_members', 'name_fr');
    
    // Nettoyer les projets (clé unique : slug)
    await cleanCollection(token, 'projets', 'slug');
    
    // Nettoyer les articles (clé unique : slug)
    await cleanCollection(token, 'articles', 'slug');

    console.log('\n🚀 Nettoyage terminé !');
  } catch (error) {
    console.error('❌ Erreur :', error.message);
  }
}

main();
