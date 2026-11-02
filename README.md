# GÉOMTL 2027

Site web officiel de la conférence GÉOMTL 2027, le rendez-vous de la communauté géospatiale francophone : [www.geomtl.com](https://www.geomtl.com).

![Page d'accueil de GÉOMTL 2027](images/readme.png)

**3–5 octobre 2027 · Centre de congrès de Saint-Hyacinthe**

---

## Stack technique

- **Framework** : Next.js 15 (App Router, Server Components), React 19
- **Langage** : TypeScript
- **Style** : Tailwind CSS, identité visuelle 2027 (crème, encre, dégradé cyan → citron) ; l'admin garde l'ancienne palette
- **Icônes** : Phosphor Icons, graisse Light
- **Animations** : Framer Motion (entrées) + globe animé en canvas dans le hero
- **i18n** : next-intl (FR / EN)
- **Base de données** : Supabase (PostgreSQL + Auth + Storage)
- **Déploiement** : Vercel (projet `geomtl-2027`), depuis la branche `main` du dépôt `GEOMTL-2027`
- **Billetterie** : Le Point de Vente (`EVENT_CONFIG.ticketUrl` dans `data/config.ts`)
- **Infolettre** : Mailchimp ([docs/infolettre.md](docs/infolettre.md))

---

## Démarrage local

```bash
npm install
cp .env.local.example .env.local   # remplir les clés Supabase
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Variables d'environnement requises

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # serveur uniquement, jamais exposé client

# Demandes de kiosque (voir docs/demandes-kiosques.md)
GMAIL_UTILISATEUR=                  # compte Google Workspace qui envoie (info@geomtl.com)
GMAIL_MOT_DE_PASSE=                 # mot de passe d'application de ce compte
DEMANDES_SEL=                       # sel secret de l'empreinte IP
COURRIEL_EXPEDITEUR=                # facultatif, alias Gmail (partenariat@geomtl.com par défaut)
COURRIEL_COMITE=                    # facultatif, partenariat@geomtl.com par défaut
```

Le détail de chaque variable est dans `.env.local.example`.

---

## Ouverture au public

Le site reste caché (page « Site en construction ») tant que `SITE_PUBLIC` n'est pas `true`.

1. Dans Vercel, mettre `SITE_PUBLIC=true`, puis **redéployer** : `robots.txt` et `sitemap.xml` sont produits à la compilation.
2. Une fois le site ouvert, inscrire `https://www.geomtl.com/sitemap.xml` dans Google Search Console. L'adresse publique du site est fixée dans `lib/site.ts`.

Fichiers liés :

- **Icônes** : `app/favicon.ico` (16, 32 et 48 px), `app/icon.svg` et `app/apple-icon.png`. C'est le G du logo (`components/ui/GeoMTLLogo.tsx`) en encre sur le dégradé 2027.
- **Image de partage** (LinkedIn, courriels, messageries) : `app/[locale]/opengraph-image.tsx`, une version par langue, générée par Next.
- **Référencement** : `lib/site.ts`, `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` et `components/seo/DonneesEvenement.tsx`. Voir [docs/referencement.md](docs/referencement.md).
- **Pages d'erreur** : `app/[locale]/not-found.tsx` (404 du site, alimentée par la route `app/[locale]/[...rest]`), `app/not-found.tsx` (404 hors des pages du site), `app/[locale]/error.tsx` (erreur 500) et `app/global-error.tsx` (dernier recours).

---

## Structure du projet

```
app/
  [locale]/           Pages publiques FR/EN (Next.js i18n routing)
  admin/              Interface de gestion (protégée, rôle admin/editor)
components/
  home/               Sections de la page d'accueil (Hero, GlobeTrame, WhyAttend, …)
  layout/             Header, Footer, Navigation
  ui/                 Composants réutilisables (GeoMTLLogo, SectionTitle, …)
data/                 Données mock et configuration de l'événement
lib/                  Utilitaires, client Supabase, actions serveur
messages/             Traductions FR/EN (next-intl)
public/images/brand/  Visuels de l'identité 2027 et données du globe animé
scripts/globe/        Scripts de régénération des données du globe
docs/                 Documentation
logo/                 Fichiers SVG du logo GeoMTL 2027
```

---

## Logo

Le logo officiel est `logo/GeoMtl2027_v3_creme-violet.svg` - dégradé crème→violet en 7 paliers.

Le composant React `GeoMTLLogo` dessine le mot-symbole GÉOMTL dans la couleur du texte (encre sur le site). Le hero l'affiche en grand par-dessus le globe animé.

---

## Documentation

- [Globe animé du hero](docs/globe-anime.md) : fonctionnement, réglages, régénération des données
- [Identité visuelle 2027 dans le code](docs/identite-visuelle-2027.md) : couleurs, mode sombre, icônes, visuels
- [Demandes de kiosque](docs/demandes-kiosques.md) : plan interactif, formulaire, traitement dans l'admin, sécurité, envoi des courriels par Gmail
- [Administration](docs/admin.md) : menu, page Partenaires et exposants, types de partenaire, contacts des fiches
- [Référencement](docs/referencement.md) : balises, pages indexées ou masquées, données de l'événement, image de partage
- [Infolettre](docs/infolettre.md) : formulaire, réglages Mailchimp, premier envoi

---

## Admin

Accessible à `/admin` après connexion par courriel et mot de passe sur `/login`. Détails dans [docs/admin.md](docs/admin.md).

Rôles : `admin` (accès complet) · `editor` (sans suppression) · `viewer` (lecture seule)

Sections : Tableau de bord · Partenaires et exposants (onglets Demandes, Organisations et Plan des kiosques) · Programmation · Utilisateurs.

Types de partenaire : Or, Argent, Bronze et Soirée réseautage (migration V008). Les exposants ont leur propre table, mais apparaissent dans la même liste que les partenaires.

Pour attribuer le rôle admin à la première connexion :
```sql
UPDATE geomtl2027.profiles SET role = 'admin' WHERE email = 'ton@email.com';
```

---

## Migrations SQL

Les migrations sont dans `supabase/migrations/` et numérotées `V000` → `V008`.  
Exécuter dans l'ordre via le SQL Editor de Supabase.
