/**
 * lib/supabase.js
 * Client Supabase pour l'API Urbateam
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Crée le client Supabase standard (pour l'usage client ou serveur public)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper pour formater les URLs d'images Supabase Storage
export function getAssetUrl(assetId, transforms = {}) {
  if (!assetId) return '';

  // Si c'est déjà une URL absolue ou un chemin local
  if (assetId.startsWith('/') || assetId.startsWith('http')) return assetId;

  // Sinon, c'est un fichier stocké dans le bucket public Supabase 'urbateam-media'
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

  // Adapter les URLs des images pour le site et le dashboard admin
  return (data || []).map(art => ({
    ...art,
    featured_image: getAssetUrl(art.featured_image),
    featuredImage: getAssetUrl(art.featured_image)
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
    featured_image: getAssetUrl(art.featured_image),
    featuredImage: getAssetUrl(art.featured_image)
  };
}

// ─── Projets / Réalisations ─────────────────────────────────────────────────

export async function getProjets(status = 'published') {
  let query = supabase
    .from('projets')
    .select('id,status,slug,title,description,location,category,missions,image_after,image_before,images_gallery,date,technical_details,client,latitude,longitude')
    .order('date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Supabase] getProjets error:', error.message);
    return [];
  }

  return (data || []).map(p => ({
    ...p,
    image_before: getAssetUrl(p.image_before),
    image_after: getAssetUrl(p.image_after),
    images_gallery: (p.images_gallery || []).map(img => getAssetUrl(img))
  }));
}

export async function getProjetBySlug(slug, status = 'published') {
  let query = supabase
    .from('projets')
    .select('*')
    .eq('slug', slug)
    .limit(1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    if (error) console.error('[Supabase] getProjetBySlug error:', error.message);
    return null;
  }

  const p = data[0];
  return {
    ...p,
    image_before: getAssetUrl(p.image_before),
    image_after: getAssetUrl(p.image_after),
    images_gallery: (p.images_gallery || []).map(img => getAssetUrl(img))
  };
}

// ─── Clients / Références ───────────────────────────────────────────────────

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id,name,logo,tags')
    .eq('status', 'published')
    .order('sort', { ascending: true });

  if (error) {
    console.error('[Supabase] getClients error:', error.message);
    return [];
  }

  return (data || []).map(c => ({
    ...c,
    logo: getAssetUrl(c.logo)
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
    logo: getAssetUrl(p.logo)
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
      teamPhoto: getAssetUrl(header.team_photo),
    },
    members: membersData.map((m) => ({
      id: m.id,
      image: getAssetUrl(m.image),
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
  const { data: result, error } = await supabase
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
  const { data: result, error } = await supabase
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
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[Supabase] deleteItem on ${collection} error:`, error.message);
    return false;
  }
  return true;
}

// ─── Upload de fichiers (Supabase Storage) ───────────────────────────────────

export async function uploadFile(file) {
  try {
    const name = file.name || `file-${Date.now()}`;
    const cleanName = `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    const { data, error } = await supabase.storage
      .from('urbateam-media')
      .upload(cleanName, buffer, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('[Supabase Storage Upload Error]:', error.message);
      return null;
    }
    
    // Retourne le nom du fichier (qui sert de clé publique)
    return cleanName;
  } catch (err) {
    console.error('[Supabase uploadFile Exception]:', err.message);
    return null;
  }
}
