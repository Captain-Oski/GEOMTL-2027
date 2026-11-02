# GÉOMTL 2027 - TODO

Le site est en ligne sur [www.geomtl.com](https://www.geomtl.com) depuis octobre 2026. Tâches restantes, par priorité.

---

## 🔴 Critique - Bloquant pour le lancement

### Infrastructure Supabase
- [x] Créer le projet Supabase (geomtl-2027)
- [x] Exécuter les migrations SQL dans l'ordre (`V001` → `V005`) via le SQL Editor
- [x] Configurer Auth
- [x] Se connecter une première fois et attribuer le rôle admin :
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'ton@email.com';
  ```
- [x] Configurer les variables d'environnement sur Vercel :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Déploiement
- [x] Connecter le repo GitHub à Vercel
- [x] Fixer l'adresse publique du site (`lib/site.ts`)
- [x] Configurer le domaine personnalisé (`www.geomtl.com`, `geomtl.com` y redirige)
- [x] Vérifier que le build passe sans erreur (`npm run build`)
- [x] Tester l'auth en production (redirect URI Supabase à jour)

---

## 🟠 Important - Avant les premières utilisations réelles

### Données réelles
- [ ] Remplacer les données mock par les vrais partenaires et exposants
- [ ] Collecter et téléverser les vrais logos (voir section Stockage)
- [ ] Vérifier toutes les URLs de sites web

### Infolettre
- [x] Page d'inscription reliée à Mailchimp (voir docs/infolettre.md)
- [ ] Authentifier le domaine `geomtl.com` dans Mailchimp avant le premier envoi

### Stockage des logos (Supabase Storage)
- [ ] Créer un bucket `logos` dans Supabase Storage (accès public en lecture)
- [ ] Configurer les politiques RLS du bucket (upload réservé aux editor/admin)
- [ ] Ajouter un champ d'upload de fichier dans `PartnerForm` et `ExhibitorForm`

### Contenu public du site
- [ ] Rédiger les vraies descriptions (FR + EN) pour chaque partenaire confirmé
- [ ] Compléter les traductions anglaises dans `messages/en.json`
- [ ] Vérifier et compléter `messages/fr.json`

### SEO & Métadonnées
- [x] Titres, balises canoniques et liens FR/EN sur chaque page publique ; pages en attente exclues de Google (voir docs/referencement.md)
- [x] Données structurées de l'événement et image de partage (`app/[locale]/opengraph-image.tsx`)
- [ ] Rédiger une description propre à chaque page publique (l'accueil et l'infolettre en ont une, les autres reprennent celle du site)
- [ ] Inscrire le site dans Google Search Console et Bing Webmaster Tools, puis soumettre le plan du site
- [ ] Demander à l'ACSG, sur LinkedIn et aux partenaires de pointer vers `https://www.geomtl.com`
- [x] Favicon et icônes d'application (`app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png`)
- [x] `robots.txt` et `sitemap.xml` (`app/robots.ts`, `app/sitemap.ts`)

---

## 🟡 À faire - Avant l'événement

### Fonctionnalités manquantes
- [x] **Page d'erreur 404** dans le style 2027 : `app/[locale]/not-found.tsx` (avec en-tête et pied de page, alimentée par `app/[locale]/[...rest]/page.tsx`) et `app/not-found.tsx` (hors des pages du site)
- [x] **Page d'erreur 500** (`app/[locale]/error.tsx`, et `app/global-error.tsx` en dernier recours)
- [ ] **Section exposants publique** (`PublicExhibitorsSection`) sur le site public
- [x] **Section carte du salon** - plan interactif des kiosques et demandes de réservation (voir docs/demandes-kiosques.md)
- [ ] **Page agenda/programme** - liste des sessions et présentations
- [ ] **Recherche** dans la liste publique des exposants/partenaires

### Admin - Modules manquants
Les liens de ces modules ont été retirés du menu tant que les pages n'existent pas (les tables sont en place, vides).
- [ ] `/admin/contacts` - gestion des contacts liés aux partenaires/exposants
- [ ] `/admin/contracts` - suivi des contrats (admin seulement)
- [ ] `/admin/deliverables` - suivi des livrables
- [ ] `/admin/kpis` - tableau de bord KPI avec graphiques

### Admin - Améliorations
- [ ] **Export CSV** de la liste des partenaires / exposants
- [ ] **Pagination** dans les tableaux admin (si > 50 entrées)
- [ ] **Historique des modifications** par partenaire (audit log)
- [x] **Gestion des utilisateurs admin** - section Utilisateurs (rôles, invitations, révocation)
- [x] **Mot de passe oublié**, restauration des fiches archivées et effacement des demandes en fin de conservation

### Sécurité
- [x] Vérification du rôle dans chaque action serveur (`lib/auth/droits.ts`)
- [ ] Configurer un service d'envoi dans Supabase (SMTP) pour les invitations et les mots de passe oubliés
- [ ] Après le 5 avril 2028 : effacer les demandes (bouton dans l'onglet Demandes)
- [ ] Revoir les politiques RLS (tester avec différents rôles)
- [ ] Ajouter un rate limiting sur les routes `/auth/*`
- [ ] Configurer les headers de sécurité dans `next.config.js`

---

## 🟢 Souhaitable - Avant / pendant l'événement

### Qualité
- [ ] Tests de base (au moins les Server Actions critiques)
- [ ] Vérification accessibilité (contraste, navigation clavier, ARIA)
- [ ] Test sur mobile (responsive de l'admin et du site public)
- [ ] Optimisation des images (utiliser `next/image` partout)

### Monitoring
- [ ] Configurer Vercel Analytics (ou Plausible pour RGPD-friendly)
- [ ] Activer les logs d'erreur Supabase
- [ ] Mettre en place une alerte email si le site tombe

---

## ✅ Complété

- [x] Authentification par courriel et mot de passe, avec rôles (admin/editor/viewer)
- [x] Module partenaires complet (CRUD + dashboard + filtres + formulaire)
- [x] Module exposants complet (CRUD + dashboard + filtres + formulaire)
- [x] Migrations SQL numérotées (V001–V005) avec CHANGELOG
- [x] Section partenaires publique (`PublicPartnersSection`)
- [x] Mode mock (développement sans Supabase)
- [x] Internationalisation FR/EN (next-intl)
- [x] Protection des routes `/admin` par middleware
- [x] Logo GeoMTL 2027 - dégradé crème→violet (`GeoMtl2027_v3_creme-violet.svg`) dans header, footer et hero
- [x] Hero animé - isolignes ondulantes 60fps via GSAP (`IsolineRipple` component)
- [x] Hero pleine largeur - animation bord à bord, fond transparent sur `bg-deep-blue`
- [x] Bouton CTA renommé « Participer » (FR) / « Participate » (EN) - moins commercial
- [x] Page actualités avec articles, catégories et sidebar articles connexes
- [x] Bannière cookie conforme Loi 25 (Québec)
