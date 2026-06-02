// scripts/seed-supabase.mjs
// Migre les fichiers JSON existants vers Supabase
//
// Usage : node --env-file=.env.local scripts/seed-supabase.mjs
// Prérequis : Supabase doit être configuré et les variables d'environnement
//             NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être
//             dans le fichier .env.local

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erreur : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local');
  process.exit(1);
}

// Initialise le client Supabase avec la clé service role (outrepasse les RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
  },
});

// Helper pour lire les fichiers JSON locaux
async function readJson(filename) {
  try {
    const filePath = path.join(ROOT, 'public', 'data', filename);
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.warn(`⚠️  Fichier non trouvé ou illisible : ${filename} (${err.message})`);
    return [];
  }
}

// Fonction générique pour vider et repeupler une table
async function populateTable(tableName, items) {
  if (!items || items.length === 0) {
    console.log(`ℹ️  Aucun item à insérer dans "${tableName}".`);
    return;
  }

  console.log(`⏳ Suppression des anciens éléments de "${tableName}"...`);
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .neq('status', 'non-existent-status'); // Supprime tout

  if (deleteError) {
    console.warn(`⚠️  Impossible de nettoyer "${tableName}" : ${deleteError.message}`);
  }

  console.log(`⏳ Insertion de ${items.length} éléments dans "${tableName}"...`);
  const { data, error } = await supabase
    .from(tableName)
    .insert(items)
    .select();

  if (error) {
    console.error(`❌ Erreur insertion dans "${tableName}" :`, error.message);
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log(`✅ ${data.length} éléments insérés avec succès dans "${tableName}".`);
  }
}

async function main() {
  console.log(`\n🚀 Peuplement de la base de données Supabase (${SUPABASE_URL})\n`);

  // 1. Articles (Blog)
  const blogRaw = await readJson('blog.json');
  const articles = blogRaw.map((p) => ({
    status: 'published',
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    featured_image: p.featuredImage || p.featured_image || null,
    author: p.author || 'URBATEAM',
    tags: p.tags || [],
    category: p.category || 'Actualité',
    date_published: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
  }));
  await populateTable('articles', articles);

  // 2. Projets
  const projetsRaw = await readJson('projets.json');
  const projets = projetsRaw.map((p) => ({
    status: 'published',
    slug: p.slug,
    title: p.title,
    description: p.description,
    location: p.location,
    category: p.category,
    client: p.client || null,
    missions: p.missions || [],
    technical_details: p.technicalDetails || null,
    image_before: p.images?.before || null,
    image_after: p.images?.after || null,
    images_gallery: p.images?.gallery || [],
    latitude: p.latitude || p.coords?.lat || null,
    longitude: p.longitude || p.coords?.lng || null,
    date: p.date ? new Date(p.date).toISOString() : null,
  }));
  await populateTable('projets', projets);

  // 3. Clients
  const clientsRaw = await readJson('clients.json');
  const clients = clientsRaw.map((c, idx) => ({
    status: 'published',
    sort: idx,
    name: c.name,
    logo: c.logo || null,
    tags: c.tags || [],
  }));
  await populateTable('clients', clients);

  // 4. Partenaires
  const partenairesRaw = await readJson('partners.json');
  const partenaires = partenairesRaw.map((p, idx) => ({
    status: 'published',
    sort: idx,
    name: p.name,
    logo: p.logo || null,
    role: p.role || null,
    website: p.website || p.url || null,
  }));
  await populateTable('partenaires', partenaires);

  // 5. FAQ (Multilingue)
  const faqRaw = await readJson('faq.json');
  const faqItems = faqRaw.map((item, idx) => ({
    status: 'published',
    sort: idx,
    question_fr: item.fr?.question || item.question || '',
    answer_fr: item.fr?.answer || item.answer || '',
    question_en: item.en?.question || '',
    answer_en: item.en?.answer || '',
    question_br: item.br?.question || '',
    answer_br: item.br?.answer || '',
    category: item.category || null,
  }));
  await populateTable('faq', faqItems);

  // 6. Glossaire (Multilingue)
  const glossaryRaw = await readJson('glossary.json');
  const glossaireItems = glossaryRaw.map((item, idx) => ({
    status: 'published',
    sort: idx,
    term_fr: item.fr?.term || item.term || '',
    definition_fr: item.fr?.definition || item.definition || '',
    term_en: item.en?.term || '',
    definition_en: item.en?.definition || '',
    term_br: item.br?.term || '',
    definition_br: item.br?.definition || '',
    related_expertise: item.relatedExpertise || null,
  }));
  await populateTable('glossaire', glossaireItems);

  // 7. Team Header
  const teamRaw = await readJson('team.json');
  if (teamRaw && teamRaw.header) {
    const headerItem = {
      id: 1, // contraint à 1 seule ligne dans la DB
      title_fr: teamRaw.header.fr?.title || '',
      subtitle_fr: teamRaw.header.fr?.subtitle || '',
      title_en: teamRaw.header.en?.title || '',
      subtitle_en: teamRaw.header.en?.subtitle || '',
      title_br: teamRaw.header.br?.title || '',
      subtitle_br: teamRaw.header.br?.subtitle || '',
      team_photo: teamRaw.header.teamPhoto || null,
    };

    console.log('⏳ Mise à jour de "team_header"...');
    const { error: headerErr } = await supabase
      .from('team_header')
      .upsert(headerItem);

    if (headerErr) {
      console.error('❌ Erreur upsert team_header :', headerErr.message);
    } else {
      console.log('✅ "team_header" peuplé avec succès.');
    }
  }

  // 8. Team Members
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
  await populateTable('team_members', teamMembers);

  // 9. Social Posts
  const socialRaw = await readJson('social.json');
  const socialPosts = socialRaw.map((post, idx) => ({
    status: 'published',
    sort: idx,
    url: post.url,
    caption: post.caption || '',
    date: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
  }));
  await populateTable('social_posts', socialPosts);

  console.log('\n🎉 Fin du peuplement Supabase ! Tout est prêt pour tester en local.\n');
}

main().catch((e) => {
  console.error('❌ Erreur fatale dans le script de seed :', e);
  process.exit(1);
});
