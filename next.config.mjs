/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode serveur (SSR/ISR) — requis pour la connexion à la DB Directus
  output: 'standalone',

  // Optimisation des images — Next.js convertit automatiquement en WebP/AVIF
  images: {
    // Formats modernes par ordre de préférence (AVIF ~50% plus léger que WebP)
    formats: ['image/avif', 'image/webp'],

    // Tailles de device pour le srcset adaptatif
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],

    // Domaines autorisés pour les images distantes (Directus)
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
