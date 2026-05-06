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

async function createSpecificUser() {
  console.log('🔐 Connexion...');
  const token = await getToken();

  // Trouver l'ID du rôle Administrateur
  const rolesRes = await fetch(`${DIRECTUS_URL}/roles`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data: roles } = await rolesRes.json();
  const adminRole = roles.find(r => r.name === 'Administrator');
  
  if (!adminRole) throw new Error('Rôle Administrateur non trouvé');

  const newUser = {
    first_name: 'Urbateam',
    last_name: 'Admin',
    email: 'admin@urbateam.fr',
    password: 'db3633bc45',
    role: adminRole.id,
    status: 'active'
  };

  console.log('👤 Création/Mise à jour de l\'utilisateur...');
  
  // On vérifie si l'utilisateur existe déjà pour le mettre à jour au lieu de créer un doublon
  const checkRes = await fetch(`${DIRECTUS_URL}/users?filter[email][_eq]=${newUser.email}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data: existingUsers } = await checkRes.json();

  let res;
  if (existingUsers.length > 0) {
    res = await fetch(`${DIRECTUS_URL}/users/${existingUsers[0].id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newUser)
    });
  } else {
    res = await fetch(`${DIRECTUS_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newUser)
    });
  }

  if (res.ok) {
    console.log('✅ Utilisateur Admin Urbateam créé/mis à jour avec succès !');
  } else {
    const err = await res.json();
    console.error('❌ Erreur :', err);
  }
}

createSpecificUser().catch(console.error);
