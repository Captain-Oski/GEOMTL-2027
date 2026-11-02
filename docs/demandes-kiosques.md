# Demandes de kiosque

La page **Devenir partenaire** (`/fr/devenir-partenaire`) affiche le plan interactif des 26 kiosques du salon des exposants. Chaque kiosque est « Disponible » ou « Indisponible » (avec le logo de l'organisation). Un formulaire permet de demander un kiosque ; le comité traite les demandes dans l'admin, sous **Partenaires et exposants** (`/admin/organisations`).

**Règle d'or : une demande ne change jamais ce que voit le public.** Un kiosque passe à « Indisponible » seulement quand un membre du comité confirme sa réservation dans l'admin.

## Le parcours

### 1. Le visiteur fait sa demande

- Trois boutons ouvrent le même formulaire, dans une fenêtre : **« Devenir partenaire »** tout en haut de la page, et **« Devenir partenaire ou exposant »** en haut et en bas du plan. La page ne contient qu'un seul formulaire, que ces boutons se partagent.
- Un clic sur un kiosque libre du plan le présélectionne comme 1er choix dans le formulaire ; le bouton du haut de la page l'ouvre sans kiosque choisi.
- Sous le plan, la ligne « Des questions? Écrivez-nous à partenariat@geomtl.com » remplace l'ancien formulaire « Nous contacter », qui ouvrait le logiciel de courriel du visiteur.
- Le formulaire demande :
  - le niveau (Exposant, Bronze, Argent, Or, Commandite de la soirée réseautage ou À déterminer) ;
  - jusqu'à trois kiosques souhaités par ordre de préférence, parmi les kiosques disponibles, ou « Sans préférence ». Le 2e et le 3e choix sont facultatifs ;
  - l'organisation ;
  - le **responsable de la facturation** et le **responsable du kiosque sur place lors de l'événement** (nom, courriel, téléphone), avec une case « Même personne que le responsable de la facturation » ;
  - un message facultatif et le consentement (Loi 25).

### 2. Le site enregistre la demande et avertit tout le monde

- La demande est enregistrée avec le statut **nouvelle**.
- Un courriel part au comité (partenariat@geomtl.com). En y répondant, on écrit directement au responsable de la facturation.
- Un accusé de réception part au responsable de la facturation, avec le responsable du kiosque en copie s'il est différent.
- Si un courriel échoue, la demande reste enregistrée : rien ne se perd, l'échec est noté dans les journaux de Vercel.

### 3. Le comité traite la demande (onglet « Demandes »)

- La pastille du menu **Partenaires et exposants** compte les nouvelles demandes. Quand il y en a, la page s'ouvre sur l'onglet « Demandes ».
- Le détail d'une demande offre :
  - **En traitement**, **Refuser**, **Archiver** et **Indésirable** ;
  - **Accepter** : crée la fiche préremplie (organisation, premier kiosque demandé encore libre, message ; le responsable de la facturation en contact principal et le responsable du kiosque en contact secondaire) et la relie à la demande. Le niveau « Exposant » crée une fiche d'exposant ; Bronze, Argent, Or et la commandite de la soirée créent une fiche de partenaire du type correspondant. Les deux apparaissent dans l'onglet « Organisations ». **Le kiosque reste disponible.**
  - des notes internes, jamais publiées.

### 4. Le comité confirme la réservation (onglet « Plan des kiosques »)

- Un clic sur un kiosque ouvre sa fiche, avec les demandes en cours qui le visent, quel que soit le rang du choix.
- **Confirmer la réservation** : choisir la fiche liée (qui reprend le nom, le logo et le site), vérifier le nom affiché, puis confirmer. Le kiosque passe à « Indisponible » sur le site public, avec le logo.
- **Libérer le kiosque** : il redevient « Disponible ».
- Si deux membres du comité confirment le même kiosque en même temps, seul le premier réussit ; le second reçoit un message d'erreur.

Le rôle `viewer` voit tout, mais n'a aucun bouton d'action.

## Sécurité

Le public n'écrit jamais directement dans la base. Le formulaire envoie la demande à la route `POST /api/demandes-kiosques`, qui la vérifie puis l'enregistre avec la clé service role, côté serveur seulement. Les tables n'ont aucune règle d'accès pour le rôle `anon` : même avec la clé publique, personne ne peut les lire ni y écrire.

Contrôles de la route, dans l'ordre :

| Contrôle | Réponse en cas d'échec |
|---|---|
| Supabase configuré | 503 |
| Site encore « en construction » : seul le comité (cookie d'accès) peut envoyer | 403 |
| En-tête `Origin` du même site (protection CSRF) | 403 |
| Corps JSON de 10 Ko au plus | 413 |
| Champ piège invisible rempli (robot) | 200, sans rien enregistrer |
| Envoi moins de 3 secondes après l'ouverture du formulaire | 400 |
| Validation des champs (la même que dans le formulaire) | 400 |
| Au plus 5 demandes par heure par adresse IP et 5 par jour par courriel | 429 |
| Tous les kiosques choisis déjà réservés (un choix réservé parmi d'autres est retiré de la demande, et le visiteur en est informé) | 409 |

Les courriels sont en texte brut : rien de ce que tape le visiteur n'est interprété comme du HTML.

## Données et confidentialité

- **Tables** (schéma `geomtl2027`, migration [V007](../supabase/migrations/V007__kiosques.sql)) :
  - `kiosques` : les 26 kiosques, leur état public et la fiche liée ;
  - `demandes_kiosques` : les demandes et leur suivi.
- **Adresse IP :** jamais conservée. Seule une empreinte salée (`sha256(DEMANDES_SEL:ip)`) est gardée, pour la limite d'envois.
- **Conservation :** jusqu'à 6 mois après l'événement, comme l'indique la [politique de confidentialité](../app/[locale]/confidentialite/page.tsx). La purge se fait à la main pour l'instant.
- **Plan public :** mis en cache 5 minutes, et rafraîchi aussitôt qu'un membre du comité change l'état d'un kiosque.

## Configuration

Variables d'environnement, dans `.env.local` en local et dans **Vercel → Settings → Environment Variables** en production :

| Variable | Rôle | Obligatoire |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Enregistrer les demandes et lire le plan, côté serveur | Oui |
| `GMAIL_UTILISATEUR` | Compte Google Workspace qui envoie les courriels : `info@geomtl.com` | Oui |
| `GMAIL_MOT_DE_PASSE` | Mot de passe d'application de ce compte. Sans lui, les demandes sont enregistrées mais aucun courriel ne part. | Oui |
| `DEMANDES_SEL` | Sel secret de l'empreinte IP : une longue chaîne aléatoire, à ne plus changer ensuite | Oui |
| `COURRIEL_EXPEDITEUR` | Expéditeur affiché, un alias du compte. Par défaut : `GÉOMTL 2027 <partenariat@geomtl.com>` | Non |
| `COURRIEL_COMITE` | Destinataire des avis de nouvelle demande. Par défaut : partenariat@geomtl.com | Non |

Pour générer `DEMANDES_SEL` :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Envoi par Gmail (Google Workspace)

Les courriels partent du compte Google Workspace **info@geomtl.com**, en tant que **partenariat@geomtl.com** (un alias de info@). Le domaine est déjà authentifié pour Google (SPF, DKIM et DMARC) : aucun DNS à modifier.

1. Sur le compte info@, activer la **validation en deux étapes** (myaccount.google.com → Sécurité).
2. Créer un **mot de passe d'application** (myaccount.google.com/apppasswords), nommé par exemple « Site GÉOMTL ». Le copier dans `GMAIL_MOT_DE_PASSE`, sans les espaces.
3. Dans le Gmail de info@ : **Paramètres → Comptes → Envoyer des e-mails en tant que → Ajouter une autre adresse**, entrer partenariat@geomtl.com et cocher « Traiter comme un alias ». Sans cette étape, Gmail affiche info@ comme expéditeur.

À savoir :

- **Sécurité :** le mot de passe d'application ouvre toute la boîte info@ (lecture et envoi, pour tous les alias). Il reste seulement dans `.env.local` et dans Vercel. En cas de doute, le révoquer sur myaccount.google.com/apppasswords et en créer un autre.
- **Limite :** environ 2 000 envois par jour pour un compte Workspace, bien au-delà des besoins (2 courriels par demande).
- **Avis au comité :** il est envoyé à partenariat@, donc à la boîte même qui l'envoie. Gmail range parfois ces courriels « à soi-même » seulement dans Envoyés. Si c'est le cas, diriger l'avis vers une autre boîte avec `COURRIEL_COMITE` ; la pastille de l'admin signale de toute façon les nouvelles demandes.
- Les courriels envoyés par le site apparaissent dans les Envoyés de info@.

## Tester en local

Attention : en local, le site utilise la **base de production**, et les courriels partent vraiment. Les demandes de test sont visibles par tout le comité ; les marquer « Indésirable » après le test.

1. Dans `.env.local`, remplir `GMAIL_UTILISATEUR` et `GMAIL_MOT_DE_PASSE`, et mettre sa propre adresse dans `COURRIEL_COMITE` pour ne pas écrire au comité.
2. `npm run dev`, puis se connecter à `/login` avec son compte de l'admin.
3. Sur `/fr/devenir-partenaire`, envoyer une demande avec sa propre adresse pour le responsable de la facturation.
4. L'avis du comité et l'accusé de réception arrivent dans sa boîte, et la demande apparaît dans l'onglet « Demandes » de **Partenaires et exposants**.

## Fichiers

| Fichier | Rôle |
|---|---|
| `components/partners/DevenirPartenaire.tsx` | Page publique : bouton du haut, plan, formulaire de demande unique, ligne de contact |
| `components/partners/PlanKiosques.tsx` | Plan SVG interactif, en mode public ou admin ; ses boutons demandent à la page d'ouvrir le formulaire |
| `components/partners/ModaleReservation.tsx` | Formulaire de demande, dans une fenêtre |
| `lib/demandes-kiosques.ts` | Validation partagée entre le formulaire et la route |
| `app/api/demandes-kiosques/route.ts` | Route publique : contrôles, enregistrement, courriels |
| `lib/data/kiosques.ts` | Lecture du plan public (en cache) et des données de l'admin |
| `lib/actions/kiosques.ts` | Actions de l'admin : statut, Accepter, Confirmer, Libérer |
| `app/admin/organisations/page.tsx` et `components/admin/organisations/` | Page « Partenaires et exposants » : onglets Demandes, Organisations et Plan des kiosques |
| `components/admin/kiosques/DemandesKiosques.tsx` | Onglet « Demandes » |
| `data/kiosques.ts` | Plan de repli sans Supabase, et aperçu `?apercu-kiosques` en développement |

## À venir

- Téléverser les logos dans Supabase Storage, au lieu de coller une adresse.
- Exporter les demandes en CSV.
- Purger automatiquement les demandes 6 mois après l'événement.
- Ajouter un captcha (Cloudflare Turnstile), seulement si des robots passent malgré le champ piège et la limite d'envois.
