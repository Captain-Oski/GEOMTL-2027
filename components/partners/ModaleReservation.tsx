'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { EVENT_CONFIG } from '@/data/config';
import {
  LIBELLES_NIVEAUX,
  LIMITES,
  NIVEAUX,
  SANS_PREFERENCE,
  messageErreur,
  validerDemande,
  type DonneesDemande,
  type ErreursDemande,
} from '@/lib/demandes-kiosques';
import type { NiveauDemande } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

// Formulaire « Devenir partenaire ou exposant », ouvert depuis les boutons du
// plan des kiosques. La demande part vers /api/demandes-kiosques ; les kiosques
// choisis restent affichés disponibles tant que le comité n'a pas confirmé la
// réservation dans l'admin.

type Etat = 'saisie' | 'envoi' | 'recue';

const VIDE = {
  kiosque: '' as string, // 1er choix. '' : pas encore choisi ; '0' : sans préférence
  kiosque_2: '' as string, // 2e et 3e choix, facultatifs
  kiosque_3: '' as string,
  niveau: '' as NiveauDemande | '',
  organisation: '',
  organisation_adresse: '',
  organisation_telephone: '',
  principal_nom: '',
  principal_courriel: '',
  principal_telephone: '',
  kiosque_meme_contact: false,
  kiosque_nom: '',
  kiosque_courriel: '',
  kiosque_telephone: '',
  message: '',
  consentement: false,
};

export default function ModaleReservation({
  fr,
  ouvert,
  kiosqueInitial,
  kiosquesDisponibles,
  onFermer,
}: {
  fr: boolean;
  ouvert: boolean;
  kiosqueInitial: number | null; // kiosque sélectionné sur le plan, s'il y en a un
  kiosquesDisponibles: number[];
  onFermer: () => void;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const ouvertA = useRef(0);
  const [champs, setChamps] = useState(VIDE);
  const [piege, setPiege] = useState('');
  const [erreurs, setErreurs] = useState<ErreursDemande>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [etat, setEtat] = useState<Etat>('saisie');
  const [retires, setRetires] = useState<number[]>([]); // choix réservés entre-temps

  // Valeurs lues à l'ouverture seulement (la liste est recréée à chaque rendu)
  const aLOuverture = useRef({ kiosqueInitial, kiosquesDisponibles });
  aLOuverture.current = { kiosqueInitial, kiosquesDisponibles };

  // Ouverture et fermeture de la fenêtre, et blocage du défilement de la page
  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (ouvert && !d.open) {
      const { kiosqueInitial: k, kiosquesDisponibles: dispo } = aLOuverture.current;
      setChamps({ ...VIDE, kiosque: k !== null && dispo.includes(k) ? String(k) : '' });
      setPiege('');
      setErreurs({});
      setErreurGenerale(null);
      setEtat('saisie');
      setRetires([]);
      ouvertA.current = performance.now();
      d.showModal();
      d.scrollTop = 0;
      document.documentElement.style.overflow = 'hidden';
    } else if (!ouvert && d.open) {
      d.close();
    }
  }, [ouvert]);

  useEffect(() => () => {
    document.documentElement.style.overflow = '';
  }, []);

  const fermer = () => {
    document.documentElement.style.overflow = '';
    onFermer();
  };

  const changer = <K extends keyof typeof VIDE>(cle: K, valeur: (typeof VIDE)[K]) => {
    setChamps((c) => ({ ...c, [cle]: valeur }));
    setErreurs((e) => ({ ...e, [cle]: undefined }));
  };

  // Sans préférence : le 2e et le 3e choix n'ont plus lieu d'être
  const changerKiosque = (cle: 'kiosque' | 'kiosque_2' | 'kiosque_3', valeur: string) => {
    setChamps((c) => ({ ...c, [cle]: valeur, ...(cle === 'kiosque' && valeur === String(SANS_PREFERENCE) ? { kiosque_2: '', kiosque_3: '' } : {}) }));
    setErreurs((e) => ({ ...e, kiosque: undefined, kiosque_2: undefined, kiosque_3: undefined }));
  };

  // Un kiosque déjà pris dans un autre choix n'est pas proposé
  const optionsKiosque = (autres: string[]) =>
    kiosquesDisponibles
      .filter((n) => !autres.includes(String(n)))
      .map((n) => <option key={n} value={n}>{fr ? `Kiosque ${n}` : `Booth ${n}`}</option>);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurGenerale(null);
    const donnees = { ...champs, langue: fr ? 'fr' : 'en' };
    const { erreurs: trouvees } = validerDemande(donnees);
    setErreurs(trouvees);
    if (Object.keys(trouvees).length > 0) {
      const premier = Object.keys(trouvees)[0];
      dialogue.current?.querySelector<HTMLElement>(`[name="${premier}"]`)?.focus();
      return;
    }

    setEtat('envoi');
    try {
      const retour = await fetch('/api/demandes-kiosques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...donnees, kiosque: Number(champs.kiosque), site_web: piege, duree_ms: Math.round(performance.now() - ouvertA.current) }),
      });
      const corps = await retour.json().catch(() => ({}));
      if (retour.ok) {
        setRetires(Array.isArray(corps.retires) ? corps.retires : []);
        setEtat('recue');
        return;
      }
      setEtat('saisie');
      if (corps.erreurs) setErreurs(corps.erreurs as ErreursDemande);
      setErreurGenerale(messageServeur(retour.status, corps.erreur, fr));
    } catch {
      setEtat('saisie');
      setErreurGenerale(messageServeur(0, undefined, fr));
    }
  };

  const erreur = (champ: keyof DonneesDemande) =>
    erreurs[champ] ? (
      <p id={`erreur-${champ}`} className="mt-1 text-xs font-medium text-red-700 dark:text-red-400">
        {messageErreur(champ, erreurs[champ]!, fr)}
      </p>
    ) : null;

  const proprietes = (champ: keyof DonneesDemande) => ({
    id: `reservation-${champ}`,
    name: champ,
    'aria-invalid': Boolean(erreurs[champ]),
    'aria-describedby': erreurs[champ] ? `erreur-${champ}` : undefined,
  });

  const champ = 'w-full rounded-xl border border-geo-ink/15 bg-white/70 px-3 py-2.5 text-sm text-geo-ink placeholder:text-geo-ink-soft/60 focus:border-geo-teal-dark focus:outline-none dark:bg-geo-cream-dark';
  const etiquette = 'mb-1 block text-sm font-medium text-geo-ink';
  const groupe = 'space-y-3 rounded-xl border border-geo-ink/10 p-4';
  const legende = 'px-1 text-sm font-semibold text-geo-ink';

  // Nom, courriel et téléphone d'un contact
  const contact = (prefixe: 'principal' | 'kiosque') => {
    const nom = `${prefixe}_nom` as const;
    const courriel = `${prefixe}_courriel` as const;
    const telephone = `${prefixe}_telephone` as const;
    return (
      <>
        <div>
          <label htmlFor={`reservation-${nom}`} className={etiquette}>{fr ? 'Nom et prénom' : 'Full name'}</label>
          <input {...proprietes(nom)} type="text" autoComplete={prefixe === 'principal' ? 'name' : 'off'} maxLength={LIMITES.nom} value={champs[nom]} onChange={(e) => changer(nom, e.target.value)} className={champ} />
          {erreur(nom)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`reservation-${courriel}`} className={etiquette}>{fr ? 'Courriel' : 'Email'}</label>
            <input {...proprietes(courriel)} type="email" autoComplete={prefixe === 'principal' ? 'email' : 'off'} maxLength={LIMITES.courriel} value={champs[courriel]} onChange={(e) => changer(courriel, e.target.value)} className={champ} />
            {erreur(courriel)}
          </div>
          <div>
            <label htmlFor={`reservation-${telephone}`} className={etiquette}>{fr ? 'Téléphone' : 'Phone'}</label>
            <input {...proprietes(telephone)} type="tel" autoComplete={prefixe === 'principal' ? 'tel' : 'off'} maxLength={LIMITES.telephone} value={champs[telephone]} onChange={(e) => changer(telephone, e.target.value)} className={champ} />
            {erreur(telephone)}
          </div>
        </div>
      </>
    );
  };

  return (
    <dialog
      ref={dialogue}
      onClose={fermer}
      aria-labelledby="reservation-titre"
      className="m-auto w-[min(42rem,calc(100vw-2rem))] max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl bg-geo-cream p-0 text-geo-ink shadow-2xl backdrop:bg-geo-noir/60 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-geo-ink/10 bg-geo-cream px-6 py-4">
        <div>
          <h2 id="reservation-titre" className="font-display text-xl font-bold">
            {fr ? 'Devenir partenaire ou exposant' : 'Become a partner or exhibitor'}
          </h2>
          <p className="mt-0.5 text-sm text-geo-ink-soft">
            {fr
              ? 'Choisissez votre niveau et jusqu\'à trois kiosques : le comité vous confirme la réservation après avoir reçu votre demande.'
              : 'Choose your level and up to three booths: the committee confirms the booking after receiving your request.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dialogue.current?.close()}
          aria-label={fr ? 'Fermer' : 'Close'}
          className="rounded-lg p-1.5 text-geo-ink-soft hover:bg-geo-ink/5 hover:text-geo-ink"
        >
          <X size={20} weight="light" aria-hidden="true" />
        </button>
      </div>

      {etat === 'recue' ? (
        <div className="px-6 py-10 text-center" role="status">
          <CheckCircle size={44} weight="light" className="mx-auto mb-4 text-geo-teal-dark" aria-hidden="true" />
          <p className="text-lg font-semibold">{fr ? 'Demande reçue, merci !' : 'Request received, thank you!'}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-geo-ink-soft">
            {fr
              ? 'Le comité étudie votre demande et vous répond sous peu. Un accusé de réception est envoyé à votre courriel. Les kiosques choisis restent affichés disponibles jusqu\'à ce que la réservation soit confirmée.'
              : 'The committee is reviewing your request and will get back to you shortly. A confirmation is sent to your email. The chosen booths stay shown as available until the booking is confirmed.'}
          </p>
          {retires.length > 0 && (
            <p className="mx-auto mt-3 max-w-md text-sm font-medium text-geo-ink">
              {fr
                ? `${retires.length > 1 ? 'Les kiosques' : 'Le kiosque'} ${retires.join(', ')} ${retires.length > 1 ? 'venaient d\'être réservés et ont été retirés' : 'venait d\'être réservé et a été retiré'} de votre demande.`
                : `Booth${retires.length > 1 ? 's' : ''} ${retires.join(', ')} had just been booked and ${retires.length > 1 ? 'were' : 'was'} removed from your request.`}
            </p>
          )}
          <button
            type="button"
            onClick={() => dialogue.current?.close()}
            className="mt-6 bg-geo-ink px-5 py-2.5 text-sm font-semibold text-geo-cream hover:bg-geo-ink/85"
          >
            {fr ? 'Fermer' : 'Close'}
          </button>
        </div>
      ) : (
        <form onSubmit={envoyer} noValidate className="space-y-5 px-6 py-5">
          {erreurGenerale && (
            <p role="alert" className="rounded-lg border border-red-700/30 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
              {erreurGenerale}
            </p>
          )}

          <div className="sm:w-1/2 sm:pr-1.5">
            <div>
              <label htmlFor="reservation-niveau" className={etiquette}>{fr ? 'Niveau souhaité' : 'Desired level'}</label>
              <select {...proprietes('niveau')} value={champs.niveau} onChange={(e) => changer('niveau', e.target.value as NiveauDemande)} className={champ}>
                <option value="">{fr ? 'Choisir…' : 'Choose…'}</option>
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>{fr ? LIBELLES_NIVEAUX[n].fr : LIBELLES_NIVEAUX[n].en}</option>
                ))}
              </select>
              {erreur('niveau')}
            </div>
          </div>

          <fieldset className={groupe}>
            <legend className={legende}>{fr ? 'Kiosques souhaités' : 'Desired booths'}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="reservation-kiosque" className={etiquette}>{fr ? '1er choix' : '1st choice'}</label>
                <select {...proprietes('kiosque')} value={champs.kiosque} onChange={(e) => changerKiosque('kiosque', e.target.value)} className={champ}>
                  <option value="">{fr ? 'Choisir…' : 'Choose…'}</option>
                  <option value={String(SANS_PREFERENCE)}>{fr ? 'Sans préférence' : 'No preference'}</option>
                  {optionsKiosque([champs.kiosque_2, champs.kiosque_3])}
                </select>
                {erreur('kiosque')}
              </div>
              {champs.kiosque !== String(SANS_PREFERENCE) && kiosquesDisponibles.length >= 2 && (
                <div>
                  <label htmlFor="reservation-kiosque_2" className={etiquette}>
                    {fr ? '2e choix' : '2nd choice'} <span className="font-normal text-geo-ink-soft">{fr ? '(facultatif)' : '(optional)'}</span>
                  </label>
                  <select {...proprietes('kiosque_2')} value={champs.kiosque_2} onChange={(e) => changerKiosque('kiosque_2', e.target.value)} className={champ}>
                    <option value="">{fr ? 'Aucun' : 'None'}</option>
                    {optionsKiosque([champs.kiosque, champs.kiosque_3])}
                  </select>
                  {erreur('kiosque_2')}
                </div>
              )}
              {champs.kiosque !== String(SANS_PREFERENCE) && kiosquesDisponibles.length >= 3 && (
                <div>
                  <label htmlFor="reservation-kiosque_3" className={etiquette}>
                    {fr ? '3e choix' : '3rd choice'} <span className="font-normal text-geo-ink-soft">{fr ? '(facultatif)' : '(optional)'}</span>
                  </label>
                  <select {...proprietes('kiosque_3')} value={champs.kiosque_3} onChange={(e) => changerKiosque('kiosque_3', e.target.value)} className={champ}>
                    <option value="">{fr ? 'Aucun' : 'None'}</option>
                    {optionsKiosque([champs.kiosque, champs.kiosque_2])}
                  </select>
                  {erreur('kiosque_3')}
                </div>
              )}
            </div>
            <p className="text-xs text-geo-ink-soft">
              {fr
                ? `Un kiosque peut être réservé entre-temps : indiquer d'autres choix nous évite de vous réécrire. ${kiosquesDisponibles.length} kiosques disponibles, numérotés comme sur le plan.`
                : `A booth may be booked in the meantime: listing other choices saves another round of emails. ${kiosquesDisponibles.length} booths available, numbered as on the plan.`}
            </p>
          </fieldset>

          <fieldset className={groupe}>
            <legend className={legende}>{fr ? 'Organisation' : 'Organization'}</legend>
            <div>
              <label htmlFor="reservation-organisation" className={etiquette}>{fr ? 'Nom de l\'organisation' : 'Organization name'}</label>
              <input {...proprietes('organisation')} type="text" autoComplete="organization" maxLength={LIMITES.organisation} value={champs.organisation} onChange={(e) => changer('organisation', e.target.value)} className={champ} />
              {erreur('organisation')}
            </div>
            <div>
              <label htmlFor="reservation-organisation_adresse" className={etiquette}>{fr ? 'Adresse civique' : 'Street address'}</label>
              <input {...proprietes('organisation_adresse')} type="text" autoComplete="street-address" maxLength={LIMITES.adresse} placeholder={fr ? 'Numéro, rue, ville, province, code postal' : 'Number, street, city, province, postal code'} value={champs.organisation_adresse} onChange={(e) => changer('organisation_adresse', e.target.value)} className={champ} />
              {erreur('organisation_adresse')}
            </div>
            <div className="sm:w-1/2 sm:pr-1.5">
              <label htmlFor="reservation-organisation_telephone" className={etiquette}>{fr ? 'Téléphone de l\'organisation' : 'Organization phone'}</label>
              <input {...proprietes('organisation_telephone')} type="tel" autoComplete="tel" maxLength={LIMITES.telephone} value={champs.organisation_telephone} onChange={(e) => changer('organisation_telephone', e.target.value)} className={champ} />
              {erreur('organisation_telephone')}
            </div>
          </fieldset>

          <fieldset className={groupe}>
            <legend className={legende}>{fr ? 'Responsable de la facturation' : 'Billing contact'}</legend>
            {contact('principal')}
          </fieldset>

          <fieldset className={groupe}>
            <legend className={legende}>{fr ? 'Responsable du kiosque sur place lors de l\'événement' : 'On-site booth contact during the event'}</legend>
            <label className="flex items-center gap-2 text-sm text-geo-ink-soft">
              <input
                type="checkbox"
                name="kiosque_meme_contact"
                checked={champs.kiosque_meme_contact}
                onChange={(e) => changer('kiosque_meme_contact', e.target.checked)}
                className="h-4 w-4 accent-geo-teal-dark"
              />
              {fr ? 'Même personne que le responsable de la facturation' : 'Same person as the billing contact'}
            </label>
            {!champs.kiosque_meme_contact && contact('kiosque')}
          </fieldset>

          <div>
            <label htmlFor="reservation-message" className={etiquette}>
              {fr ? 'Message' : 'Message'} <span className="font-normal text-geo-ink-soft">{fr ? '(facultatif)' : '(optional)'}</span>
            </label>
            <textarea {...proprietes('message')} rows={3} maxLength={LIMITES.message} value={champs.message} onChange={(e) => changer('message', e.target.value)} className={cn(champ, 'resize-none')} />
            {erreur('message')}
          </div>

          {/* Champ piège : invisible pour les personnes, rempli par les robots */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="reservation-site_web">Site web</label>
            <input id="reservation-site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" value={piege} onChange={(e) => setPiege(e.target.value)} />
          </div>

          <div>
            <label className="flex items-start gap-3 text-sm text-geo-ink-soft">
              <input
                {...proprietes('consentement')}
                type="checkbox"
                checked={champs.consentement}
                onChange={(e) => changer('consentement', e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-geo-teal-dark"
              />
              <span>
                {fr
                  ? 'J\'accepte que le comité GÉOMTL utilise ces renseignements pour traiter ma demande, conformément à la '
                  : 'I agree that the GÉOMTL committee may use this information to process my request, in accordance with the '}
                <Link href={`/${fr ? 'fr' : 'en'}/confidentialite`} target="_blank" className="font-semibold text-geo-teal-dark hover:underline">
                  {fr ? 'politique de confidentialité' : 'privacy policy'}
                </Link>
                .
              </span>
            </label>
            {erreur('consentement')}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-geo-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={() => dialogue.current?.close()} className="px-4 py-2.5 text-sm font-semibold text-geo-ink-soft hover:text-geo-ink">
              {fr ? 'Annuler' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={etat === 'envoi'}
              className="bg-gradient-geo-2027 px-5 py-2.5 text-sm font-bold text-geo-noir transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {etat === 'envoi' ? (fr ? 'Envoi…' : 'Sending…') : (fr ? 'Envoyer la demande' : 'Send request')}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function messageServeur(status: number, code: string | undefined, fr: boolean) {
  const courriel = EVENT_CONFIG.courriels.partenariat;
  if (status === 409) return fr ? 'Les kiosques choisis viennent d\'être réservés. Choisissez-en d\'autres.' : 'The chosen booths have just been booked. Please choose others.';
  if (status === 429) return fr ? 'Trop de demandes envoyées. Réessayez plus tard ou écrivez-nous.' : 'Too many requests sent. Please try again later or email us.';
  if (status === 400 && code === 'validation') return fr ? 'Vérifiez les champs indiqués.' : 'Please check the highlighted fields.';
  if (status === 400 && code === 'trop_rapide') return fr ? 'Envoi trop rapide. Patientez quelques secondes, puis réessayez.' : 'Sent too quickly. Wait a few seconds, then try again.';
  return fr
    ? `La demande n'a pas pu être envoyée. Réessayez, ou écrivez-nous à ${courriel}.`
    : `The request could not be sent. Try again, or email us at ${courriel}.`;
}
