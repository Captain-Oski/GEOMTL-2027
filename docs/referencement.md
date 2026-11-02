# Référencement

Ce que Google et les réseaux sociaux lisent sur le site, et ce qu'il faut faire quand une page change de statut. L'adresse officielle est `https://www.geomtl.com` ; `geomtl.com` y redirige (308).

## Dans le code

| Élément | Fichier | Rôle |
|---|---|---|
| Adresse du site | `lib/site.ts` (`URL_SITE`) | Base des balises canoniques, du plan du site, de `robots.txt`, des images de partage et des invitations à l'admin |
| Canonique et versions FR/EN | `lib/seo.ts` (`alternatesPage`) | Une adresse canonique par page, avec les liens `fr`, `en` et `x-default` |
| Pages hors de Google | `lib/seo.ts` (`PAGE_MASQUEE`) | `noindex` des pages en attente de lancement |
| Plan du site | `app/sitemap.ts` (`PAGES`) | Pages publiques, dans les deux langues |
| Robots | `app/robots.ts` | Ouvre le site et bloque `/admin`, `/login`, `/auth` et `/api` |
| Données de l'événement | `components/seo/DonneesEvenement.tsx` | Données schema.org `Event` de l'accueil : dates, lieu, billets |
| Image de partage | `app/[locale]/opengraph-image.tsx` | Aperçu LinkedIn, courriels et messageries, une par langue |

## Statut des pages

- **Dans Google et le plan du site :** accueil, Billetterie, Devenir partenaire, Infos pratiques, Infolettre, À propos, Prix GAÏA, Galerie, Confidentialité, Conditions.
- **Hors de Google :** Programme, Conférenciers, Ateliers, Exposants, Partenaires, Actualités et ses articles, `/demo`.

## Lancer une page masquée

1. Dans sa page ou son layout, remplacer `robots: PAGE_MASQUEE` par `alternates: alternatesPage(locale, '/chemin')`.
2. Ajouter son chemin à `PAGES` dans `app/sitemap.ts`.

## Ajouter une page publique

Dans son `generateMetadata`, poser `alternates: alternatesPage(locale, '/chemin')`, puis ajouter le chemin à `PAGES`. Ne jamais poser `alternates` dans le layout `app/[locale]/layout.tsx` : toutes les pages hériteraient de la même adresse canonique.

## Dates et tarifs

- `EVENT_CONFIG.datesEvenement` (`data/config.ts`) donne à Google les dates des forfaits en vente, les 4 et 5 octobre 2027. `EVENT_CONFIG.dates`, affiché sur l'accueil et l'image de partage, couvre du 3 au 5 octobre : cet écart est voulu.
- `EVENT_CONFIG.tarifs` alimente à la fois la billetterie et les données de l'événement. Changer un prix à cet endroit met à jour les deux.

## Image de partage

La route lit `public/images/brand/degrade-trame.jpg` à l'exécution. Le dossier `public/` n'est pas livré aux fonctions Vercel : `outputFileTracingIncludes` (`next.config.mjs`) l'inclut. La clé utilise le motif `/*/opengraph-image*`, car `[locale]` y serait lu comme un groupe de caractères. Pour vérifier après une compilation, le fichier doit figurer dans `.next/server/app/[locale]/opengraph-image/route.js.nft.json`.

## Après une mise en ligne

- [Search Console](https://search.google.com/search-console) : propriété `https://www.geomtl.com/`, validée par la balise `verification` de `app/[locale]/layout.tsx` (à ne pas retirer). Plan du site : `https://www.geomtl.com/sitemap.xml`.
- [Test des résultats enrichis](https://search.google.com/test/rich-results) sur `https://www.geomtl.com/fr`, pour les données de l'événement.
- [Bing Webmaster Tools](https://www.bing.com/webmasters) : importer depuis Search Console.
