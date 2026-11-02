import { getDemandesKiosques, getKiosquesAdmin } from '@/lib/data/kiosques'
import { getArchivedExhibitors, getExhibitors } from '@/lib/data/exhibitors'
import { getArchivedPartners, getPartners } from '@/lib/data/partners'
import { peutEditer, sessionCourante } from '@/lib/auth/droits'
import { LIBELLES_TYPES_PARTENAIRE } from '@/lib/partenaires'
import {
  AdminOrganisationsPage,
  type FicheLiee,
  type Onglet,
} from '@/components/admin/organisations/AdminOrganisationsPage'

const ONGLETS: Onglet[] = ['demandes', 'organisations', 'plan']

export const metadata = {
  title: 'Partenaires et exposants - Admin GÉOMTL',
}

export const dynamic = 'force-dynamic'

export default async function OrganisationsPage(
  props: {
    searchParams: Promise<{ onglet?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const [kiosques, demandes, exhibitors, partners, partnersArchives, exhibitorsArchives, { role }] = await Promise.all([
    getKiosquesAdmin(),
    getDemandesKiosques(),
    getExhibitors(),
    getPartners(),
    getArchivedPartners(),
    getArchivedExhibitors(),
    sessionCourante(),
  ])

  // Fiches qu'on peut relier à un kiosque réservé (nom, logo et site repris)
  const fiches: FicheLiee[] = [
    ...exhibitors.map((e) => ({ id: e.id, type: 'exposant' as const, nom: e.public_name || e.company_name, logo: e.logo_url, site: e.website_url, detail: 'Exposant' })),
    ...partners.map((p) => ({ id: p.id, type: 'partenaire' as const, nom: p.public_name || p.company_name, logo: p.logo_url, site: p.website_url, detail: `Partenaire ${LIBELLES_TYPES_PARTENAIRE[p.partner_type] ?? p.partner_type}` })),
  ].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

  // Sans onglet demandé : les nouvelles demandes d'abord, sinon la liste
  const nouvelles = demandes.some((d) => d.statut === 'nouvelle')
  const onglet: Onglet = ONGLETS.includes(searchParams.onglet as Onglet)
    ? (searchParams.onglet as Onglet)
    : nouvelles ? 'demandes' : 'organisations'

  return (
    <AdminOrganisationsPage
      ongletInitial={onglet}
      kiosques={kiosques}
      demandes={demandes}
      partners={partners}
      exhibitors={exhibitors}
      fiches={fiches}
      partnersArchives={partnersArchives}
      exhibitorsArchives={exhibitorsArchives}
      peutModifier={peutEditer(role)}
      peutSupprimer={role === 'admin'}
    />
  )
}
