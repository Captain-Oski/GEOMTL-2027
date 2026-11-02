# Administration

L'admin est à `/admin`, après connexion sur `/login`. Trois rôles : `admin` (accès complet), `editor` (sans suppression ni gestion des utilisateurs) et `viewer` (lecture seule, aucun bouton d'action). Un compte sans rôle n'a aucun accès.

## Droits

Une action serveur peut être appelée directement, sans passer par l'interface. Masquer un bouton ne protège donc rien : **chaque action doit commencer par `exigerEditeur()` ou `exigerAdmin()`** (`lib/auth/droits.ts`). Les règles RLS de la base restent une seconde protection. La clé service role ne sert qu'aux opérations qui l'exigent, toujours après ces vérifications, ou à la route publique des demandes.

## Connexion et mots de passe

- **Mot de passe oublié** (`/login`) : Supabase envoie un lien vers `/auth/confirm`, qui affiche le formulaire. La réponse est la même que le compte existe ou non.
- **Invitation** (section Utilisateurs) : le lien mène aussi à `/auth/confirm`, où la personne choisit son mot de passe. Un admin lui attribue ensuite un rôle.
- Ces courriels partent de Supabase : voir la configuration dans le [journal des migrations](../supabase/CHANGELOG.md).

## Menu

| Entrée | Contenu |
|---|---|
| Tableau de bord | Nouvelles demandes, kiosques disponibles, statistiques des partenaires et des exposants |
| Partenaires et exposants | Onglets Demandes, Organisations et Plan des kiosques ; pastille du nombre de nouvelles demandes |
| Programmation | Sessions du programme |
| Utilisateurs | Comptes et rôles (admin seulement) |

Contacts, Activations, Livrables et Contrats ne sont plus dans le menu : leurs pages n'existaient pas (erreur 404). Leurs tables restent en base, vides, pour un module futur (voir [TODO.md](../TODO.md)).

## Partenaires et exposants (`/admin/organisations`)

Une seule page regroupe ce qui était réparti entre Partenaires, Exposants et Kiosques.

- **Demandes** : les demandes envoyées par le formulaire public (jusqu'à trois kiosques par ordre de préférence), leur traitement et l'action « Accepter », qui crée la fiche avec le premier choix encore libre. Détails dans [Demandes de kiosque](demandes-kiosques.md).
- **Organisations** : partenaires et exposants dans un même tableau.
  - En haut : fiches, confirmées, payées, à relancer, logos manquants, kiosques à attribuer, prêtes mais non publiées.
  - Recherche (nom, contact, courriel) et filtres : niveau (un type de partenaire, tous les partenaires ou les exposants), statut, paiement, publication, responsable.
  - Tri par niveau, nom, statut ou date de relance.
  - Actions rapides sur chaque ligne : logo reçu, publication sur le site, « Marquer payé », « Archiver » et « Supprimer » (visible pour les admins seulement).
  - Sous le tableau, **Fiches archivées** : les restaurer, ou les supprimer (admin).
  - Boutons « + Partenaire » et « + Exposant » pour créer une fiche.
- **Plan des kiosques** : confirmer, modifier ou libérer la réservation d'un kiosque. Le plan fait foi : ces actions mettent à jour le numéro et le statut de kiosque de la fiche liée. L'inverse n'existe pas : changer le numéro sur une fiche ne modifie pas le plan.

L'onglet choisi reste dans l'adresse (`?onglet=demandes`, `organisations` ou `plan`). Sans onglet précisé, la page s'ouvre sur Demandes s'il y a de nouvelles demandes, sinon sur Organisations.

Les anciennes adresses `/admin/partners`, `/admin/exhibitors` et `/admin/kiosques` redirigent vers cette page, ce qui garde valides les favoris et les liens des courriels déjà envoyés.

## Programmation (`/admin/programme`)

Créer, modifier et déplacer une session demande le rôle `admin` ou `editor` ; la supprimer, le rôle `admin`. Le lecteur consulte seulement.

## Fiches partenaire et exposant

Partenaires et exposants restent deux tables (`partners` et `exhibitors`), chacune avec son formulaire (`/admin/partners/...` et `/admin/exhibitors/...`). Seule la liste les réunit.

- **Types de partenaire** : Or, Argent, Bronze et Soirée réseautage (migration [V008](../supabase/migrations/V008__types_partenaires.sql)). En base : `Gold`, `Silver`, `Bronze` et `Networking`. Les libellés sont dans `lib/partenaires.ts`.
- **Contacts** :
  - le contact principal est le **responsable de la facturation** (nom, courriel, téléphone) ;
  - le contact secondaire est le **responsable du kiosque** sur place pendant l'événement (nom, courriel). La fiche n'a pas de champ pour son téléphone : quand on accepte une demande, il est noté dans les notes de contact.
- **Kiosque et livrables** : cette section remplace « Activation et kiosque ». Les champs d'activation ont été retirés du formulaire ; leurs colonnes restent en base, vides.

## Fichiers

| Fichier | Rôle |
|---|---|
| `lib/auth/droits.ts` | Rôle de la personne connectée et vérifications des actions |
| `components/admin/AdminLayout.tsx` | Menu et pastille des nouvelles demandes |
| `app/admin/page.tsx` | Tableau de bord |
| `app/admin/organisations/page.tsx` | Chargement des données de la page Partenaires et exposants |
| `components/admin/organisations/AdminOrganisationsPage.tsx` | Onglets, messages et fiche du kiosque sélectionné |
| `components/admin/organisations/ListeOrganisations.tsx` | Liste unique des partenaires et des exposants |
| `components/admin/kiosques/DemandesKiosques.tsx` | Onglet Demandes |
| `components/admin/partners/PartnerForm.tsx` et `components/admin/exhibitors/ExhibitorForm.tsx` | Formulaires des fiches |
| `components/admin/partners/PartnerStatusBadge.tsx` | Pastilles de statut, de paiement et de niveau, communes aux deux types de fiches |
