// scripts/force-clean.mjs
const url = 'http://localhost:8055';
const email = 'admin@urbateam.fr';
const password = 'db3633bc45';

async function main() {
  const auth = await fetch(url + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());
  
  const token = auth.data.access_token;
  const collections = ['articles', 'projets', 'clients', 'partenaires', 'faq', 'glossaire', 'team_header', 'team_members', 'social_posts'];
  
  for (const col of collections) {
    let items = await fetch(`${url}/items/${col}?limit=-1`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    
    let ids = items.data?.map(i => i.id) || [];
    
    while (ids.length > 0) {
      console.log(`🗑️  Suppression de ${ids.length} items dans ${col}...`);
      await fetch(`${url}/items/${col}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(ids)
      });
      
      // On vérifie que c'est bien vide
      const check = await fetch(`${url}/items/${col}?limit=-1&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      ids = check.data?.map(i => i.id) || [];
    }
    console.log(`✅ ${col} est maintenant vide.`);
  }
}

main().catch(console.error);
