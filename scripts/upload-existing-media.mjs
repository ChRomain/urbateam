// scripts/upload-existing-media.mjs
// Téléverse tous les médias locaux (public/uploads) vers le stockage Supabase Cloud
// et met à jour les références en base de données pour utiliser les chemins cloud natifs.
//
// Usage : node --env-file=.env.local scripts/upload-existing-media.mjs

import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erreur : Les variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const BUCKET_NAME = 'urbateam-media';

// Helper simple pour le type MIME
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

// Fonction pour téléverser un fichier local
async function uploadLocalFile(localFilePath, storageFileName) {
  try {
    const fileBuffer = await readFile(localFilePath);
    const mimeType = getMimeType(storageFileName);

    console.log(`⏳ Téléversement de "${storageFileName}" (${mimeType})...`);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storageFileName, fileBuffer, {
        contentType: mimeType,
        upsert: true // Écrase si existe déjà
      });

    if (error) {
      console.error(`❌ Erreur téléversement "${storageFileName}" :`, error.message);
      return false;
    }
    
    console.log(`✅ Fichier "${storageFileName}" téléversé avec succès !`);
    return true;
  } catch (err) {
    console.error(`❌ Erreur lecture ou envoi de "${storageFileName}" :`, err.message);
    return false;
  }
}

// Fonction pour scanner et téléverser tout le contenu d'un dossier
async function uploadFolderContent(subFolder) {
  const folderPath = path.join(ROOT, 'public', 'uploads', subFolder);
  try {
    const files = await readdir(folderPath);
    console.log(`\n📂 Traitement du dossier uploads/${subFolder} (${files.length} fichiers)...`);
    
    for (const file of files) {
      if (file === '.DS_Store') continue;
      const filePath = path.join(folderPath, file);
      // On conserve le même nom de fichier dans Supabase
      await uploadLocalFile(filePath, file);
    }
  } catch (err) {
    console.warn(`⚠️ Dossier non accessible ou inexistant : uploads/${subFolder} (${err.message})`);
  }
}

async function run() {
  console.log(`🚀 Démarrage de l'envoi des médias vers Supabase Storage (${SUPABASE_URL})\n`);

  // 1. Téléverser tous les médias locaux vers le bucket Supabase
  await uploadFolderContent('blog');
  await uploadFolderContent('projets');
  await uploadFolderContent('clients');
  await uploadFolderContent('social');

  // 2. Mettre à jour les articles de blog en base de données
  console.log('\n📝 Mise à jour des références "featured_image" dans la table "articles"...');
  const { data: articles, error: artErr } = await supabase
    .from('articles')
    .select('id, title, featured_image');

  if (artErr) {
    console.error('❌ Impossible de charger les articles :', artErr.message);
  } else {
    for (const art of (articles || [])) {
      if (art.featured_image && art.featured_image.startsWith('/uploads/blog/')) {
        const cleanName = art.featured_image.replace('/uploads/blog/', '');
        console.log(`  🔄 Article "${art.title}" : ${art.featured_image} ➡️ ${cleanName}`);
        await supabase
          .from('articles')
          .update({ featured_image: cleanName })
          .eq('id', art.id);
      }
    }
    console.log('✅ Mise à jour des articles terminée.');
  }

  // 3. Mettre à jour les projets
  console.log('\n🏗️  Mise à jour des images dans la table "projets"...');
  const { data: projets, error: projErr } = await supabase
    .from('projets')
    .select('id, title, image_before, image_after, images_gallery');

  if (projErr) {
    console.error('❌ Impossible de charger les projets :', projErr.message);
  } else {
    for (const p of (projets || [])) {
      const updates = {};
      
      if (p.image_before && p.image_before.startsWith('/uploads/projets/')) {
        updates.image_before = p.image_before.replace('/uploads/projets/', '');
      }
      if (p.image_after && p.image_after.startsWith('/uploads/projets/')) {
        updates.image_after = p.image_after.replace('/uploads/projets/', '');
      }
      if (Array.isArray(p.images_gallery)) {
        updates.images_gallery = p.images_gallery.map(img => 
          img.startsWith('/uploads/projets/') ? img.replace('/uploads/projets/', '') : img
        );
      }

      if (Object.keys(updates).length > 0) {
        console.log(`  🔄 Projet "${p.title}" : mise à jour des images.`);
        await supabase
          .from('projets')
          .update(updates)
          .eq('id', p.id);
      }
    }
    console.log('✅ Mise à jour des projets terminée.');
  }

  // 4. Mettre à jour les logos clients
  console.log('\n🤝 Mise à jour des logos dans la table "clients"...');
  const { data: clients, error: clientErr } = await supabase
    .from('clients')
    .select('id, name, logo');

  if (clientErr) {
    console.error('❌ Impossible de charger les clients :', clientErr.message);
  } else {
    for (const c of (clients || [])) {
      if (c.logo && c.logo.startsWith('/uploads/clients/')) {
        const cleanName = c.logo.replace('/uploads/clients/', '');
        console.log(`  🔄 Client "${c.name}" : ${c.logo} ➡️ ${cleanName}`);
        await supabase
          .from('clients')
          .update({ logo: cleanName })
          .eq('id', c.id);
      }
    }
    console.log('✅ Mise à jour des clients terminée.');
  }

  console.log('\n🎉 Tout est terminé ! Vos médias en ligne sont synchronisés et vos tables Supabase pointent désormais sur le Cloud Storage.');
}

run().catch(err => {
  console.error('❌ Erreur fatale lors de la synchronisation :', err);
});
