import { createClient } from '@/lib/supabase/server'
import type { Partner } from '@/lib/supabase/types'

// ─── Mock data (dev sans Supabase) ────────────────────────

export const MOCK_ADMIN_PARTNERS: Partner[] = [
  {
    id: 'p1',
    company_name: 'Esri Canada',
    public_name: 'Esri Canada',
    partner_type: 'Gold',
    status: 'published',
    year: 2027,
    website_url: 'https://www.esri.ca',
    description_fr: 'Leader mondial des SIG et solutions géospatiales.',
    description_en: 'Global leader in GIS and geospatial solutions.',
    logo_url: null,
    logo_alt_text: 'Logo Esri Canada',
    public_visibility: true,
    display_order: 1,
    featured: true,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Marie Dupont',
    primary_contact_email: 'marie.dupont@esri.ca',
    primary_contact_phone: '514-555-0100',
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: null,
    communication_date: '2025-01-15',
    invoice_sent_date: '2025-02-01',
    payment_received_date: '2025-02-15',
    information_requested_date: '2025-01-20',
    follow_up_date: null,
    contract_url: null,
    invoice_url: null,
    payment_status: 'paid',
    internal_notes: 'Partenaire fidèle depuis 2023. Excellent suivi.',
    promo_code: 'ESRI2027',
    booth_number: null,
    booth_status: 'not_required',
    deliverables: 'Logo HD, description, URL',
    deadlines: '2027-09-01',
    logo_received: true,
    company_name_confirmed: true,
    description_received: true,
    internal_owner_name: 'Sophie Martin',
    internal_owner_email: 'sophie@example.com',
    committee_owner: 'Comité partenariats',
    last_updated_by: 'sophie@example.com',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-02-20T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'p2',
    company_name: 'Ville de Montréal',
    public_name: 'Ville de Montréal',
    partner_type: 'Gold',
    status: 'invoiced',
    year: 2027,
    website_url: 'https://montreal.ca',
    description_fr: 'La métropole du Québec, partenaire fondateur.',
    description_en: "Quebec's metropolis, founding partner.",
    logo_url: null,
    logo_alt_text: 'Logo Ville de Montréal',
    public_visibility: false,
    display_order: 2,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Jean Tremblay',
    primary_contact_email: 'j.tremblay@montreal.ca',
    primary_contact_phone: '514-555-0200',
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: 'Passer par le bureau des partenariats officiels.',
    communication_date: '2025-01-20',
    invoice_sent_date: '2025-03-01',
    payment_received_date: null,
    information_requested_date: '2025-02-01',
    follow_up_date: '2026-04-01',
    contract_url: null,
    invoice_url: null,
    payment_status: 'pending',
    internal_notes: "Attente d'approbation budget municipal.",
    promo_code: null,
    booth_number: null,
    booth_status: 'not_required',
    deliverables: 'Logo, bio',
    deadlines: '2027-09-15',
    logo_received: false,
    company_name_confirmed: true,
    description_received: false,
    internal_owner_name: 'Marc Bouchard',
    internal_owner_email: 'marc@example.com',
    committee_owner: 'Comité institutionnel',
    last_updated_by: 'marc@example.com',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-03-05T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'p3',
    company_name: 'Microsoft Canada',
    public_name: 'Microsoft',
    partner_type: 'Silver',
    status: 'ready_to_publish',
    year: 2027,
    website_url: 'https://microsoft.com/ca',
    description_fr: 'Technologies cloud et IA pour le géospatial.',
    description_en: 'Cloud and AI technologies for geospatial.',
    logo_url: null,
    logo_alt_text: 'Logo Microsoft',
    public_visibility: false,
    display_order: 3,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Lisa Wong',
    primary_contact_email: 'lwong@microsoft.com',
    primary_contact_phone: null,
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: null,
    communication_date: '2025-02-01',
    invoice_sent_date: '2025-02-15',
    payment_received_date: '2025-03-01',
    information_requested_date: '2025-02-10',
    follow_up_date: null,
    contract_url: null,
    invoice_url: null,
    payment_status: 'paid',
    internal_notes: null,
    promo_code: null,
    booth_number: null,
    booth_status: 'not_required',
    deliverables: 'Logo, bio',
    deadlines: '2027-09-01',
    logo_received: true,
    company_name_confirmed: true,
    description_received: true,
    internal_owner_name: 'Sophie Martin',
    internal_owner_email: 'sophie@example.com',
    committee_owner: 'Comité partenariats',
    last_updated_by: 'sophie@example.com',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-03-05T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'p4',
    company_name: 'MapGenie Technologies',
    public_name: 'MapGenie',
    partner_type: 'Bronze',
    status: 'assets_pending',
    year: 2027,
    website_url: 'https://mapgenie.io',
    description_fr: 'Solutions innovantes de cartographie en ligne.',
    description_en: 'Innovative online mapping solutions.',
    logo_url: null,
    logo_alt_text: null,
    public_visibility: false,
    display_order: 10,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Alexis Gagnon',
    primary_contact_email: 'alexis@mapgenie.io',
    primary_contact_phone: '438-555-0300',
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: null,
    communication_date: '2025-03-01',
    invoice_sent_date: '2025-03-15',
    payment_received_date: '2025-04-01',
    information_requested_date: '2025-03-20',
    follow_up_date: '2026-05-01',
    contract_url: null,
    invoice_url: null,
    payment_status: 'paid',
    internal_notes: 'Attente logo HD. À relancer.',
    promo_code: 'MAPGENIE27',
    booth_number: 'B-05',
    booth_status: 'assigned',
    deliverables: 'Logo HD manquant',
    deadlines: '2027-09-01',
    logo_received: false,
    company_name_confirmed: true,
    description_received: true,
    internal_owner_name: 'Marc Bouchard',
    internal_owner_email: 'marc@example.com',
    committee_owner: 'Comité exposants',
    last_updated_by: 'marc@example.com',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-04-10T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'p5',
    company_name: 'GeoAI Lab',
    public_name: 'GeoAI Lab',
    partner_type: 'Bronze',
    status: 'contacted',
    year: 2027,
    website_url: 'https://geoai.ca',
    description_fr: 'IA appliquée aux données géospatiales.',
    description_en: 'AI applied to geospatial data.',
    logo_url: null,
    logo_alt_text: null,
    public_visibility: false,
    display_order: 20,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Dr. Fatima Khalil',
    primary_contact_email: 'fkhalil@geoai.ca',
    primary_contact_phone: null,
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: 'Préférence pour les communications par email.',
    communication_date: '2025-04-01',
    invoice_sent_date: null,
    payment_received_date: null,
    information_requested_date: null,
    follow_up_date: '2026-06-15',
    contract_url: null,
    invoice_url: null,
    payment_status: 'unpaid',
    internal_notes: 'Intéressés mais budget à confirmer en juin.',
    promo_code: null,
    booth_number: null,
    booth_status: 'not_required',
    deliverables: null,
    deadlines: null,
    logo_received: false,
    company_name_confirmed: false,
    description_received: false,
    internal_owner_name: 'Sophie Martin',
    internal_owner_email: 'sophie@example.com',
    committee_owner: 'Comité partenariats',
    last_updated_by: 'sophie@example.com',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: '2025-04-05T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'p6',
    company_name: 'Ordre des géomètres-experts du Québec',
    public_name: 'OGEQ',
    partner_type: 'Networking',
    status: 'prospect',
    year: 2027,
    website_url: 'https://ogeq.qc.ca',
    description_fr: 'Organisation professionnelle des géomètres-experts du Québec.',
    description_en: 'Professional organization of Quebec land surveyors.',
    logo_url: null,
    logo_alt_text: null,
    public_visibility: false,
    display_order: 30,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: null,
    primary_contact_email: null,
    primary_contact_phone: null,
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: 'Trouver le bon contact via leur site web.',
    communication_date: null,
    invoice_sent_date: null,
    payment_received_date: null,
    information_requested_date: null,
    follow_up_date: '2026-07-01',
    contract_url: null,
    invoice_url: null,
    payment_status: 'unpaid',
    internal_notes: 'Prospect identifié lors de GÉOMTL 2025.',
    promo_code: null,
    booth_number: null,
    booth_status: 'not_required',
    deliverables: null,
    deadlines: null,
    logo_received: false,
    company_name_confirmed: false,
    description_received: false,
    internal_owner_name: 'Marc Bouchard',
    internal_owner_email: 'marc@example.com',
    committee_owner: 'Comité institutionnel',
    last_updated_by: 'marc@example.com',
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-05-01T00:00:00Z',
    archived_at: null,
  },
]

// ─── Data fetching (Server Components) ────────────────────

// Fiches archivées, pour pouvoir les restaurer depuis la liste
export async function getArchivedPartners(): Promise<Partner[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false })

  if (error) {
    console.error('[getArchivedPartners]', error.message)
    return []
  }

  return (data ?? []) as Partner[]
}

export async function getPartners(): Promise<Partner[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_ADMIN_PARTNERS
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .is('archived_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[getPartners]', error.message)
    return []
  }

  return (data ?? []) as Partner[]
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_ADMIN_PARTNERS.find((p) => p.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getPartnerById]', error.message)
    return null
  }

  return data as Partner
}
