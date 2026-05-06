const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@urbateam.fr';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Admin123!';

async function getToken() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const { data } = await res.json();
  return data.access_token;
}

async function setPublicPermissions() {
  console.log('🔐 Connexion à Directus...');
  const token = await getToken();

  // Liste des collections à rendre publiques en lecture seule
  const collections = [
    'articles', 'projets', 'clients', 'partenaires', 'faq', 
    'glossaire', 'team_header', 'team_members', 'social_posts', 
    'directus_files'
  ];

  console.log('🔓 Configuration des accès publics (Lecture seule)...');

  for (const collection of collections) {
    const res = await fetch(`${DIRECTUS_URL}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: null, // null signifie le rôle Public dans Directus
        collection: collection,
        action: 'read',
        permissions: {},
        validation: {},
        fields: ['*']
      })
    });

    if (res.ok) {
      console.log(`✅ Accès public activé pour : ${collection}`);
    } else {
      const err = await res.json();
      // Si la permission existe déjà, on ignore
      if (err.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        console.log(`ℹ️  Accès déjà configuré pour : ${collection}`);
      } else {
        console.error(`❌ Erreur pour ${collection}:`, err);
      }
    }
  }

  console.log('\n✨ Terminé ! Ton site Next.js peut maintenant lire les données.');
}

setPublicPermissions().catch(console.error);
