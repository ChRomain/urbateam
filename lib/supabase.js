/**
 * lib/supabase.js
 * Client Supabase pour l'API Urbateam
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Crée le client Supabase standard (pour l'usage client ou serveur public)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Crée le client d'administration Supabase (pour contourner RLS dans les routes d'API sécurisées)
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
  : supabase;


/**
 * Helper pour formater les URLs d'images Supabase Storage.
 * Supporte les transformations à la volée de Supabase Storage :
 * https://supabase.com/docs/guides/storage/serving/image-transformations
 *
 * @param {string} assetId - Nom du fichier dans le bucket OU URL absolue
 * @param {Object} transforms - Options de transformation
 * @param {number} [transforms.width]   - Largeur cible en pixels
 * @param {number} [transforms.height]  - Hauteur cible en pixels
 * @param {number} [transforms.quality] - Qualité (1-100, défaut 80)
 * @param {'origin'|'avif'|'webp'|'jpeg'} [transforms.format] - Format de sortie
 * @param {'cover'|'contain'|'fill'} [transforms.resize] - Mode de recadrage
 */
export function getAssetUrl(assetId, transforms = {}) {
  if (!assetId) return '';

  // Si c'est déjà une URL absolue ou un chemin local, la retourner telle quelle
  if (assetId.startsWith('/') || assetId.startsWith('http')) return assetId;

  // Construire l'URL de base vers le bucket Supabase
  const baseUrl = `${SUPABASE_URL}/storage/v1/render/image/public/urbateam-media/${assetId}`;

  // Construire les paramètres de transformation si fournis
  const params = new URLSearchParams();
  if (transforms.width) params.set('width', transforms.width);
  if (transforms.height) params.set('height', transforms.height);
  if (transforms.quality) params.set('quality', transforms.quality);
  if (transforms.format) params.set('format', transforms.format);
  if (transforms.resize) params.set('resize', transforms.resize);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Raccourci pour les vignettes de cartes et de listes (400×280 WebP, qualité 80).
 * Usage : getThumbnailUrl(assetId)
 */
export function getThumbnailUrl(assetId) {
  return getAssetUrl(assetId, { width: 800, quality: 80, format: 'webp', resize: 'cover' });
}

/**
 * Raccourci pour les images pleine-largeur (hero, banner, og) (1200 px, qualité 85).
 * Usage : getHeroUrl(assetId)
 */
export function getHeroUrl(assetId) {
  return getAssetUrl(assetId, { width: 1200, quality: 85, format: 'webp', resize: 'cover' });
}

/**
 * Raccourci pour les petits logos et avatars.
 * Utilise l'URL directe (sans transformation) pour supporter
 * tous les formats — y compris les PNG avec transparence.
 * Usage : getLogoUrl(assetId)
 */
export function getLogoUrl(assetId) {
  if (!assetId) return '';
  if (assetId.startsWith('/') || assetId.startsWith('http')) return assetId;
  // URL directe : compatible tous formats (PNG, SVG, WebP, JPG…)
  return `${SUPABASE_URL}/storage/v1/object/public/urbateam-media/${assetId}`;
}


// ─── Articles de blog ──────────────────────────────────────────────────────

export async function getArticles(status = 'published') {
  let query = supabase
    .from('articles')
    .select('id,status,slug,title,excerpt,featured_image,date_published,author,tags,category')
    .order('date_published', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Supabase] getArticles error:', error.message);
    return [];
  }

  // Adapter les URLs des images — vignettes 800px WebP optimisées
  return (data || []).map(art => ({
    ...art,
    featured_image: getThumbnailUrl(art.featured_image),
    featuredImage: getThumbnailUrl(art.featured_image)
  }));
}

export async function getArticleBySlug(slug, status = 'published') {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .limit(1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    if (error) console.error('[Supabase] getArticleBySlug error:', error.message);
    return null;
  }

  const art = data[0];
  return {
    ...art,
    // Image pleine largeur pour la page article (1200px WebP)
    featured_image: getHeroUrl(art.featured_image),
    featuredImage: getHeroUrl(art.featured_image)
  };
}

// ─── Projets / Réalisations ─────────────────────────────────────────────────

export async function getProjets(status = 'published') {
  let dbItems = [];
  try {
    let query = supabase
      .from('projets')
      .select('*')
      .order('date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (!error && data) {
      dbItems = data;
    }
  } catch (dbErr) {
    console.warn('[Supabase] getProjets fetch error:', dbErr?.message);
  }

  // Load public/data/projets.json to preserve subcategory if column missing in Supabase DB
  let localItems = [];
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'projets.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      localItems = JSON.parse(fileData);
    } catch {
      localItems = [];
    }
  }

  let finalItems = [];
  if (dbItems.length > 0) {
    const localMap = new Map(localItems.map(item => [String(item.id || item.slug), item]));
    finalItems = dbItems.map(item => {
      const key = String(item.id || item.slug);
      const local = localMap.get(key) || {};
      return {
        ...item,
        subcategory: item.subcategory || local.subcategory || ''
      };
    });
  } else {
    finalItems = localItems;
  }

  return finalItems.map(p => ({
    ...p,
    image_before: getThumbnailUrl(p.image_before),
    image_after:  getThumbnailUrl(p.image_after),
    images_gallery: (p.images_gallery || []).map(img => getLogoUrl(img)),
    documents: (p.documents || []).map(doc => ({
      name: doc.name,
      url: getLogoUrl(doc.url)
    }))
  }));
}

export async function getProjetBySlug(slug, status = 'published') {
  let project = null;
  try {
    let query = supabase
      .from('projets')
      .select('*')
      .eq('slug', slug)
      .limit(1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      project = data[0];
    }
  } catch (err) {
    console.warn('[Supabase] getProjetBySlug fetch error:', err?.message);
  }

  let localProject = null;
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'projets.json');
      const fileData = await fs.readFile(jsonPath, 'utf8');
      const items = JSON.parse(fileData);
      localProject = items.find(p => p.slug === slug || String(p.id) === String(slug));
    } catch {}
  }

  const p = {
    ...(localProject || {}),
    ...(project || {}),
    subcategory: (project && project.subcategory) || (localProject && localProject.subcategory) || ''
  };

  if (!p || (!p.title && !p.id)) return null;

  return {
    ...p,
    image_before:   getHeroUrl(p.image_before),
    image_after:    getHeroUrl(p.image_after),
    images_gallery: (p.images_gallery || []).map(img => getLogoUrl(img)),
    documents: (p.documents || []).map(doc => ({
      name: doc.name,
      url: getLogoUrl(doc.url)
    }))
  };
}

// ─── Clients / Références ───────────────────────────────────────────────────

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id,name,logo,tags,in_carousel')
    .eq('status', 'published')
    .order('sort', { ascending: true });

  if (error) {
    console.error('[Supabase] getClients error:', error.message);
    return [];
  }

  return (data || []).map(c => ({
    ...c,
    logo: getLogoUrl(c.logo)
  }));
}

export async function getCarouselClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id,name,logo,tags,in_carousel')
    .eq('status', 'published')
    .eq('in_carousel', true)
    .order('sort', { ascending: true });

  if (error) {
    console.error('[Supabase] getCarouselClients error:', error.message);
    return [];
  }

  return (data || []).map(c => ({
    ...c,
    logo: getLogoUrl(c.logo)
  }));
}

// ─── Partenaires ────────────────────────────────────────────────────────────

export async function getPartenaires() {
  const { data, error } = await supabase
    .from('partenaires')
    .select('id,name,logo,role,website')
    .eq('status', 'published')
    .order('sort', { ascending: true });

  if (error) {
    console.error('[Supabase] getPartenaires error:', error.message);
    return [];
  }

  return (data || []).map(p => ({
    ...p,
    logo: getLogoUrl(p.logo)
  }));
}

// ─── FAQ ────────────────────────────────────────────────────────────────────

export async function getFaq() {
  const { data, error } = await supabase
    .from('faq')
    .select('id,question_fr,answer_fr,question_en,answer_en,question_br,answer_br,category')
    .eq('status', 'published')
    .order('sort', { ascending: true });

  if (error) {
    console.error('[Supabase] getFaq error:', error.message);
    return [];
  }

  return data ?? [];
}

// ─── Glossaire / Lexique ────────────────────────────────────────────────────

export async function getGlossaire() {
  const { data, error } = await supabase
    .from('glossaire')
    .select('id,term_fr,definition_fr,term_en,definition_en,term_br,definition_br,related_expertise')
    .eq('status', 'published')
    .order('term_fr', { ascending: true });

  if (error) {
    console.error('[Supabase] getGlossaire error:', error.message);
    return [];
  }

  return data ?? [];
}

// ─── Équipe ─────────────────────────────────────────────────────────────────

export async function getTeam() {
  const [headerRes, membersRes] = await Promise.all([
    supabase.from('team_header').select('*').eq('id', 1).limit(1),
    supabase.from('team_members').select('*').eq('status', 'published').order('sort', { ascending: true })
  ]);

  const header = headerRes.data?.[0] ?? {};
  const membersData = membersRes.data ?? [];

  return {
    header: {
      fr: { title: header.title_fr, subtitle: header.subtitle_fr },
      en: { title: header.title_en, subtitle: header.subtitle_en },
      br: { title: header.title_br, subtitle: header.subtitle_br },
      teamPhoto: getHeroUrl(header.team_photo), // photo d'équipe pleine largeur
    },
    members: membersData.map((m) => ({
      id: m.id,
      image: getThumbnailUrl(m.image), // portrait membre : 800px WebP
      linkedin: m.linkedin,
      generic: m.generic,
      fr: { name: m.name_fr, role: m.role_fr, desc: m.desc_fr, email: m.email, phone: m.phone },
      en: { name: m.name_en, role: m.role_en, desc: m.desc_en, email: m.email, phone: m.phone },
      br: { name: m.name_br, role: m.role_br, desc: m.desc_br, email: m.email, phone: m.phone },
    })),
  };
}

// ─── Posts sociaux (Instagram) ──────────────────────────────────────────────

export async function getSocialPosts() {
  const { data, error } = await supabase
    .from('social_posts')
    .select('id,url,caption,date')
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) {
    console.error('[Supabase] getSocialPosts error:', error.message);
    return [];
  }

  return data ?? [];
}

// ─── Textes du site & traductions ───────────────────────────────────────────

export async function getSiteTexts() {
  const { data, error } = await supabase
    .from('site_texts')
    .select('key,fr,en,br');

  if (error) {
    console.error('[Supabase] getSiteTexts error:', error.message);
    return [];
  }

  return data ?? [];
}

export async function getCurrentUser(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    if (error) console.error('[Supabase] getCurrentUser error:', error.message);
    return null;
  }

  // Attribution dynamique du rôle basé sur l'email d'administration sécurisé
  const roleName = user.email === 'admin@urbateam.fr' ? 'Administrator' : 'Lecteur';

  return {
    id: user.id,
    email: user.email,
    first_name: user.user_metadata?.first_name || 'Admin',
    last_name: user.user_metadata?.last_name || 'Urbateam',
    role: {
      name: roleName
    }
  };
}

// ─── Opérations d'écriture (Admin) ───────────────────────────────────────────

export async function createItem(collection, data) {
  const { data: result, error } = await supabaseAdmin
    .from(collection)
    .insert([data])
    .select();

  if (error) {
    console.error(`[Supabase] createItem on ${collection} error:`, error.message);
    throw new Error(error.message);
  }
  return result?.[0] ?? null;
}

export async function updateItem(collection, id, data) {
  const { data: result, error } = await supabaseAdmin
    .from(collection)
    .update(data)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`[Supabase] updateItem on ${collection} error:`, error.message);
    throw new Error(error.message);
  }
  return result?.[0] ?? null;
}

export async function deleteItem(collection, id) {
  try {
    const targetId = (!isNaN(id) && String(id).trim() !== '') ? Number(id) : id;
    let { error } = await supabaseAdmin
      .from(collection)
      .delete()
      .eq('id', targetId);

    if (error) {
      const { error: err2 } = await supabaseAdmin
        .from(collection)
        .delete()
        .eq(collection === 'projets' ? 'slug' : 'id', String(id));

      if (err2) {
        console.error(`[Supabase] deleteItem on ${collection} error:`, err2.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] deleteItem exception:`, err.message);
    return false;
  }
}

// ─── Upload de fichiers (Supabase Storage) ───────────────────────────────────

export async function uploadFile(file) {
  try {
    const name = file.name || `file-${Date.now()}`;
    const isImage = file.type?.startsWith('image/') || /\.(jpe?g|png|webp|tiff|bmp)$/i.test(name);
    
    let buffer;
    let fileName;
    let contentType;

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    if (isImage) {
      try {
        const sharp = (await import('sharp')).default;
        buffer = await sharp(rawBuffer)
          .rotate() // Automatic EXIF rotation for smartphone photos
          .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();

        const baseName = name.substring(0, name.lastIndexOf('.')) || name;
        const cleanBase = baseName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9._-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');

        fileName = `${Date.now()}-${cleanBase}.webp`;
        contentType = 'image/webp';
      } catch (sharpErr) {
        console.warn('[uploadFile] Sharp optimization fallback:', sharpErr?.message);
        buffer = rawBuffer;
        fileName = `${Date.now()}-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]/g, '-')}`;
        contentType = file.type || 'application/octet-stream';
      }
    } else {
      buffer = rawBuffer;
      fileName = `${Date.now()}-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]/g, '-')}`;
      contentType = file.type || 'application/octet-stream';
    }

    const { data, error } = await supabaseAdmin.storage
      .from('urbateam-media')
      .upload(fileName, buffer, {
        contentType: contentType,
        cacheControl: '31536000',
        upsert: true
      });

    if (error) {
      console.error('[Supabase Storage Upload Error]:', error.message);
      throw new Error(`[Supabase Storage Error]: ${error.message}`);
    }

    return fileName;
  } catch (err) {
    console.error('[Supabase uploadFile Exception]:', err.message);
    throw err;
  }
}

