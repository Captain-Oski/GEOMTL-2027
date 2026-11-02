import type { DemandeKiosque, NiveauDemande } from '@/lib/supabase/types';

// Règles des demandes « Devenir partenaire ou exposant » envoyées depuis le
// plan des kiosques, partagées par le formulaire (erreurs affichées sous les
// champs) et par la route serveur (validation qui fait foi). Aucune dépendance
// serveur ici : ce module est aussi envoyé au navigateur.

export const NOMBRE_KIOSQUES = 26;

// Valeur du choix « Sans préférence » dans la liste des kiosques
export const SANS_PREFERENCE = 0;

// Fin de la conservation des demandes : 6 mois après la fin de l'événement
export function dateFinConservation(finEvenement: string): Date {
  const d = new Date(`${finEvenement}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + 6);
  return d;
}

// Kiosques d'une demande, par ordre de préférence (vide : sans préférence)
export function choixDemande(d: Pick<DemandeKiosque, 'kiosque_numero' | 'kiosque_choix_2' | 'kiosque_choix_3'>): number[] {
  return [d.kiosque_numero, d.kiosque_choix_2, d.kiosque_choix_3].filter((n): n is number => n !== null);
}

export const NIVEAUX: NiveauDemande[] = ['exposant', 'bronze', 'argent', 'or', 'soiree', 'a_determiner'];

export const LIBELLES_NIVEAUX: Record<NiveauDemande, { fr: string; en: string }> = {
  exposant: { fr: 'Exposant', en: 'Exhibitor' },
  bronze: { fr: 'Partenaire Bronze', en: 'Bronze partner' },
  argent: { fr: 'Partenaire Argent', en: 'Silver partner' },
  or: { fr: 'Partenaire Or', en: 'Gold partner' },
  soiree: { fr: 'Commandite de la soirée réseautage', en: 'Networking evening sponsorship' },
  a_determiner: { fr: 'À déterminer', en: 'Not sure yet' },
};

export const LIMITES = {
  organisation: 150,
  adresse: 300,
  nom: 120,
  courriel: 254,
  telephone: 40,
  message: 2000,
} as const;

// Un envoi plus rapide que ce délai après l'ouverture du formulaire vient
// presque sûrement d'un robot.
export const DELAI_MINIMUM_MS = 3000;

export interface DonneesDemande {
  kiosque: number; // 1er choix : 1 à 26, ou SANS_PREFERENCE
  kiosque_2: number | null; // 2e et 3e choix, facultatifs
  kiosque_3: number | null;
  niveau: NiveauDemande;
  organisation: string;
  organisation_adresse: string;
  organisation_telephone: string;
  principal_nom: string;
  principal_courriel: string;
  principal_telephone: string;
  kiosque_meme_contact: boolean; // le responsable du kiosque est le responsable de la facturation
  kiosque_nom: string;
  kiosque_courriel: string;
  kiosque_telephone: string;
  message: string;
  consentement: boolean;
  langue: 'fr' | 'en';
}

export type CodeErreur = 'requis' | 'trop_court' | 'trop_long' | 'invalide';
export type ErreursDemande = Partial<Record<keyof DonneesDemande, CodeErreur>>;

const COURRIEL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const TELEPHONE = /^[0-9+().\s-]{7,40}$/;

// Texte brut : caractères de contrôle retirés, espaces resserrés (sauf les
// retours à la ligne du message)
function texte(valeur: unknown, multiligne = false): string {
  if (typeof valeur !== 'string') return '';
  const sansControle = valeur.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return multiligne
    ? sansControle.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
    : sansControle.replace(/\s+/g, ' ').trim();
}

const choixFacultatif = (valeur: unknown) => (valeur === '' || valeur === null || valeur === undefined ? null : Number(valeur));
const kiosqueExiste = (n: number) => Number.isInteger(n) && n >= 1 && n <= NOMBRE_KIOSQUES;

export function validerDemande(brut: Record<string, unknown>): { donnees: DonneesDemande; erreurs: ErreursDemande } {
  const erreurs: ErreursDemande = {};
  const kiosque = brut.kiosque === '' || brut.kiosque === null || brut.kiosque === undefined ? NaN : Number(brut.kiosque);
  // Sans préférence : pas d'autre choix. Un 3e choix sans 2e prend sa place.
  let kiosque2 = kiosque === SANS_PREFERENCE ? null : choixFacultatif(brut.kiosque_2);
  let kiosque3 = kiosque === SANS_PREFERENCE ? null : choixFacultatif(brut.kiosque_3);
  if (kiosque2 === null) {
    kiosque2 = kiosque3;
    kiosque3 = null;
  }
  const niveau = brut.niveau as NiveauDemande;
  const meme = brut.kiosque_meme_contact === true;
  const donnees: DonneesDemande = {
    kiosque,
    kiosque_2: kiosque2,
    kiosque_3: kiosque3,
    niveau,
    organisation: texte(brut.organisation),
    organisation_adresse: texte(brut.organisation_adresse),
    organisation_telephone: texte(brut.organisation_telephone),
    principal_nom: texte(brut.principal_nom),
    principal_courriel: texte(brut.principal_courriel).toLowerCase(),
    principal_telephone: texte(brut.principal_telephone),
    kiosque_meme_contact: meme,
    kiosque_nom: texte(brut.kiosque_nom),
    kiosque_courriel: texte(brut.kiosque_courriel).toLowerCase(),
    kiosque_telephone: texte(brut.kiosque_telephone),
    message: texte(brut.message, true),
    consentement: brut.consentement === true,
    langue: brut.langue === 'en' ? 'en' : 'fr',
  };
  // Même personne : le contact du kiosque reprend le responsable de la facturation
  if (meme) {
    donnees.kiosque_nom = donnees.principal_nom;
    donnees.kiosque_courriel = donnees.principal_courriel;
    donnees.kiosque_telephone = donnees.principal_telephone;
  }

  if (Number.isNaN(kiosque)) erreurs.kiosque = 'requis';
  else if (!Number.isInteger(kiosque) || kiosque < SANS_PREFERENCE || kiosque > NOMBRE_KIOSQUES) erreurs.kiosque = 'invalide';
  if (kiosque2 !== null && (!kiosqueExiste(kiosque2) || kiosque2 === kiosque)) erreurs.kiosque_2 = 'invalide';
  if (kiosque3 !== null && (!kiosqueExiste(kiosque3) || kiosque3 === kiosque || kiosque3 === kiosque2)) erreurs.kiosque_3 = 'invalide';
  if (!NIVEAUX.includes(niveau)) erreurs.niveau = 'requis';

  const longueur = (champ: keyof DonneesDemande, valeur: string, max: number) => {
    if (!valeur) erreurs[champ] = 'requis';
    else if (valeur.length < 2) erreurs[champ] = 'trop_court';
    else if (valeur.length > max) erreurs[champ] = 'trop_long';
  };
  const courriel = (champ: keyof DonneesDemande, valeur: string) => {
    if (!valeur) erreurs[champ] = 'requis';
    else if (valeur.length > LIMITES.courriel || !COURRIEL.test(valeur)) erreurs[champ] = 'invalide';
  };
  const telephone = (champ: keyof DonneesDemande, valeur: string) => {
    if (!valeur) erreurs[champ] = 'requis';
    else if (!TELEPHONE.test(valeur)) erreurs[champ] = 'invalide';
  };

  longueur('organisation', donnees.organisation, LIMITES.organisation);
  if (!donnees.organisation_adresse) erreurs.organisation_adresse = 'requis';
  else if (donnees.organisation_adresse.length < 5) erreurs.organisation_adresse = 'trop_court';
  else if (donnees.organisation_adresse.length > LIMITES.adresse) erreurs.organisation_adresse = 'trop_long';
  telephone('organisation_telephone', donnees.organisation_telephone);
  longueur('principal_nom', donnees.principal_nom, LIMITES.nom);
  courriel('principal_courriel', donnees.principal_courriel);
  telephone('principal_telephone', donnees.principal_telephone);
  if (!meme) {
    longueur('kiosque_nom', donnees.kiosque_nom, LIMITES.nom);
    courriel('kiosque_courriel', donnees.kiosque_courriel);
    telephone('kiosque_telephone', donnees.kiosque_telephone);
  }
  if (donnees.message.length > LIMITES.message) erreurs.message = 'trop_long';
  if (!donnees.consentement) erreurs.consentement = 'requis';

  return { donnees, erreurs };
}

const MESSAGES: Record<CodeErreur, { fr: string; en: string }> = {
  requis: { fr: 'Ce champ est requis.', en: 'This field is required.' },
  trop_court: { fr: 'Trop court.', en: 'Too short.' },
  trop_long: { fr: 'Trop long.', en: 'Too long.' },
  invalide: { fr: 'Valeur invalide.', en: 'Invalid value.' },
};

const COURRIEL_INVALIDE = { fr: 'Adresse courriel invalide.', en: 'Invalid email address.' };
const TELEPHONE_INVALIDE = { fr: 'Numéro de téléphone invalide.', en: 'Invalid phone number.' };

const CHOIX_INVALIDE = { fr: 'Choisissez un autre kiosque de la liste.', en: 'Choose a different booth from the list.' };

const MESSAGES_PARTICULIERS: Partial<Record<keyof DonneesDemande, Partial<Record<CodeErreur, { fr: string; en: string }>>>> = {
  principal_courriel: { invalide: COURRIEL_INVALIDE },
  kiosque_courriel: { invalide: COURRIEL_INVALIDE },
  principal_telephone: { invalide: TELEPHONE_INVALIDE },
  kiosque_telephone: { invalide: TELEPHONE_INVALIDE },
  organisation_telephone: { invalide: TELEPHONE_INVALIDE },
  organisation_adresse: { trop_court: { fr: 'Adresse incomplète.', en: 'Incomplete address.' } },
  consentement: { requis: { fr: 'Votre consentement est nécessaire pour traiter la demande.', en: 'Your consent is required to process the request.' } },
  niveau: { requis: { fr: 'Choisissez un niveau.', en: 'Choose a level.' } },
  kiosque: {
    requis: { fr: 'Choisissez un kiosque, ou « Sans préférence ».', en: 'Choose a booth, or “No preference”.' },
    invalide: { fr: 'Choisissez un kiosque de la liste.', en: 'Choose a booth from the list.' },
  },
  kiosque_2: { invalide: CHOIX_INVALIDE },
  kiosque_3: { invalide: CHOIX_INVALIDE },
};

export function messageErreur(champ: keyof DonneesDemande, code: CodeErreur, fr: boolean): string {
  const m = MESSAGES_PARTICULIERS[champ]?.[code] ?? MESSAGES[code];
  return fr ? m.fr : m.en;
}
