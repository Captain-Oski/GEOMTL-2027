import type { Metadata } from 'next';

// Adresse canonique d'une page et de ses versions linguistiques. Les chemins
// sont complétés par metadataBase (URL_SITE, app/[locale]/layout.tsx).
// À poser sur chaque page publique, jamais dans le layout [locale] : les pages
// enfants hériteraient de la même adresse canonique.
export function alternatesPage(locale: string, chemin = ''): Metadata['alternates'] {
  return {
    canonical: `/${locale}${chemin}`,
    languages: {
      fr: `/fr${chemin}`,
      en: `/en${chemin}`,
      'x-default': `/fr${chemin}`,
    },
  };
}

// Pages en attente de lancement (« Bientôt disponible ») : hors des résultats
// de recherche. Au lancement, retirer ce réglage et ajouter la page à app/sitemap.ts.
export const PAGE_MASQUEE: Metadata['robots'] = { index: false, follow: true };
