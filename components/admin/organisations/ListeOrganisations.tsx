'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Exhibitor, Partner, PartnerStatus, PartnerType, PaymentStatus } from '@/lib/supabase/types'
import { TYPES_PARTENAIRE } from '@/lib/partenaires'
import {
  ExposantBadge,
  PartnerStatusBadge,
  PartnerTypeBadge,
  PaymentStatusBadge,
} from '@/components/admin/partners/PartnerStatusBadge'
import {
  archivePartner,
  deletePartner,
  markLogoReceived,
  restorePartner,
  togglePartnerVisibility,
  updatePaymentStatus,
} from '@/lib/actions/partners'
import {
  archiveExhibitor,
  deleteExhibitor,
  markExhibitorLogoReceived,
  restoreExhibitor,
  toggleExhibitorVisibility,
  updateExhibitorPaymentStatus,
} from '@/lib/actions/exhibitors'
import type { Executer } from './AdminOrganisationsPage'

// Partenaires et exposants vivent dans deux tables ; on les affiche ici
// dans une seule liste, et chaque ligne garde ses propres actions.

type Genre = 'partenaire' | 'exposant'
type Niveau = PartnerType | 'exposant'

type Ligne = {
  id: string
  genre: Genre
  societe: string
  nomPublic: string | null
  niveau: Niveau
  statut: PartnerStatus
  paiement: PaymentStatus
  kiosque: string | null
  kiosqueAAttribuer: boolean
  logoRecu: boolean
  visible: boolean
  relance: string | null
  contact: string | null
  courriel: string | null
  responsable: string | null
  incomplete: boolean
}

const ORDRE_NIVEAU: Record<Niveau, number> = { Gold: 0, Silver: 1, Bronze: 2, Networking: 3, exposant: 4 }
const CONFIRMES = new Set<PartnerStatus>(['confirmed', 'invoiced', 'paid', 'assets_pending', 'ready_to_publish', 'published'])
const A_COMPLETER = new Set<PartnerStatus>(['confirmed', 'invoiced', 'paid', 'assets_pending'])

const STATUTS: { value: PartnerStatus; label: string }[] = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'invoiced', label: 'Facturé' },
  { value: 'paid', label: 'Payé' },
  { value: 'assets_pending', label: 'Actifs manquants' },
  { value: 'ready_to_publish', label: 'Prêt à publier' },
  { value: 'published', label: 'Publié' },
  { value: 'cancelled', label: 'Annulé' },
]

const PAIEMENTS: { value: PaymentStatus; label: string }[] = [
  { value: 'unpaid', label: 'Impayé' },
  { value: 'pending', label: 'En cours' },
  { value: 'paid', label: 'Payé' },
  { value: 'cancelled', label: 'Annulé' },
]

const ACTIONS: Record<Genre, {
  modifier: (id: string) => string
  visibilite: (id: string, visible: boolean) => Promise<{ error?: string }>
  payer: (id: string) => Promise<{ error?: string }>
  logo: (id: string, recu: boolean) => Promise<{ error?: string }>
  archiver: (id: string) => Promise<{ error?: string }>
  supprimer: (id: string) => Promise<{ error?: string }>
}> = {
  partenaire: {
    modifier: (id) => `/admin/partners/${id}/edit`,
    visibilite: togglePartnerVisibility,
    payer: (id) => updatePaymentStatus(id, 'paid'),
    logo: markLogoReceived,
    archiver: archivePartner,
    supprimer: deletePartner,
  },
  exposant: {
    modifier: (id) => `/admin/exhibitors/${id}/edit`,
    visibilite: toggleExhibitorVisibility,
    payer: (id) => updateExhibitorPaymentStatus(id, 'paid'),
    logo: markExhibitorLogoReceived,
    archiver: archiveExhibitor,
    supprimer: deleteExhibitor,
  },
}

function versLignes(partners: Partner[], exhibitors: Exhibitor[]): Ligne[] {
  const commun = (o: Partner | Exhibitor) => ({
    id: o.id,
    societe: o.company_name,
    nomPublic: o.public_name && o.public_name !== o.company_name ? o.public_name : null,
    statut: o.status,
    paiement: o.payment_status,
    kiosque: o.booth_number,
    kiosqueAAttribuer: o.booth_status === 'to_assign',
    logoRecu: o.logo_received,
    visible: o.public_visibility,
    relance: o.follow_up_date,
    contact: o.primary_contact_name,
    courriel: o.primary_contact_email,
    responsable: o.internal_owner_name,
    incomplete: A_COMPLETER.has(o.status) && (!o.logo_received || !o.description_received || !o.company_name_confirmed),
  })
  return [
    ...partners.map((p) => ({ ...commun(p), genre: 'partenaire' as const, niveau: p.partner_type })),
    ...exhibitors.map((e) => ({ ...commun(e), genre: 'exposant' as const, niveau: 'exposant' as const })),
  ]
}

type FiltreNiveau = '' | 'partenaires' | Niveau
type Tri = 'nom' | 'niveau' | 'statut' | 'relance'

const selectClass =
  'bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500'

export function ListeOrganisations({
  partners,
  exhibitors,
  partnersArchives,
  exhibitorsArchives,
  peutModifier,
  peutSupprimer,
  executer,
}: {
  partners: Partner[]
  exhibitors: Exhibitor[]
  partnersArchives: Partner[]
  exhibitorsArchives: Exhibitor[]
  peutModifier: boolean
  peutSupprimer: boolean
  executer: Executer
}) {
  const [recherche, setRecherche] = useState('')
  const [niveau, setNiveau] = useState<FiltreNiveau>('')
  const [statut, setStatut] = useState<PartnerStatus | ''>('')
  const [paiement, setPaiement] = useState<PaymentStatus | ''>('')
  const [publie, setPublie] = useState<'' | 'oui' | 'non'>('')
  const [responsable, setResponsable] = useState('')
  const [tri, setTri] = useState<{ champ: Tri; sens: 1 | -1 }>({ champ: 'niveau', sens: 1 })
  const [enCours, setEnCours] = useState<string | null>(null)
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null)

  const lignes = useMemo(() => versLignes(partners, exhibitors), [partners, exhibitors])
  const responsables = useMemo(
    () => Array.from(new Set(lignes.map((l) => l.responsable).filter(Boolean) as string[])).sort(),
    [lignes]
  )

  const aujourdhui = new Date()
  aujourdhui.setHours(0, 0, 0, 0)
  const enRetard = (l: Ligne) => !!l.relance && new Date(l.relance) <= aujourdhui && l.statut !== 'cancelled'

  const actives = lignes.filter((l) => l.statut !== 'cancelled')
  const stats = [
    { libelle: 'Fiches', valeur: actives.length, alerte: false },
    { libelle: 'Confirmées', valeur: actives.filter((l) => CONFIRMES.has(l.statut)).length, alerte: false },
    { libelle: 'Payées', valeur: actives.filter((l) => l.paiement === 'paid').length, alerte: false },
    { libelle: 'À relancer', valeur: actives.filter(enRetard).length, alerte: true },
    { libelle: 'Logos manquants', valeur: actives.filter((l) => !l.logoRecu && CONFIRMES.has(l.statut)).length, alerte: true },
    { libelle: 'Kiosques à attribuer', valeur: actives.filter((l) => l.kiosqueAAttribuer).length, alerte: true },
    { libelle: 'Prêtes, non publiées', valeur: actives.filter((l) => l.statut === 'ready_to_publish' && !l.visible).length, alerte: true },
  ]

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    const resultat = lignes.filter((l) => {
      if (q && ![l.societe, l.nomPublic, l.contact, l.courriel].some((v) => v?.toLowerCase().includes(q))) return false
      if (niveau === 'partenaires' ? l.genre !== 'partenaire' : niveau && l.niveau !== niveau) return false
      if (statut && l.statut !== statut) return false
      if (paiement && l.paiement !== paiement) return false
      if (publie && l.visible !== (publie === 'oui')) return false
      if (responsable && l.responsable !== responsable) return false
      return true
    })
    const parNom = (a: Ligne, b: Ligne) => a.societe.localeCompare(b.societe, 'fr')
    return resultat.sort((a, b) => {
      let ecart = 0
      if (tri.champ === 'niveau') ecart = ORDRE_NIVEAU[a.niveau] - ORDRE_NIVEAU[b.niveau]
      else if (tri.champ === 'statut') ecart = a.statut.localeCompare(b.statut)
      else if (tri.champ === 'relance') ecart = (a.relance ?? '9999').localeCompare(b.relance ?? '9999')
      return (ecart || parNom(a, b)) * tri.sens
    })
  }, [lignes, recherche, niveau, statut, paiement, publie, responsable, tri])

  const filtresActifs = !!(recherche || niveau || statut || paiement || publie || responsable)

  function effacer() {
    setRecherche('')
    setNiveau('')
    setStatut('')
    setPaiement('')
    setPublie('')
    setResponsable('')
  }

  function trier(champ: Tri) {
    setTri((t) => ({ champ, sens: t.champ === champ ? (t.sens === 1 ? -1 : 1) : 1 }))
  }

  async function agir(id: string, fn: () => Promise<{ error?: string }>, succes?: string) {
    setMenuOuvert(null)
    setEnCours(id)
    await executer(fn, succes)
    setEnCours(null)
  }

  return (
    <div>
      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <div key={s.libelle} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
            <div className={`text-xl font-bold tabular-nums ${s.valeur === 0 ? 'text-gray-600' : s.alerte ? 'text-amber-400' : 'text-white'}`}>
              {s.valeur}
            </div>
            <div className="text-xs leading-tight text-gray-500">{s.libelle}</div>
          </div>
        ))}
      </div>

      {/* Recherche, filtres et création */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Rechercher par nom, contact, courriel…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="min-w-[14rem] flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <select aria-label="Niveau" className={selectClass} value={niveau} onChange={(e) => setNiveau(e.target.value as FiltreNiveau)}>
          <option value="">Tous les niveaux</option>
          <option value="partenaires">Tous les partenaires</option>
          {TYPES_PARTENAIRE.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          <option value="exposant">Exposants</option>
        </select>
        <select aria-label="Statut" className={selectClass} value={statut} onChange={(e) => setStatut(e.target.value as PartnerStatus | '')}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select aria-label="Paiement" className={selectClass} value={paiement} onChange={(e) => setPaiement(e.target.value as PaymentStatus | '')}>
          <option value="">Tous les paiements</option>
          {PAIEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select aria-label="Publication" className={selectClass} value={publie} onChange={(e) => setPublie(e.target.value as '' | 'oui' | 'non')}>
          <option value="">Publiées ou non</option>
          <option value="oui">Publiées</option>
          <option value="non">Non publiées</option>
        </select>
        {responsables.length > 0 && (
          <select aria-label="Responsable" className={selectClass} value={responsable} onChange={(e) => setResponsable(e.target.value)}>
            <option value="">Tous les responsables</option>
            {responsables.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
        {filtresActifs && (
          <button onClick={effacer} className="px-2 py-1.5 text-xs text-gray-500 transition-colors hover:text-white">
            Effacer
          </button>
        )}
        {peutModifier && (
          <div className="ml-auto flex gap-2">
            <Link href="/admin/partners/new" className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600">
              + Partenaire
            </Link>
            <Link href="/admin/exhibitors/new" className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600">
              + Exposant
            </Link>
          </div>
        )}
      </div>

      {/* Nombre et tri */}
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          {filtrees.length} fiche{filtrees.length > 1 ? 's' : ''}
          {filtrees.length !== lignes.length ? ` sur ${lignes.length}` : ''}
        </span>
        <div className="flex items-center gap-2">
          Trier par
          {([['niveau', 'Niveau'], ['nom', 'Nom'], ['statut', 'Statut'], ['relance', 'Relance']] as [Tri, string][]).map(([champ, libelle]) => (
            <button
              key={champ}
              onClick={() => trier(champ)}
              className={`rounded px-2 py-0.5 transition-colors ${tri.champ === champ ? 'bg-rose-500/10 text-rose-400' : 'hover:text-white'}`}
            >
              {libelle}
              {tri.champ === champ && (tri.sens === 1 ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {filtrees.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center text-sm text-gray-500">
          Aucune fiche ne correspond à ces filtres.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 text-left font-medium">Organisation</th>
                <th className="px-4 py-3 text-left font-medium">Niveau</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
                <th className="px-4 py-3 text-left font-medium">Paiement</th>
                <th className="px-4 py-3 text-left font-medium">Kiosque</th>
                <th className="px-4 py-3 text-center font-medium">Logo</th>
                <th className="px-4 py-3 text-center font-medium">Publiée</th>
                <th className="px-4 py-3 text-left font-medium">Relance</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtrees.map((l) => {
                const a = ACTIONS[l.genre]
                const cle = `${l.genre}-${l.id}`
                const retard = enRetard(l)
                return (
                  <tr key={cle} className={`transition-colors ${enCours === l.id ? 'opacity-50' : 'hover:bg-gray-800/30'}`}>
                    <td className="px-4 py-3">
                      <Link href={a.modifier(l.id)} className="font-medium text-white transition-colors hover:text-rose-400">
                        {l.societe}
                      </Link>
                      {l.nomPublic && <div className="text-xs text-gray-500">{l.nomPublic}</div>}
                      {l.contact && <div className="max-w-[16rem] truncate text-xs text-gray-500">{l.contact}{l.courriel ? ` · ${l.courriel}` : ''}</div>}
                      {l.incomplete && <div className="text-xs text-orange-400">Fiche incomplète</div>}
                    </td>
                    <td className="px-4 py-3">
                      {l.niveau === 'exposant' ? <ExposantBadge /> : <PartnerTypeBadge type={l.niveau} />}
                    </td>
                    <td className="px-4 py-3"><PartnerStatusBadge status={l.statut} /></td>
                    <td className="px-4 py-3"><PaymentStatusBadge status={l.paiement} /></td>
                    <td className="px-4 py-3">
                      {l.kiosque ? (
                        <span className="font-mono text-xs text-white">{l.kiosque}</span>
                      ) : l.kiosqueAAttribuer ? (
                        <span className="text-xs text-orange-300">À attribuer</span>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => agir(l.id, () => a.logo(l.id, !l.logoRecu))}
                        disabled={!peutModifier || enCours === l.id}
                        title={l.logoRecu ? 'Logo reçu' : 'Logo manquant'}
                        aria-label={l.logoRecu ? 'Logo reçu' : 'Logo manquant'}
                        className="text-lg disabled:cursor-default"
                      >
                        {l.logoRecu ? <span className="text-emerald-400">✓</span> : <span className="text-gray-600">○</span>}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => agir(l.id, () => a.visibilite(l.id, !l.visible))}
                        disabled={!peutModifier || enCours === l.id}
                        role="switch"
                        aria-checked={l.visible}
                        aria-label={l.visible ? 'Publiée sur le site' : 'Non publiée'}
                        className={`relative h-4 w-8 rounded-full transition-colors disabled:cursor-default ${l.visible ? 'bg-rose-500' : 'bg-gray-700'}`}
                      >
                        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${l.visible ? 'left-[1.125rem]' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {l.relance ? (
                        <span className={`text-xs ${retard ? 'font-medium text-red-400' : 'text-gray-400'}`}>
                          {retard && '⚠ '}
                          {new Date(l.relance).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>
                    <td className="relative px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={a.modifier(l.id)} className="rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-700 hover:text-white">
                          {peutModifier ? 'Modifier' : 'Voir'}
                        </Link>
                        {peutModifier && (
                          <div className="relative">
                            <button
                              onClick={() => setMenuOuvert(menuOuvert === cle ? null : cle)}
                              disabled={enCours === l.id}
                              aria-label={`Autres actions pour ${l.societe}`}
                              className="rounded px-1.5 py-1 text-gray-500 transition-colors hover:bg-gray-700 hover:text-white"
                            >
                              ···
                            </button>
                            {menuOuvert === cle && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setMenuOuvert(null)} />
                                <div className="absolute bottom-full right-0 z-40 mb-1 w-44 rounded-xl border border-gray-700 bg-gray-800 py-1 text-left shadow-xl">
                                  <button onClick={() => agir(l.id, () => a.payer(l.id))} className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-700 hover:text-white">
                                    Marquer payé
                                  </button>
                                  <div className="my-1 border-t border-gray-700" />
                                  <button
                                    onClick={() => confirm(`Archiver ${l.societe} ?`) ? agir(l.id, () => a.archiver(l.id), `${l.societe} archivé.`) : setMenuOuvert(null)}
                                    className="w-full px-3 py-2 text-left text-xs text-amber-400 hover:bg-gray-700"
                                  >
                                    Archiver
                                  </button>
                                  {peutSupprimer && (
                                    <button
                                      onClick={() => confirm(`Supprimer définitivement ${l.societe} ?`) ? agir(l.id, () => a.supprimer(l.id), `${l.societe} supprimé.`) : setMenuOuvert(null)}
                                      className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-gray-700"
                                    >
                                      Supprimer
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Fiches archivées : hors de la liste et des compteurs, restaurables */}
      {partnersArchives.length + exhibitorsArchives.length > 0 && (
        <details className="mt-6 rounded-xl border border-gray-800 bg-gray-900/50">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-300">
            Fiches archivées ({partnersArchives.length + exhibitorsArchives.length})
          </summary>
          <ul className="divide-y divide-gray-800/60 border-t border-gray-800">
            {[
              ...partnersArchives.map((p) => ({ fiche: p, genre: 'partenaire' as const, restaurer: restorePartner, supprimer: deletePartner })),
              ...exhibitorsArchives.map((e) => ({ fiche: e, genre: 'exposant' as const, restaurer: restoreExhibitor, supprimer: deleteExhibitor })),
            ].map(({ fiche, genre, restaurer, supprimer }) => (
              <li key={`${genre}-${fiche.id}`} className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm ${enCours === fiche.id ? 'opacity-50' : ''}`}>
                <span className="text-white">
                  {fiche.company_name}
                  <span className="ml-2 text-xs text-gray-500">
                    {genre === 'exposant' ? 'Exposant' : 'Partenaire'}
                    {fiche.archived_at ? ` · archivée le ${new Date(fiche.archived_at).toLocaleDateString('fr-CA')}` : ''}
                  </span>
                </span>
                {peutModifier && (
                  <span className="flex gap-1">
                    <button
                      onClick={() => agir(fiche.id, () => restaurer(fiche.id), `${fiche.company_name} restaurée.`)}
                      disabled={enCours === fiche.id}
                      className="rounded px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                    >
                      Restaurer
                    </button>
                    {peutSupprimer && (
                      <button
                        onClick={() => { if (confirm(`Supprimer définitivement ${fiche.company_name} ?`)) agir(fiche.id, () => supprimer(fiche.id), `${fiche.company_name} supprimée.`) }}
                        disabled={enCours === fiche.id}
                        className="rounded px-2 py-1 text-xs text-red-400 transition-colors hover:bg-gray-700"
                      >
                        Supprimer
                      </button>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
