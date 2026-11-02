import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lu à l'exécution par l'image de partage : le dossier public/ n'est pas livré
  // aux fonctions Vercel, sans cette ligne la route répond 500 (ENOENT).
  outputFileTracingIncludes: {
    '/*/opengraph-image*': ['./public/images/brand/degrade-trame.jpg'],
  },
};

export default withNextIntl(nextConfig);
