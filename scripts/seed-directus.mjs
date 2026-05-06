// scripts/seed-directus.js
// Migre les fichiers JSON existants vers Directus au premier démarrage
//
// Usage : node scripts/seed-directus.js
// Prérequis : Directus doit être lancé et DIRECTUS_URL + DIRECTUS_ADMIN_EMAIL
//             + DIRECTUS_ADMIN_PASSWORD doivent être définis dans .env.local

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@urbateam.fr';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Db3633bc45*';

// ─── Auth ─────────────────────────────────────────────────────────────────

async function getToken() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Impossible de se connecter à Directus : ${res.status}`);
  const { data } = await res.json();
  return data.access_token;
}

// ─── Création de collections ───────────────────────────────────────────────

async function createCollection(token, collection, fields) {
  const check = await fetch(`${DIRECTUS_URL}/collections/${collection}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (check.ok) {
    console.log(`ℹ️  Collection "${collection}" existe déjà, skip.`);
    return;
  }

  const res = await fetch(`${DIRECTUS_URL}/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      collection,
      meta: { icon: 'article', display_template: '{{title}}' },
      schema: {},
      fields,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur création collection "${collection}": ${err}`);
  }
  console.log(`✅ Collection "${collection}" créée.`);
}

// ─── Insertion des items ───────────────────────────────────────────────────

async function insertItems(token, collection, items) {
  if (!items.length) return;

  // VERIFICATION : On regarde si la collection est déjà remplie (avec un anti-cache)
  const check = await fetch(`${DIRECTUS_URL}/items/${collection}?limit=1&cache_bust=${Date.now()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const existing = await check.json();
  
  if (existing.data && existing.data.length > 0) {
    console.log(`ℹ️  Collection "${collection}" a déjà ${existing.data.length} item(s). Premier item :`, JSON.stringify(existing.data[0]));
    return;
  }

  const res = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(items),
  });
  if (!res.ok) {
    const err = await res.text();
    console.warn(`⚠️  Erreur insertion dans "${collection}": ${err}`);
    return;
  }
  const { data } = await res.json();
  console.log(`✅ ${data.length} item(s) insérés dans "${collection}".`);
}

// ─── Lecture des JSON existants ────────────────────────────────────────────

async function readJson(filename) {
  try {
    const filePath = path.join(ROOT, 'public', 'data', filename);
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    console.warn(`⚠️  Fichier non trouvé : ${filename}`);
    return [];
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Migration des données vers Directus (${DIRECTUS_URL})\n`);

  let token;
  try {
    token = await getToken();
    console.log('🔐 Connecté à Directus\n');
  } catch (e) {
    console.error(e.message);
    console.error('\nAssurez-vous que Directus est démarré : docker compose up directus');
    process.exit(1);
  }

// ─── Schémas des collections ──────────────────────────────────────────────
  const commonFields = [
    { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Publié', value: 'published' }, { text: 'Brouillon', value: 'draft' }] } }, schema: { default_value: 'published' } },
    { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true }, schema: {} },
  ];

  await createCollection(token, 'articles', [
    ...commonFields,
    { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
    { field: 'title', type: 'string', meta: { interface: 'input', required: true }, schema: {} },
    { field: 'excerpt', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html' }, schema: {} },
    { field: 'featured_image', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'author', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'tags', type: 'json', meta: { interface: 'tags' }, schema: {} },
    { field: 'category', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'date_published', type: 'timestamp', meta: { interface: 'datetime' }, schema: {} },
  ]);

  await createCollection(token, 'projets', [
    ...commonFields,
    { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
    { field: 'title', type: 'string', meta: { interface: 'input', required: true }, schema: {} },
    { field: 'description', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'location', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'category', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'client', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'missions', type: 'json', meta: { interface: 'tags' }, schema: {} },
    { field: 'technical_details', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'image_before', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'image_after', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'images_gallery', type: 'json', meta: { interface: 'tags' }, schema: {} },
    { field: 'date', type: 'timestamp', meta: { interface: 'datetime' }, schema: {} },
  ]);

  await createCollection(token, 'clients', [
    ...commonFields,
    { field: 'name', type: 'string', meta: { interface: 'input', required: true }, schema: {} },
    { field: 'logo', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'tags', type: 'json', meta: { interface: 'tags' }, schema: {} },
  ]);

  await createCollection(token, 'partenaires', [
    ...commonFields,
    { field: 'name', type: 'string', meta: { interface: 'input', required: true }, schema: {} },
    { field: 'logo', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'role', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'website', type: 'string', meta: { interface: 'input' }, schema: {} },
  ]);

  // FAQ multilingue (fr/en/br)
  await createCollection(token, 'faq', [
    ...commonFields,
    { field: 'question_fr', type: 'string', meta: { interface: 'input', required: true }, schema: {} },
    { field: 'answer_fr', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'question_en', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'answer_en', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'question_br', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'answer_br', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'category', type: 'string', meta: { interface: 'input' }, schema: {} },
  ]);

  // Glossaire / Lexique multilingue
  await createCollection(token, 'glossaire', [
    ...commonFields,
    { field: 'term_fr', type: 'string', meta: { interface: 'input', required: true }, schema: {} },
    { field: 'definition_fr', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'term_en', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'definition_en', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'term_br', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'definition_br', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'related_expertise', type: 'string', meta: { interface: 'input' }, schema: {} },
  ]);

  // Header de l'équipe (multilingue)
  await createCollection(token, 'team_header', [
    { field: 'title_fr', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'subtitle_fr', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'title_en', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'subtitle_en', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'title_br', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'subtitle_br', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'team_photo', type: 'string', meta: { interface: 'input' }, schema: {} },
  ]);

  // Membres de l'équipe (multilingue)
  await createCollection(token, 'team_members', [
    ...commonFields,
    { field: 'slug', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } },
    { field: 'image', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'linkedin', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'generic', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
    { field: 'email', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } },
    { field: 'phone', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'name_fr', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'role_fr', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'desc_fr', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'name_en', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'role_en', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'desc_en', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'name_br', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'role_br', type: 'string', meta: { interface: 'input' }, schema: {} },
    { field: 'desc_br', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
  ]);

  // Posts sociaux (photos avec légendes)
  await createCollection(token, 'social_posts', [
    ...commonFields,
    { field: 'url', type: 'string', meta: { interface: 'input', required: true }, schema: {} },
    { field: 'caption', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    { field: 'date', type: 'timestamp', meta: { interface: 'datetime' }, schema: {} },
  ]);

  // ── Migration des données ─────────────────────────────────────────────────
  console.log('\n📦 Migration des données JSON...\n');

  // Articles
  const blogRaw = await readJson('blog.json');
  const articles = blogRaw.map((p) => ({
    status: 'published',
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    featured_image: p.featuredImage || p.featured_image,
    author: p.author,
    tags: p.tags || [],
    category: p.category || null,
    date_published: p.date,
  }));
  await insertItems(token, 'articles', articles);

  // Projets
  const projetsRaw = await readJson('projets.json');
  const projets = projetsRaw.map((p) => ({
    status: 'published',
    slug: p.slug,
    title: p.title,
    description: p.description,
    location: p.location,
    category: p.category,
    client: p.client,
    missions: p.missions || [],
    technical_details: p.technicalDetails,
    image_before: p.images?.before || null,
    image_after: p.images?.after || null,
    images_gallery: p.images?.gallery || [],
    date: p.date,
  }));
  await insertItems(token, 'projets', projets);

  // Clients
  const clientsRaw = await readJson('clients.json');
  const clients = clientsRaw.map((c) => ({
    status: 'published',
    name: c.name,
    logo: c.logo,
    tags: c.tags || [],
  }));
  await insertItems(token, 'clients', clients);

  // Partenaires
  const partenairesRaw = await readJson('partners.json');
  const partenaires = partenairesRaw.map((p) => ({
    status: 'published',
    name: p.name,
    logo: p.logo || null,
    role: p.role || null,
    website: p.website || p.url || null,
  }));
  await insertItems(token, 'partenaires', partenaires);

  // FAQ (multilingue : chaque item a fr/en/br)
  const faqRaw = await readJson('faq.json');
  const faqItems = faqRaw.map((item) => ({
    status: 'published',
    question_fr: item.fr?.question || item.question || '',
    answer_fr: item.fr?.answer || item.answer || '',
    question_en: item.en?.question || '',
    answer_en: item.en?.answer || '',
    question_br: item.br?.question || '',
    answer_br: item.br?.answer || '',
    category: item.category || null,
  }));
  await insertItems(token, 'faq', faqItems);

  // Glossaire (multilingue)
  const glossaryRaw = await readJson('glossary.json');
  const glossaireItems = glossaryRaw.map((item) => ({
    status: 'published',
    term_fr: item.fr?.term || item.term || '',
    definition_fr: item.fr?.definition || item.definition || '',
    term_en: item.en?.term || '',
    definition_en: item.en?.definition || '',
    term_br: item.br?.term || '',
    definition_br: item.br?.definition || '',
    related_expertise: item.relatedExpertise || null,
  }));
  await insertItems(token, 'glossaire', glossaireItems);

  // Équipe (header + membres)
  const teamRaw = await readJson('team.json');
  if (teamRaw && teamRaw.header) {
    await insertItems(token, 'team_header', [{
      title_fr: teamRaw.header.fr?.title || '',
      subtitle_fr: teamRaw.header.fr?.subtitle || '',
      title_en: teamRaw.header.en?.title || '',
      subtitle_en: teamRaw.header.en?.subtitle || '',
      title_br: teamRaw.header.br?.title || '',
      subtitle_br: teamRaw.header.br?.subtitle || '',
      team_photo: teamRaw.header.teamPhoto || null,
    }]);
  }

  const teamMembers = (teamRaw.members || []).map((m, idx) => ({
    slug: m.id || `member-${idx}`,
    status: 'published',
    sort: m.order ?? idx,
    image: m.image || null,
    linkedin: m.linkedin || null,
    generic: m.generic || false,
    email: m.fr?.email || null,
    phone: m.fr?.phone || null,
    name_fr: m.fr?.name || '',
    role_fr: m.fr?.role || '',
    desc_fr: m.fr?.desc || '',
    name_en: m.en?.name || '',
    role_en: m.en?.role || '',
    desc_en: m.en?.desc || '',
    name_br: m.br?.name || '',
    role_br: m.br?.role || '',
    desc_br: m.br?.desc || '',
  }));
  await insertItems(token, 'team_members', teamMembers);

  // Posts sociaux (photos avec légendes)
  const socialRaw = await readJson('social.json');
  const socialPosts = socialRaw.map((post) => ({
    status: 'published',
    url: post.url,
    caption: post.caption || '',
    date: post.date || new Date().toISOString(),
  }));
  await insertItems(token, 'social_posts', socialPosts);

  console.log('\n🎉 Migration terminée ! Rendez-vous sur http://localhost:8055\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
