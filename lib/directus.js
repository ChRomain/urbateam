/**
 * lib/directus.js
 * Client Directus pour l'API Urbateam
 *
 * Collections Directus attendues :
 *   - articles  (blog)
 *   - projets
 *   - clients
 *   - partenaires
 *   - faq
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_API_TOKEN || '';

/**
 * Requête générique vers l'API Directus
 * @param {string} path  - ex: '/items/articles?sort[]=-date_published'
 * @param {object} opts  - options fetch supplémentaires
 */
async function directusFetch(path, opts = {}) {
  const url = `${DIRECTUS_URL}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {}),
    ...opts.headers,
  };

  try {
    const res = await fetch(url, {
      ...opts,
      headers,
      // ISR : revalider le cache toutes les 60 secondes en production
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`[Directus] Erreur ${res.status} sur ${url}`);
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    // Directus indisponible (ex: au build time sans conteneur actif)
    console.warn(`[Directus] Indisponible (${url}) : ${err.message}`);
    return null;
  }
}

// ─── Articles de blog ──────────────────────────────────────────────────────

/**
 * Récupère tous les articles publiés, triés par date décroissante.
 * @returns {Promise<Array>}
 */
export async function getArticles() {
  const data = await directusFetch(
    '/items/articles?filter[status][_eq]=published&sort[]=-date_published&fields[]=id,slug,title,excerpt,featured_image,date_published,author,tags,category'
  );
  return data ?? [];
}

/**
 * Récupère un article par son slug.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getArticleBySlug(slug) {
  const data = await directusFetch(
    `/items/articles?filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&limit=1`
  );
  return data?.[0] ?? null;
}

// ─── Projets / Réalisations ─────────────────────────────────────────────────

/**
 * Récupère tous les projets publiés.
 * @returns {Promise<Array>}
 */
export async function getProjets() {
  const data = await directusFetch(
    '/items/projets?filter[status][_eq]=published&sort[]=-date&fields[]=id,slug,title,description,location,category,missions,image_after,image_before,images_gallery,date'
  );
  return data ?? [];
}

/**
 * Récupère un projet par son slug.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getProjetBySlug(slug) {
  const data = await directusFetch(
    `/items/projets?filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&limit=1`
  );
  return data?.[0] ?? null;
}

// ─── Clients / Références ───────────────────────────────────────────────────

/**
 * Récupère tous les clients actifs.
 * @returns {Promise<Array>}
 */
export async function getClients() {
  const data = await directusFetch(
    '/items/clients?filter[status][_eq]=published&sort[]=name&fields[]=id,name,logo,tags'
  );
  return data ?? [];
}

// ─── Partenaires ────────────────────────────────────────────────────────────

/**
 * Récupère tous les partenaires publiés.
 * @returns {Promise<Array>}
 */
export async function getPartenaires() {
  const data = await directusFetch(
    '/items/partenaires?filter[status][_eq]=published&sort[]=sort&fields[]=id,name,logo,role,website'
  );
  return data ?? [];
}

// ─── FAQ ────────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les questions FAQ publiées (multilingue : fr/en/br).
 * @returns {Promise<Array>}
 */
export async function getFaq() {
  const data = await directusFetch(
    '/items/faq?filter[status][_eq]=published&sort[]=sort&fields[]=id,question_fr,answer_fr,question_en,answer_en,question_br,answer_br,category'
  );
  return data ?? [];
}

// ─── Glossaire / Lexique ────────────────────────────────────────────────────

/**
 * Récupère tous les termes du glossaire publiés (multilingue).
 * @returns {Promise<Array>}
 */
export async function getGlossaire() {
  const data = await directusFetch(
    '/items/glossaire?filter[status][_eq]=published&sort[]=term_fr&fields[]=id,term_fr,definition_fr,term_en,definition_en,term_br,definition_br,related_expertise'
  );
  return data ?? [];
}

// ─── Équipe ─────────────────────────────────────────────────────────────────

/**
 * Récupère les données de l'équipe (header + membres).
 * @returns {Promise<{header: object, members: Array}>}
 */
export async function getTeam() {
  const [headerData, membersData] = await Promise.all([
    directusFetch('/items/team_header?limit=1'),
    directusFetch(
      '/items/team_members?filter[status][_eq]=published&sort[]=sort&fields[]=id,image,linkedin,generic,name_fr,role_fr,desc_fr,email,phone,name_en,role_en,desc_en,name_br,role_br,desc_br'
    ),
  ]);

  const header = headerData?.[0] ?? {};
  return {
    header: {
      fr: { title: header.title_fr, subtitle: header.subtitle_fr },
      en: { title: header.title_en, subtitle: header.subtitle_en },
      br: { title: header.title_br, subtitle: header.subtitle_br },
      teamPhoto: header.team_photo ?? null,
    },
    members: (membersData ?? []).map((m) => ({
      id: m.id,
      image: m.image,
      linkedin: m.linkedin,
      generic: m.generic,
      fr: { name: m.name_fr, role: m.role_fr, desc: m.desc_fr, email: m.email, phone: m.phone },
      en: { name: m.name_en, role: m.role_en, desc: m.desc_en, email: m.email, phone: m.phone },
      br: { name: m.name_br, role: m.role_br, desc: m.desc_br, email: m.email, phone: m.phone },
    })),
  };
}

// ─── Posts sociaux (Instagram / fil de photos) ───────────────────────────────

/**
 * Récupère les posts sociaux (photos avec légendes), triés par date décroissante.
 * @returns {Promise<Array>}
 */
export async function getSocialPosts() {
  const data = await directusFetch(
    '/items/social_posts?filter[status][_eq]=published&sort[]=-date&fields[]=id,url,caption,date'
  );
  return data ?? [];
}

// ─── Helpers pour les URLs d'images Directus ───────────────────────────────

/**
 * Retourne l'URL publique d'un asset Directus par son ID.
 * @param {string|null} assetId  - UUID de l'asset dans Directus
 * @param {object} transforms    - transformations image optionnelles
 * @returns {string}
 */
export function getAssetUrl(assetId, transforms = {}) {
  if (!assetId) return '';

  const publicUrl =
    process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

  // Si c'est déjà une URL absolue (anciens uploads /uploads/...)
  if (assetId.startsWith('/') || assetId.startsWith('http')) return assetId;

  const params = new URLSearchParams(transforms).toString();
  return `${publicUrl}/assets/${assetId}${params ? `?${params}` : ''}`;
}
