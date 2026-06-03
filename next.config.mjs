/** @type {import('next').NextConfig} */
const nextConfig = {

  // Optimisation des images — Next.js convertit automatiquement en WebP/AVIF
  images: {
    // Formats modernes par ordre de préférence (AVIF ~50% plus léger que WebP)
    formats: ['image/avif', 'image/webp'],

    // Tailles de device pour le srcset adaptatif
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],

    // Domaines autorisés pour les images distantes
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.urbateam.fr',
        pathname: '/assets/**',
      },
      {
        // Supabase Storage (cloud) — objet brut
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Supabase Storage — endpoint de transformation d'image à la volée
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/render/image/**',
      },
    ],

    // Désactiver le SVG dangereux (sécurité)
    dangerouslyAllowSVG: false,
  },

  // Désactiver les headers X-Powered-By (sécurité + perf)
  poweredByHeader: false,

  // Compression gzip activée côté Next.js
  compress: true,
};

export default nextConfig;
