'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PlanKiosques from '@/components/partners/PlanKiosques'
import { DemandesKiosques } from '@/components/admin/kiosques/DemandesKiosques'
import { choixDemande } from '@/lib/demandes-kiosques'
import { ListeOrganisations } from './ListeOrganisations'
import { confirmerReservation, libererKiosque, modifierReservation } from '@/lib/actions/kiosques'
import type { DemandeKiosque, Exhibitor, Kiosque, Partner } from '@/lib/supabase/types'

export type FicheLiee = {
  id: string
  type: 'exposant' | 'partenaire'
  nom: string
  logo: string | null
  site: string | null
  detail: string
}

export type Onglet = 'demandes' | 'organisations' | 'plan'

export type Executer = (
  fn: () => Promise<{ error?: string; avertissement?: string }>,
  succes?: string
) => Promise<boolean>

export function AdminOrganisationsPage({
  ongletInitial,
  kiosques,
  demandes,
  partners,
  exhibitors,
  fiches,
  partnersArchives,
  exhibitorsArchives,
  peutModifier,
  peutSupprimer,
}: {
  ongletInitial: Onglet
  kiosques: Kiosque[]
  demandes: DemandeKiosque[]
  partners: Partner[]
  exhibitors: Exhibitor[]
  fiches: FicheLiee[]
  partnersArchives: Partner[]
  exhibitorsArchives: Exhibitor[]
  peutModifier: boolean
  peutSupprimer: boolean
}) {
  const router = useRouter()
  const [onglet, setOnglet] = useState<Onglet>(ongletInitial)
  const [choisi, setChoisi] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'erreur' | 'info'; texte: string } | null>(null)

  const disponibles = kiosques.filter((k) => k.statut === 'disponible').length
  const nouvelles = demandes.filter((d) => d.statut === 'nouvelle').length

  function afficher(type: 'erreur' | 'info', texte: string) {
    setMessage({ type, texte })
    setTimeout(() => setMessage(null), 6000)
  }

  const executer: Executer = async (fn, succes) => {
    const res = await fn()
    if (res.error) {
      afficher('erreur', res.error)
      return false
    }
    if (res.avertissement) afficher('info', res.avertissement)
    else if (succes) afficher('info', succes)
    router.refresh()
    return true
  }

  // L'onglet reste dans l'adresse (retour depuis une fiche, lien partagé) sans recharger la page
  function changerOnglet(cle: Onglet) {
    setOnglet(cle)
    window.history.replaceState(null, '', `?onglet=${cle}`)
  }

  // Depuis une demande acceptée : aller au plan, kiosque sélectionné s'il y en a un
  function ouvrirKiosque(numero: number | null) {
    changerOnglet('plan')
    setChoisi(numero)
  }

  const noteDemandes = (
    <p className="mb-4 max-w-3xl text-xs text-gray-500">
      Une demande ne change jamais ce que voit le public : un kiosque passe à « Indisponible » sur le site seulement quand le comité confirme sa réservation dans l&apos;onglet Plan des kiosques.
    </p>
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Partenaires et exposants</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          GÉOMTL 2027 · {partners.length} partenaire{partners.length > 1 ? 's' : ''} · {exhibitors.length} exposant{exhibitors.length > 1 ? 's' : ''} · {disponibles} kiosques disponibles sur {kiosques.length}
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
            message.type === 'erreur' ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-blue-500/40 bg-blue-500/10 text-blue-200'
          }`}
        >
          {message.texte}
        </div>
      )}

      <div role="tablist" className="mb-6 flex gap-1 border-b border-gray-800">
        {([
          ['demandes', `Demandes${nouvelles ? ` (${nouvelles})` : ''}`],
          ['organisations', `Organisations (${partners.length + exhibitors.length})`],
          ['plan', 'Plan des kiosques'],
        ] as [Onglet, string][]).map(([cle, libelle]) => (
          <button
            key={cle}
            role="tab"
            aria-selected={onglet === cle}
            onClick={() => changerOnglet(cle)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              onglet === cle ? 'border-rose-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {libelle}
          </button>
        ))}
      </div>

      {onglet === 'organisations' && (
        <ListeOrganisations
          partners={partners}
          exhibitors={exhibitors}
          partnersArchives={partnersArchives}
          exhibitorsArchives={exhibitorsArchives}
          peutModifier={peutModifier}
          peutSupprimer={peutSupprimer}
          executer={executer}
        />
      )}

      {onglet === 'demandes' && (
        <>
          {noteDemandes}
          <DemandesKiosques
            demandes={demandes}
            kiosques={kiosques}
            peutModifier={peutModifier}
            peutEffacer={peutSupprimer}
            executer={executer}
            ouvrirKiosque={ouvrirKiosque}
          />
        </>
      )}

      {onglet === 'plan' && (
        <>
          {noteDemandes}
          <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <div className="rounded-xl bg-[#F4F3EE] p-4">
              <PlanKiosques fr kiosques={kiosques} mode="admin" choisi={choisi} onChoisir={setChoisi} />
            </div>
            <FicheKiosque
              key={choisi ?? 'aucun'}
              kiosque={kiosques.find((k) => k.numero === choisi) ?? null}
              demandes={demandes.filter((d) => choisi !== null && choixDemande(d).includes(choisi) && ['nouvelle', 'en_traitement', 'acceptee'].includes(d.statut))}
              fiches={fiches}
              peutModifier={peutModifier}
              executer={executer}
            />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Fiche du kiosque sélectionné ─────────────────────────

const champ =
  'w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'

function FicheKiosque({
  kiosque,
  demandes,
  fiches,
  peutModifier,
  executer,
}: {
  kiosque: Kiosque | null
  demandes: DemandeKiosque[]
  fiches: FicheLiee[]
  peutModifier: boolean
  executer: Executer
}) {
  // Kiosque libre : la fiche d'une demande acceptée pour ce kiosque est proposée d'office
  const acceptee = demandes.find((d) => d.statut === 'acceptee')
  const ficheInitiale = kiosque?.exhibitor_id ?? kiosque?.partner_id ?? (kiosque?.statut === 'disponible' ? acceptee?.fiche_exhibitor_id ?? acceptee?.fiche_partner_id : null) ?? ''
  const suggestion = kiosque?.statut === 'disponible' ? fiches.find((f) => f.id === ficheInitiale) : undefined
  const [ficheId, setFicheId] = useState(ficheInitiale)
  const [nom, setNom] = useState(kiosque?.organisation_affichee ?? suggestion?.nom ?? '')
  const [logo, setLogo] = useState(kiosque?.logo_url ?? suggestion?.logo ?? '')
  const [site, setSite] = useState(kiosque?.site_url ?? suggestion?.site ?? '')
  const [notes, setNotes] = useState(kiosque?.notes_internes ?? '')
  const [envoi, setEnvoi] = useState(false)

  const fiche = useMemo(() => fiches.find((f) => f.id === ficheId), [fiches, ficheId])

  if (!kiosque) {
    return (
      <aside className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
        Cliquez sur un kiosque du plan pour voir sa fiche, confirmer sa réservation ou le libérer.
      </aside>
    )
  }

  const reserve = kiosque.statut === 'reserve'

  function choisirFiche(id: string) {
    setFicheId(id)
    const f = fiches.find((x) => x.id === id)
    if (f) {
      setNom(f.nom)
      setLogo(f.logo ?? '')
      setSite(f.site ?? '')
    }
  }

  async function enregistrer() {
    if (!kiosque) return
    const donnees = {
      organisation_affichee: nom,
      logo_url: logo,
      site_url: site,
      notes_internes: notes,
      exhibitor_id: fiche?.type === 'exposant' ? fiche.id : null,
      partner_id: fiche?.type === 'partenaire' ? fiche.id : null,
    }
    if (!reserve && !window.confirm(`Confirmer la réservation du kiosque ${kiosque.numero} ? Il passera à « Indisponible » sur le site public.`)) return
    setEnvoi(true)
    await executer(
      () => (reserve ? modifierReservation(kiosque.numero, donnees) : confirmerReservation(kiosque.numero, donnees)),
      reserve ? `Kiosque ${kiosque.numero} mis à jour.` : `Kiosque ${kiosque.numero} réservé : il est maintenant indisponible sur le site.`
    )
    setEnvoi(false)
  }

  async function liberer() {
    if (!kiosque) return
    if (!window.confirm(`Libérer le kiosque ${kiosque.numero} ? Il redeviendra « Disponible » sur le site public.`)) return
    setEnvoi(true)
    await executer(() => libererKiosque(kiosque.numero), `Kiosque ${kiosque.numero} libéré.`)
    setEnvoi(false)
  }

  return (
    <aside className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Kiosque {kiosque.numero}</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            reserve ? 'bg-gray-700 text-gray-200' : 'bg-emerald-500/15 text-emerald-300'
          }`}
        >
          {reserve ? 'Réservé (Indisponible)' : 'Disponible'}
        </span>
      </div>

      {demandes.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <p className="font-semibold">Demandes en cours pour ce kiosque :</p>
          <ul className="mt-1 list-disc pl-4">
            {demandes.map((d) => (
              <li key={d.id}>
                {d.organisation} ({kiosque ? `${['1er', '2e', '3e'][choixDemande(d).indexOf(kiosque.numero)]} choix, ` : ''}
                {d.statut === 'acceptee' ? 'acceptée' : d.statut === 'en_traitement' ? 'en traitement' : 'nouvelle'})
              </li>
            ))}
          </ul>
        </div>
      )}

      {peutModifier ? (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-400">
            Fiche liée (reprend le nom, le logo et le site ; son numéro de kiosque suit le plan)
            <select value={ficheId} onChange={(e) => choisirFiche(e.target.value)} className={`${champ} mt-1`}>
              <option value="" className="bg-gray-900">Aucune</option>
              {fiches.map((f) => (
                <option key={f.id} value={f.id} className="bg-gray-900">{f.nom} · {f.detail}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-gray-400">
            Nom affiché sur le plan
            <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={150} className={`${champ} mt-1`} />
          </label>
          <label className="block text-xs font-medium text-gray-400">
            Logo (adresse https:// ou /images/exposants/...)
            <input value={logo} onChange={(e) => setLogo(e.target.value)} maxLength={500} className={`${champ} mt-1`} />
          </label>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Aperçu du logo" className="h-12 w-auto max-w-full rounded bg-white p-1 object-contain" />
          )}
          <label className="block text-xs font-medium text-gray-400">
            Site web (https://...)
            <input value={site} onChange={(e) => setSite(e.target.value)} maxLength={500} className={`${champ} mt-1`} />
          </label>
          <label className="block text-xs font-medium text-gray-400">
            Notes internes (jamais publiées)
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${champ} mt-1 resize-none`} />
          </label>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={envoi || !nom.trim()}
              onClick={enregistrer}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {reserve ? 'Enregistrer' : 'Confirmer la réservation'}
            </button>
            {reserve && (
              <button
                type="button"
                disabled={envoi}
                onClick={liberer}
                className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                Libérer le kiosque
              </button>
            )}
          </div>
        </div>
      ) : (
        <dl className="space-y-2 text-sm">
          <div><dt className="text-gray-500 text-xs">Nom affiché</dt><dd className="text-white">{kiosque.organisation_affichee ?? '-'}</dd></div>
          <div><dt className="text-gray-500 text-xs">Site</dt><dd className="text-white break-all">{kiosque.site_url ?? '-'}</dd></div>
          <p className="text-xs text-gray-500">Lecture seule : votre rôle ne permet pas de modifier les kiosques.</p>
        </dl>
      )}
    </aside>
  )
}
