'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { accepterDemande, changerStatutDemande, effacerDemandes, enregistrerNotesDemande } from '@/lib/actions/kiosques'
import { EVENT_CONFIG } from '@/data/config'
import { LIBELLES_NIVEAUX, choixDemande, dateFinConservation } from '@/lib/demandes-kiosques'
import type { DemandeKiosque, Kiosque, NiveauDemande, StatutDemande } from '@/lib/supabase/types'

const STATUTS: Record<StatutDemande, { libelle: string; classe: string }> = {
  nouvelle: { libelle: 'Nouvelle', classe: 'bg-rose-500/15 text-rose-300' },
  en_traitement: { libelle: 'En traitement', classe: 'bg-amber-500/15 text-amber-300' },
  acceptee: { libelle: 'Acceptée', classe: 'bg-emerald-500/15 text-emerald-300' },
  refusee: { libelle: 'Refusée', classe: 'bg-gray-700 text-gray-300' },
  archivee: { libelle: 'Archivée', classe: 'bg-gray-800 text-gray-400' },
  spam: { libelle: 'Indésirable', classe: 'bg-gray-800 text-gray-500' },
}

type Filtre = 'actives' | 'toutes' | StatutDemande

const RANGS = ['1er choix', '2e choix', '3e choix']

type Executer = (fn: () => Promise<{ error?: string; avertissement?: string }>, succes?: string) => Promise<boolean>

export function DemandesKiosques({
  demandes,
  kiosques,
  peutModifier,
  peutEffacer,
  executer,
  ouvrirKiosque,
}: {
  demandes: DemandeKiosque[]
  kiosques: Kiosque[]
  peutModifier: boolean
  peutEffacer: boolean
  executer: Executer
  ouvrirKiosque: (numero: number | null) => void
}) {
  const finConservation = dateFinConservation(EVENT_CONFIG.datesEvenement.fin)
  const conservationTerminee = new Date() >= finConservation
  const [filtre, setFiltre] = useState<Filtre>('actives')
  const [choisieId, setChoisieId] = useState<string | null>(null)

  const liste = useMemo(
    () =>
      demandes.filter((d) =>
        filtre === 'toutes' ? true : filtre === 'actives' ? ['nouvelle', 'en_traitement', 'acceptee'].includes(d.statut) : d.statut === filtre
      ),
    [demandes, filtre]
  )
  const choisie = demandes.find((d) => d.id === choisieId) ?? null
  const reserve = (n: number) => kiosques.find((k) => k.numero === n)?.statut === 'reserve'

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <select
            value={filtre}
            onChange={(e) => setFiltre(e.target.value as Filtre)}
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="actives" className="bg-gray-900">À traiter (nouvelles, en traitement, acceptées)</option>
            <option value="toutes" className="bg-gray-900">Toutes</option>
            {(Object.keys(STATUTS) as StatutDemande[]).map((s) => (
              <option key={s} value={s} className="bg-gray-900">{STATUTS[s].libelle}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{liste.length} demande{liste.length > 1 ? 's' : ''}</span>
        </div>

        {liste.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">Aucune demande dans cette vue.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left py-3 px-3 font-medium">Reçue</th>
                  <th className="text-left py-3 px-3 font-medium">Kiosque</th>
                  <th className="text-left py-3 px-3 font-medium">Organisation</th>
                  <th className="text-left py-3 px-3 font-medium">Niveau</th>
                  <th className="text-left py-3 px-3 font-medium">Contact</th>
                  <th className="text-left py-3 px-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setChoisieId(d.id)}
                    className={`cursor-pointer border-t border-white/5 transition-colors hover:bg-white/5 ${choisieId === d.id ? 'bg-white/10' : ''}`}
                  >
                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap">{new Date(d.created_at).toLocaleDateString('fr-CA')}</td>
                    <td className="py-3 px-3 text-white">
                      {choixDemande(d).length === 0 && <span className="text-gray-500">Sans préférence</span>}
                      {choixDemande(d).map((n, i) => (
                        <span key={n}>
                          {i > 0 && <span className="text-gray-500"> · </span>}
                          <span title={reserve(n) ? 'Ce kiosque est déjà réservé' : RANGS[i]} className={reserve(n) && d.statut !== 'acceptee' ? 'text-amber-300 line-through' : ''}>{n}</span>
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-3">
                      <button type="button" onClick={() => setChoisieId(d.id)} className="text-left font-medium text-white hover:underline">
                        {d.organisation}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{LIBELLES_NIVEAUX[d.niveau].fr}</td>
                    <td className="py-3 px-3 text-gray-300">
                      <div>{d.principal_nom}</div>
                      <div className="text-xs text-gray-500">{d.principal_courriel}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUTS[d.statut].classe}`}>{STATUTS[d.statut].libelle}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Politique de confidentialité : demandes gardées jusqu'à 6 mois après l'événement */}
        {peutEffacer && demandes.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-400">
            <span>
              {conservationTerminee
                ? 'La période de conservation est terminée : effacez les demandes. Les fiches créées restent en place.'
                : `Conservation : les demandes devront être effacées à partir du ${finConservation.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}.`}
            </span>
            {conservationTerminee && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Effacer définitivement les ${demandes.length} demandes ?`)) executer(effacerDemandes, 'Demandes effacées.')
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-500"
              >
                Effacer les demandes
              </button>
            )}
          </div>
        )}
      </div>

      {choisie ? (
        <DetailDemande
          key={choisie.id}
          demande={choisie}
          reserve={reserve}
          peutModifier={peutModifier}
          executer={executer}
          ouvrirKiosque={ouvrirKiosque}
        />
      ) : (
        <aside className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400 h-fit">
          Choisissez une demande pour voir le détail et la traiter.
        </aside>
      )}
    </div>
  )
}

function DetailDemande({
  demande: d,
  reserve,
  peutModifier,
  executer,
  ouvrirKiosque,
}: {
  demande: DemandeKiosque
  reserve: (numero: number) => boolean
  peutModifier: boolean
  executer: Executer
  ouvrirKiosque: (numero: number | null) => void
}) {
  const choix = choixDemande(d)
  const libres = choix.filter((n) => !reserve(n))
  const [niveau, setNiveau] = useState<NiveauDemande | ''>(d.niveau === 'a_determiner' ? '' : d.niveau)
  const [notes, setNotes] = useState(d.notes_internes ?? '')
  const [envoi, setEnvoi] = useState(false)
  const ficheLien = d.fiche_exhibitor_id
    ? `/admin/exhibitors/${d.fiche_exhibitor_id}/edit`
    : d.fiche_partner_id
      ? `/admin/partners/${d.fiche_partner_id}/edit`
      : null
  const sujetReponse = encodeURIComponent(
    d.langue === 'fr' ? 'GÉOMTL 2027 : votre demande de partenariat ou d\'exposition' : 'GÉOMTL 2027: your partner or exhibitor request'
  )
  const memePersonne =
    d.kiosque_nom === d.principal_nom && d.kiosque_courriel === d.principal_courriel && d.kiosque_telephone === d.principal_telephone

  async function action(fn: () => Promise<{ error?: string; avertissement?: string }>, succes?: string) {
    setEnvoi(true)
    await executer(fn, succes)
    setEnvoi(false)
  }

  const bouton = 'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50'

  return (
    <aside className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4 h-fit">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{d.organisation}</h2>
          <p className="text-xs text-gray-500">
            {LIBELLES_NIVEAUX[d.niveau].fr} · reçue le {new Date(d.created_at).toLocaleString('fr-CA')}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUTS[d.statut].classe}`}>{STATUTS[d.statut].libelle}</span>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Kiosques demandés</p>
        {choix.length === 0 ? (
          <p className="text-sm text-gray-200">Sans préférence</p>
        ) : (
          <ul className="space-y-1 text-sm text-gray-200">
            {choix.map((n, i) => (
              <li key={n}>
                <span className="text-gray-500">{RANGS[i]} :</span> kiosque {n}
                {reserve(n) && <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">déjà réservé</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {choix.length > 0 && libres.length === 0 && d.statut !== 'acceptee' && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          {choix.length > 1 ? 'Tous les kiosques demandés sont déjà réservés' : 'Le kiosque demandé est déjà réservé'} : proposez-en un autre à cette organisation.
        </p>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Organisation</p>
          <p className="text-gray-200">{d.organisation_adresse || <span className="text-gray-500">Adresse non fournie</span>}</p>
          {d.organisation_telephone ? (
            <a href={`tel:${d.organisation_telephone.replace(/[^\d+]/g, '')}`} className="block text-blue-300 hover:underline">
              {d.organisation_telephone}
            </a>
          ) : (
            <p className="text-gray-500">Téléphone non fourni</p>
          )}
        </div>
        <Contact titre="Responsable de la facturation" nom={d.principal_nom} courriel={d.principal_courriel} telephone={d.principal_telephone} sujet={sujetReponse} />
        {memePersonne ? (
          <p className="text-xs text-gray-500">Responsable du kiosque sur place : le responsable de la facturation.</p>
        ) : (
          <Contact titre="Responsable du kiosque sur place" nom={d.kiosque_nom} courriel={d.kiosque_courriel} telephone={d.kiosque_telephone} sujet={sujetReponse} />
        )}
        <p className="text-xs text-gray-500">Langue : {d.langue === 'fr' ? 'français' : 'anglais'}</p>
      </div>
      {d.message && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Message</p>
          <p className="whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-sm text-gray-200">{d.message}</p>
        </div>
      )}

      {peutModifier && (
        <>
          <label className="block text-xs font-medium text-gray-400">
            Notes internes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== (d.notes_internes ?? '') && action(() => enregistrerNotesDemande(d.id, notes))}
              rows={3}
              className="mt-1 w-full resize-none bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </label>

          {d.statut === 'acceptee' ? (
            <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
              <p>Demande acceptée{ficheLien ? ' : la fiche est créée.' : '.'} Les kiosques restent disponibles sur le site jusqu&apos;à la confirmation.</p>
              <div className="flex flex-wrap gap-2">
                {ficheLien && <Link href={ficheLien} className={`${bouton} bg-white/10 text-white hover:bg-white/20`}>Ouvrir la fiche</Link>}
                {libres.map((n) => (
                  <button key={n} type="button" onClick={() => ouvrirKiosque(n)} className={`${bouton} bg-blue-600 text-white hover:bg-blue-500`}>
                    Confirmer le kiosque {n}
                  </button>
                ))}
                {libres.length === 0 && (
                  <button type="button" onClick={() => ouvrirKiosque(null)} className={`${bouton} bg-blue-600 text-white hover:bg-blue-500`}>
                    Choisir un kiosque sur le plan
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 rounded-lg border border-white/10 p-3">
              <p className="text-xs font-semibold text-gray-300">Accepter et créer la fiche</p>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value as NiveauDemande | '')}
                  className="bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" className="bg-gray-900">Niveau…</option>
                  {(['exposant', 'bronze', 'argent', 'or', 'soiree'] as const).map((n) => (
                    <option key={n} value={n} className="bg-gray-900">{LIBELLES_NIVEAUX[n].fr}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={envoi || !niveau}
                  onClick={() => niveau && niveau !== 'a_determiner' && action(() => accepterDemande(d.id, niveau), 'Demande acceptée : la fiche est créée.')}
                  className={`${bouton} bg-emerald-600 text-white hover:bg-emerald-500`}
                >
                  Accepter
                </button>
              </div>
              <p className="text-[11px] text-gray-500">Crée une fiche {niveau === 'exposant' ? 'Exposants' : 'Partenaires'} préremplie, avec le premier choix encore libre. Le kiosque n&apos;est pas encore réservé.</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {d.statut !== 'en_traitement' && d.statut !== 'acceptee' && (
              <button type="button" disabled={envoi} onClick={() => action(() => changerStatutDemande(d.id, 'en_traitement'))} className={`${bouton} bg-amber-500/20 text-amber-200 hover:bg-amber-500/30`}>En traitement</button>
            )}
            {d.statut !== 'refusee' && (
              <button type="button" disabled={envoi} onClick={() => window.confirm('Refuser cette demande ?') && action(() => changerStatutDemande(d.id, 'refusee'))} className={`${bouton} bg-white/10 text-gray-200 hover:bg-white/20`}>Refuser</button>
            )}
            {d.statut !== 'archivee' && (
              <button type="button" disabled={envoi} onClick={() => action(() => changerStatutDemande(d.id, 'archivee'))} className={`${bouton} bg-white/10 text-gray-200 hover:bg-white/20`}>Archiver</button>
            )}
            {d.statut !== 'spam' && d.statut !== 'acceptee' && (
              <button type="button" disabled={envoi} onClick={() => action(() => changerStatutDemande(d.id, 'spam'))} className={`${bouton} bg-white/10 text-gray-400 hover:bg-white/20`}>Indésirable</button>
            )}
          </div>
        </>
      )}
    </aside>
  )
}

function Contact({ titre, nom, courriel, telephone, sujet }: { titre: string; nom: string; courriel: string; telephone: string; sujet: string }) {
  return (
    <div className="rounded-lg bg-black/20 p-3">
      <p className="text-xs text-gray-500">{titre}</p>
      <p className="font-medium text-white">{nom}</p>
      <a href={`mailto:${courriel}?subject=${sujet}`} className="block text-blue-300 hover:underline break-all">{courriel}</a>
      <a href={`tel:${telephone.replace(/[^0-9+]/g, '')}`} className="block text-gray-300 hover:underline">{telephone}</a>
    </div>
  )
}
