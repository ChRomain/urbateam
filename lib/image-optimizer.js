import sharp from 'sharp';

export async function optimizeImageIfNeeded(file) {
  if (!file || typeof file === 'string' || !file.size) return file;
  
  const name = file.name || `file-${Date.now()}`;
  const isImage = file.type?.startsWith('image/') || /\.(jpe?g|png|webp|tiff|bmp)$/i.test(name);

  if (!isImage) return file;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    const optimizedBuffer = await sharp(rawBuffer)
      .rotate() // Auto-orient EXIF camera metadata
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

    const fileName = `${Date.now()}-${cleanBase}.webp`;

    return {
      name: fileName,
      type: 'image/webp',
      buffer: optimizedBuffer,
      arrayBuffer: async () => optimizedBuffer
    };
  } catch (err) {
    console.warn('[Image Optimizer] Fallback to raw file:', err?.message);
    return file;
  }
}
