'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ETIQUETTE_KIOSQUES } from '@/lib/data/kiosques'
import { exigerAdmin, exigerEditeur } from '@/lib/auth/droits'
import { EVENT_CONFIG } from '@/data/config'
import { choixDemande, dateFinConservation } from '@/lib/demandes-kiosques'
import type { NiveauDemande, PartnerType, StatutDemande } from '@/lib/supabase/types'

// Actions de l'admin sur les kiosques et les demandes de réservation.
// Elles passent par la session de l'utilisateur : la RLS (migration V007)
// limite déjà les écritures aux rôles admin et editor, et chaque action
// revérifie le rôle avant d'agir. Un kiosque ne passe à « reserve » que par
// confirmerReservation, jamais par une demande.

const MOCK_MSG = 'Supabase non configuré - modifications non persistées en mode mock.'

type Resultat = { error?: string; avertissement?: string }

// Le plan public et l'admin se mettent à jour tout de suite
function rafraichir() {
  revalidateTag(ETIQUETTE_KIOSQUES)
  revalidatePath('/fr/devenir-partenaire')
  revalidatePath('/en/devenir-partenaire')
  revalidatePath('/admin/organisations')
  revalidatePath('/admin', 'layout')
}

// Adresse de logo ou de site : https, ou chemin du site (/images/...)
function urlSure(valeur: string | null | undefined): string | null | false {
  const v = (valeur ?? '').trim()
  if (!v) return null
  if (v.length > 500) return false
  if (v.startsWith('/') && !v.startsWith('//')) return v
  try {
    const u = new URL(v)
    return u.protocol === 'https:' ? u.toString() : false
  } catch {
    return false
  }
}

// ─── Demandes ─────────────────────────────────────────────

const STATUTS_MANUELS: StatutDemande[] = ['nouvelle', 'en_traitement', 'refusee', 'archivee', 'spam']

export async function changerStatutDemande(id: string, statut: StatutDemande): Promise<Resultat> {
  const check = await exigerEditeur()
  if (check.error) return check
  if (!STATUTS_MANUELS.includes(statut)) return { error: 'Statut invalide.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('demandes_kiosques')
    .update({ statut, traite_par: check.userId, traite_le: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  rafraichir()
  return {}
}

export async function enregistrerNotesDemande(id: string, notes: string): Promise<Resultat> {
  const check = await exigerEditeur()
  if (check.error) return check
  const supabase = await createClient()
  const { error } = await supabase
    .from('demandes_kiosques')
    .update({ notes_internes: notes.slice(0, 5000) || null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/organisations')
  return {}
}

const TYPE_PARTENAIRE: Partial<Record<NiveauDemande, PartnerType>> = {
  or: 'Gold',
  argent: 'Silver',
  bronze: 'Bronze',
  soiree: 'Networking',
}

// Accepter : crée la fiche exposant ou partenaire préremplie et la relie à la
// demande. Le kiosque reste disponible en public jusqu'à confirmerReservation.
// La fiche reprend le premier choix encore libre. La commandite de la soirée n'est
// liée à aucun kiosque, sauf si un numéro a été demandé.
export async function accepterDemande(id: string, niveau: Exclude<NiveauDemande, 'a_determiner'>): Promise<Resultat> {
  const check = await exigerEditeur()
  if (check.error) return check

  const supabase = await createClient()
  const { data: demande, error: erreurLecture } = await supabase
    .from('demandes_kiosques')
    .select('*')
    .eq('id', id)
    .single()
  if (erreurLecture || !demande) return { error: erreurLecture?.message ?? 'Demande introuvable.' }
  if (demande.fiche_exhibitor_id || demande.fiche_partner_id) return { error: 'Cette demande a déjà une fiche.' }

  const date = new Date(demande.created_at).toLocaleDateString('fr-CA')
  const choix = choixDemande(demande)
  const { data: libres, error: erreurLibres } = choix.length
    ? await supabase.from('kiosques').select('numero').in('numero', choix).eq('statut', 'disponible')
    : { data: [] as { numero: number }[], error: null }
  if (erreurLibres) return { error: erreurLibres.message }
  const memePersonne = demande.kiosque_courriel === demande.principal_courriel
  const commun = {
    company_name: demande.organisation,
    company_address: demande.organisation_adresse ?? null,
    company_phone: demande.organisation_telephone ?? null,
    primary_contact_name: demande.principal_nom,
    primary_contact_email: demande.principal_courriel,
    primary_contact_phone: demande.principal_telephone,
    // Fiche : contact principal = responsable de la facturation, contact secondaire =
    // responsable du kiosque sur place (pas de champ téléphone secondaire : il va dans les notes)
    secondary_contact_name: demande.kiosque_nom,
    secondary_contact_email: demande.kiosque_courriel,
    notes_contact: [
      memePersonne ? null : `Téléphone du responsable du kiosque sur place : ${demande.kiosque_telephone}`,
      demande.message,
    ].filter(Boolean).join('\n\n') || null,
    status: 'contacted',
    year: 2027,
    internal_notes: `Créée depuis la demande du site reçue le ${date} (${choix.length ? `${choix.length > 1 ? 'kiosques souhaités' : 'kiosque souhaité'} : ${choix.join(', ')}` : 'sans préférence de kiosque'}).`,
  }
  const table = niveau === 'exposant' ? 'exhibitors' : 'partners'
  const extra = niveau === 'exposant' ? {} : { partner_type: TYPE_PARTENAIRE[niveau] }
  const sansKiosque = niveau === 'soiree' ? 'not_required' : 'to_assign'

  const creer = (numero: number | null, statutKiosque: string) =>
    supabase
      .from(table)
      .insert({ ...commun, ...extra, booth_number: numero === null ? null : String(numero), booth_status: statutKiosque })
      .select('id')
      .single()

  // Le numéro de kiosque est unique par année : un choix déjà attribué à une
  // autre fiche passe au suivant. S'il n'en reste aucun, la fiche est créée
  // sans numéro, à attribuer ensuite.
  let avertissement: string | undefined
  let creation: Awaited<ReturnType<typeof creer>> | null = null
  let attribue: number | null = null
  for (const numero of choix.filter((n) => libres?.some((k) => k.numero === n))) {
    creation = await creer(numero, 'assigned')
    if (creation.error?.code === '23505') continue
    attribue = numero
    break
  }
  if (attribue === null) {
    if (choix.length) avertissement = `Aucun des kiosques demandés (${choix.join(', ')}) n'est libre : la fiche est créée sans numéro de kiosque.`
    creation = await creer(null, choix.length ? 'to_assign' : sansKiosque)
  } else if (attribue !== choix[0]) {
    avertissement = `Le 1er choix n'est plus libre : la fiche indique le kiosque ${attribue}.`
  }
  if (!creation || creation.error || !creation.data) return { error: creation?.error?.message ?? 'Création de la fiche impossible.' }

  const { error } = await supabase
    .from('demandes_kiosques')
    .update({
      statut: 'acceptee',
      traite_par: check.userId,
      traite_le: new Date().toISOString(),
      fiche_exhibitor_id: niveau === 'exposant' ? creation.data.id : null,
      fiche_partner_id: niveau === 'exposant' ? null : creation.data.id,
    })
    .eq('id', id)
  if (error) return { error: error.message }

  rafraichir()
  return { avertissement }
}

// ─── Kiosques ─────────────────────────────────────────────

export interface DonneesReservation {
  organisation_affichee: string
  logo_url?: string | null
  site_url?: string | null
  exhibitor_id?: string | null
  partner_id?: string | null
  notes_internes?: string | null
}

function preparer(d: DonneesReservation) {
  const nom = d.organisation_affichee.trim().slice(0, 150)
  const logo = urlSure(d.logo_url)
  const site = urlSure(d.site_url)
  if (!nom) return { error: 'Le nom affiché est requis.' }
  if (logo === false) return { error: 'Adresse du logo invalide (https:// ou /images/...).' }
  if (site === false) return { error: 'Adresse du site invalide (https://...).' }
  return {
    valeurs: {
      organisation_affichee: nom,
      logo_url: logo,
      site_url: site,
      exhibitor_id: d.exhibitor_id || null,
      partner_id: d.partner_id || null,
      notes_internes: d.notes_internes?.slice(0, 5000) || null,
    },
  }
}

// Le seul passage à « Indisponible ». Écriture atomique : si le kiosque
// n'est plus disponible (autre membre du comité plus rapide), rien ne change.
// Le plan fait foi : confirmer, modifier ou libérer un kiosque met à jour le numéro
// de la fiche liée. Un échec ici n'annule pas la réservation : il est signalé.
type FicheDuKiosque = { exhibitor_id: string | null; partner_id: string | null }

function ficheDuKiosque(k: FicheDuKiosque) {
  if (k.exhibitor_id) return { table: 'exhibitors', id: k.exhibitor_id }
  if (k.partner_id) return { table: 'partners', id: k.partner_id }
  return null
}

async function inscrireSurFiche(supabase: Awaited<ReturnType<typeof createClient>>, numero: number, k: FicheDuKiosque): Promise<string | undefined> {
  const fiche = ficheDuKiosque(k)
  if (!fiche) return undefined
  const { error } = await supabase.from(fiche.table).update({ booth_number: String(numero), booth_status: 'confirmed' }).eq('id', fiche.id)
  if (error?.code === '23505') return `Kiosque ${numero} enregistré, mais ce numéro figure déjà sur une autre fiche : corrigez les fiches.`
  if (error) return `Kiosque ${numero} enregistré, mais la fiche liée n'a pas été mise à jour : ${error.message}`
  return undefined
}

async function retirerDeFiche(supabase: Awaited<ReturnType<typeof createClient>>, numero: number, k: FicheDuKiosque): Promise<string | undefined> {
  const fiche = ficheDuKiosque(k)
  if (!fiche) return undefined
  const { error } = await supabase
    .from(fiche.table)
    .update({ booth_number: null, booth_status: 'to_assign' })
    .eq('id', fiche.id)
    .eq('booth_number', String(numero))
  if (error) return `Kiosque ${numero} mis à jour, mais l'ancienne fiche liée n'a pas été modifiée : ${error.message}`
  return undefined
}

export async function confirmerReservation(numero: number, donnees: DonneesReservation): Promise<Resultat> {
  const check = await exigerEditeur()
  if (check.error) return check
  const p = preparer(donnees)
  if ('error' in p) return { error: p.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kiosques')
    .update({ ...p.valeurs, statut: 'reserve', updated_by: check.userId })
    .eq('numero', numero)
    .eq('statut', 'disponible')
    .select('numero')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: `Le kiosque ${numero} n'est plus disponible : il vient d'être réservé.` }
  const avertissement = await inscrireSurFiche(supabase, numero, p.valeurs)
  rafraichir()
  return { avertissement }
}

// Modifier le nom, le logo ou le lien d'un kiosque déjà réservé
export async function modifierReservation(numero: number, donnees: DonneesReservation): Promise<Resultat> {
  const check = await exigerEditeur()
  if (check.error) return check
  const p = preparer(donnees)
  if ('error' in p) return { error: p.error }

  const supabase = await createClient()
  const { data: avant } = await supabase.from('kiosques').select('exhibitor_id, partner_id').eq('numero', numero).single()
  const { data, error } = await supabase
    .from('kiosques')
    .update({ ...p.valeurs, updated_by: check.userId })
    .eq('numero', numero)
    .eq('statut', 'reserve')
    .select('numero')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: `Le kiosque ${numero} n'est pas réservé.` }
  const change = avant && (avant.exhibitor_id !== p.valeurs.exhibitor_id || avant.partner_id !== p.valeurs.partner_id)
  const retrait = change ? await retirerDeFiche(supabase, numero, avant) : undefined
  const inscription = await inscrireSurFiche(supabase, numero, p.valeurs)
  rafraichir()
  return { avertissement: inscription ?? retrait }
}

export async function libererKiosque(numero: number): Promise<Resultat> {
  const check = await exigerEditeur()
  if (check.error) return check

  const supabase = await createClient()
  const { data: avant } = await supabase.from('kiosques').select('exhibitor_id, partner_id').eq('numero', numero).single()
  const { error } = await supabase
    .from('kiosques')
    .update({
      statut: 'disponible',
      organisation_affichee: null,
      logo_url: null,
      site_url: null,
      exhibitor_id: null,
      partner_id: null,
      updated_by: check.userId,
    })
    .eq('numero', numero)
  if (error) return { error: error.message }
  const avertissement = avant ? await retirerDeFiche(supabase, numero, avant) : undefined
  rafraichir()
  return { avertissement }
}

// ─── Conservation ─────────────────────────────────────────

// Politique de confidentialité : les demandes sont gardées jusqu'à 6 mois après
// l'événement. Efface toutes les demandes ; les fiches créées ne sont pas touchées.
export async function effacerDemandes(): Promise<Resultat & { nombre?: number }> {
  const check = await exigerAdmin()
  if (check.error) return check
  if (new Date() < dateFinConservation(EVENT_CONFIG.datesEvenement.fin)) {
    return { error: 'La période de conservation des demandes n\'est pas terminée.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('demandes_kiosques').delete().not('id', 'is', null).select('id')
  if (error) return { error: error.message }
  rafraichir()
  return { nombre: data?.length ?? 0 }
}
