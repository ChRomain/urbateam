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
    ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : (DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {})),
    ...opts.headers,
  };

  try {
    const res = await fetch(url, {
      ...opts,
      headers,
      cache: 'no-store'
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
 * Récupère les articles de blog.
 * @param {string|null} status - Filtre par statut (published/draft). Si null, récupère tout (admin).
 * @returns {Promise<Array>}
 */
export async function getArticles(status = 'published') {
  let path = '/items/articles?sort[]=-date_published&fields[]=id,status,slug,title,excerpt,featured_image,date_published,author,tags,category';
  if (status) {
    path += `&filter[status][_eq]=${status}`;
  }
  const data = await directusFetch(path);
  return data ?? [];
}

/**
 * Récupère un article par son slug.
 * @param {string} slug
 * @param {string|null} status
 * @returns {Promise<object|null>}
 */
export async function getArticleBySlug(slug, status = 'published') {
  let path = `/items/articles?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`;
  if (status) {
    path += `&filter[status][_eq]=${status}`;
  }
  const data = await directusFetch(path);
  return data?.[0] ?? null;
}

// ─── Projets / Réalisations ─────────────────────────────────────────────────

/**
 * Récupère les projets.
 * @param {string|null} status - Filtre par statut.
 * @returns {Promise<Array>}
 */
export async function getProjets(status = 'published') {
  let path = '/items/projets?sort[]=-date&fields[]=id,status,slug,title,description,location,category,missions,image_after,image_before,images_gallery,date,technical_details,client,latitude,longitude';
  if (status) {
    path += `&filter[status][_eq]=${status}`;
  }
  const data = await directusFetch(path);
  return data ?? [];
}

/**
 * Récupère un projet par son slug.
 * @param {string} slug
 * @param {string|null} status
 * @returns {Promise<object|null>}
 */
export async function getProjetBySlug(slug, status = 'published') {
  let path = `/items/projets?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`;
  if (status) {
    path += `&filter[status][_eq]=${status}`;
  }
  const data = await directusFetch(path);
  return data?.[0] ?? null;
}

// ... existing clients, partenaires, faq, glossaire, team, social ...

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

/**
 * Récupère les informations de l'utilisateur actuel.
 */
export async function getCurrentUser(token) {
  const data = await directusFetch('/users/me?fields[]=id,email,first_name,last_name,role.id,role.name', { token });
  return data ?? null;
}

// ─── Opérations d'écriture (Admin) ───────────────────────────────────────────

/**
 * Crée un nouvel item dans une collection.
 */
export async function createItem(collection, data) {
  return await directusFetch(`/items/${collection}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Met à jour un item existant.
 */
export async function updateItem(collection, id, data) {
  return await directusFetch(`/items/${collection}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Supprime un item.
 */
export async function deleteItem(collection, id) {
  const res = await fetch(`${DIRECTUS_URL}/items/${collection}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    },
  });
  return res.ok;
}

/**
 * Upload un fichier dans Directus.
 * @param {File|Blob} file 
 * @returns {Promise<string|null>} - ID du fichier (UUID)
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    },
    body: formData,
  });

  if (!res.ok) {
    console.error(`[Directus] Erreur upload: ${res.status}`);
    return null;
  }

  const json = await res.json();
  return json.data.id;
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

