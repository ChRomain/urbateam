import sharp from 'sharp';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

/**
 * Optimise une image : conversion WebP, redimensionnement et compression.
 * @param {Buffer} buffer - Le buffer de l'image originale
 * @param {string} destinationDir - Répertoire de destination (relatif à public/)
 * @param {string} filename - Nom de base du fichier (sans extension)
 * @param {Object} options - Options de redimensionnement { width, height, quality }
 * @returns {Promise<string>} - URL de l'image optimisée
 */
export async function optimizeImage(buffer, destinationDir, filename, options = {}) {
  const { width = 1920, quality = 80 } = options;
  
  // Nettoyage du nom de fichier et ajout de l'extension .webp
  const cleanFilename = filename.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-').toLowerCase();
  const webpFilename = `${cleanFilename}-${Date.now()}.webp`;
  
  const publicDir = path.join(process.cwd(), 'public');
  const targetDir = path.join(publicDir, destinationDir);
  const targetPath = path.join(targetDir, webpFilename);

  // S'assurer que le répertoire existe
  try {
    await mkdir(targetDir, { recursive: true });
  } catch (err) {
    // Le répertoire existe probablement déjà
  }

  // Traitement Sharp
  await sharp(buffer)
    .resize({
      width,
      withoutEnlargement: true,
      fit: 'inside'
    })
    .webp({ quality })
    .toFile(targetPath);

  return `/${destinationDir}/${webpFilename}`;
}
