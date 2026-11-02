# Infolettre

La page `/fr/infolettre` (et `/en/infolettre`) présente un formulaire aux couleurs du site. Il envoie directement les inscriptions à l'audience Mailchimp de GÉOMTL : le site ne conserve aucune adresse.

## Fonctionnement

- `EVENT_CONFIG.mailchimpAction` (`data/config.ts`) contient l'adresse du formulaire intégré Mailchimp. Elle n'a rien de confidentiel : tout formulaire public l'affiche dans son code.
- `lib/infolettre.ts` valide cette adresse et en déduit le champ anti-robot de Mailchimp.
- `components/infolettre/FormulaireInfolettre.tsx` envoie le courriel, le prénom et le nom. Mailchimp ouvre la suite dans un nouvel onglet.
- Tous les boutons « S'abonner à l'infolettre » passent par `lienInfolettre`. Si `mailchimpAction` est vide, ils ouvrent un courriel prérempli vers info@geomtl.com.

## Changer de formulaire

Dans Mailchimp, ouvrir **Forms**, puis **Embedded form**, copier l'adresse de la balise `<form action="…">` et la coller dans `mailchimpAction`. Les champs activés dans Mailchimp doivent rester le courriel, le prénom et le nom : un autre champ obligatoire ferait échouer les inscriptions.

## Réglages dans Mailchimp

Dans **Audience**, menu **…**, **Audience settings** :

- Expéditeur : GÉOMTL, `info@geomtl.com`.
- Double opt-in activé : l'abonné confirme par courriel, ce qui conserve une preuve de son consentement (Loi 25).
- Adresse postale du pied de courriel : la même que dans la politique de confidentialité.

## Avant le premier envoi

Authentifier le domaine `geomtl.com` dans Mailchimp (**Settings**, **Domains**) et ajouter chez Gandi les enregistrements DNS indiqués. Le domaine a une politique DMARC : sans cette étape, les envois risquent de finir en indésirables.

## Importer des contacts

N'importer que des personnes ayant un lien avec l'événement, comme l'exige la loi canadienne anti-pourriel. Pas de liste achetée.
