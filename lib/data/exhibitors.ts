import { createClient } from '@/lib/supabase/server'
import type { Exhibitor } from '@/lib/supabase/types'

// ─── Mock data (dev sans Supabase) ────────────────────────

export const MOCK_ADMIN_EXHIBITORS: Exhibitor[] = [
  {
    id: 'e1',
    company_name: 'CartoCraft Solutions',
    public_name: 'CartoCraft',
    sector: 'Cartographie',
    year: 2027,
    website_url: 'https://cartcraft.io',
    description_fr: 'Outils professionnels de cartographie pour les équipes terrain.',
    description_en: 'Professional mapping tools for field teams.',
    logo_url: null,
    logo_alt_text: 'Logo CartoCraft',
    public_visibility: true,
    display_order: 1,
    featured: true,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Nadia Pelletier',
    primary_contact_email: 'nadia@cartcraft.io',
    primary_contact_phone: '514-555-0111',
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: null,
    status: 'published',
    communication_date: '2025-01-10',
    invoice_sent_date: '2025-02-01',
    payment_received_date: '2025-02-20',
    follow_up_date: null,
    contract_url: null,
    invoice_url: null,
    payment_status: 'paid',
    internal_notes: 'Exposant depuis GÉOMTL 2025. Très professionnel.',
    booth_number: 'A-01',
    booth_size: 'double',
    booth_zone: 'Zone A – Entrée principale',
    booth_status: 'confirmed',
    setup_date: '2027-10-02',
    teardown_date: '2027-10-05',
    logo_received: true,
    logo_validated: true,
    company_name_confirmed: true,
    description_received: true,
    materials_received: true,
    promo_code: 'CARTO27',
    internal_owner_name: 'Sophie Martin',
    internal_owner_email: 'sophie@example.com',
    committee_owner: 'Comité exposants',
    last_updated_by: 'sophie@example.com',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'e2',
    company_name: 'DroneGeo Québec',
    public_name: 'DroneGeo QC',
    sector: 'Télédétection / Drone',
    year: 2027,
    website_url: 'https://dronegeo.qc.ca',
    description_fr: 'Acquisition de données par drone pour les professionnels du géospatial.',
    description_en: 'Drone data acquisition for geospatial professionals.',
    logo_url: null,
    logo_alt_text: null,
    public_visibility: false,
    display_order: 2,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Julien Côté',
    primary_contact_email: 'julien@dronegeo.qc.ca',
    primary_contact_phone: '418-555-0222',
    secondary_contact_name: 'Émilie Fortin',
    secondary_contact_email: 'emilie@dronegeo.qc.ca',
    notes_contact: 'Préférence pour appels le matin.',
    status: 'assets_pending',
    communication_date: '2025-02-15',
    invoice_sent_date: '2025-03-01',
    payment_received_date: '2025-03-20',
    follow_up_date: '2026-06-01',
    contract_url: null,
    invoice_url: null,
    payment_status: 'paid',
    internal_notes: 'Logo HD en attente. Matériel promotionnel non reçu.',
    booth_number: 'A-03',
    booth_size: 'standard',
    booth_zone: 'Zone A – Entrée principale',
    booth_status: 'assigned',
    setup_date: '2027-10-02',
    teardown_date: '2027-10-05',
    logo_received: false,
    logo_validated: false,
    company_name_confirmed: true,
    description_received: true,
    materials_received: false,
    promo_code: 'DRONE27',
    internal_owner_name: 'Marc Bouchard',
    internal_owner_email: 'marc@example.com',
    committee_owner: 'Comité exposants',
    last_updated_by: 'marc@example.com',
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2025-04-15T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'e3',
    company_name: 'GeoData Analytics Inc.',
    public_name: 'GeoData Analytics',
    sector: 'Analyse de données',
    year: 2027,
    website_url: 'https://geodata-analytics.com',
    description_fr: 'Plateforme analytique pour grandes données géospatiales.',
    description_en: 'Analytics platform for large-scale geospatial data.',
    logo_url: null,
    logo_alt_text: null,
    public_visibility: false,
    display_order: 3,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Sarah O\'Brien',
    primary_contact_email: 'sobrien@geodata-analytics.com',
    primary_contact_phone: null,
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: null,
    status: 'confirmed',
    communication_date: '2025-03-01',
    invoice_sent_date: '2025-04-01',
    payment_received_date: null,
    follow_up_date: '2026-07-01',
    contract_url: null,
    invoice_url: null,
    payment_status: 'pending',
    internal_notes: "Paiement attendu après approbation interne.",
    booth_number: 'B-07',
    booth_size: 'standard',
    booth_zone: 'Zone B – Corridor central',
    booth_status: 'assigned',
    setup_date: null,
    teardown_date: null,
    logo_received: false,
    logo_validated: false,
    company_name_confirmed: true,
    description_received: false,
    materials_received: false,
    promo_code: null,
    internal_owner_name: 'Sophie Martin',
    internal_owner_email: 'sophie@example.com',
    committee_owner: 'Comité exposants',
    last_updated_by: 'sophie@example.com',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-04-20T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'e4',
    company_name: 'OpenStreet Tech',
    public_name: 'OpenStreet Tech',
    sector: 'Open Source / SIG',
    year: 2027,
    website_url: 'https://openstreet.tech',
    description_fr: 'Solutions SIG open source pour les gouvernements et ONG.',
    description_en: 'Open-source GIS solutions for governments and NGOs.',
    logo_url: null,
    logo_alt_text: null,
    public_visibility: false,
    display_order: 10,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Thomas Lebrun',
    primary_contact_email: 'thomas@openstreet.tech',
    primary_contact_phone: '438-555-0444',
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: null,
    status: 'invoiced',
    communication_date: '2025-04-01',
    invoice_sent_date: '2025-04-15',
    payment_received_date: null,
    follow_up_date: '2026-05-15',
    contract_url: null,
    invoice_url: null,
    payment_status: 'unpaid',
    internal_notes: 'Relancer pour confirmation paiement.',
    booth_number: null,
    booth_size: 'standard',
    booth_zone: null,
    booth_status: 'to_assign',
    setup_date: null,
    teardown_date: null,
    logo_received: false,
    logo_validated: false,
    company_name_confirmed: false,
    description_received: false,
    materials_received: false,
    promo_code: null,
    internal_owner_name: 'Marc Bouchard',
    internal_owner_email: 'marc@example.com',
    committee_owner: 'Comité exposants',
    last_updated_by: 'marc@example.com',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: '2025-04-20T00:00:00Z',
    archived_at: null,
  },
  {
    id: 'e5',
    company_name: 'Spatial Insight Labs',
    public_name: null,
    sector: 'Intelligence artificielle',
    year: 2027,
    website_url: 'https://spatialinsight.ai',
    description_fr: 'IA géospatiale pour la planification urbaine.',
    description_en: 'Geospatial AI for urban planning.',
    logo_url: null,
    logo_alt_text: null,
    public_visibility: false,
    display_order: 20,
    featured: false,
    company_address: null,
    company_phone: null,
    primary_contact_name: 'Priya Nair',
    primary_contact_email: 'priya@spatialinsight.ai',
    primary_contact_phone: null,
    secondary_contact_name: null,
    secondary_contact_email: null,
    notes_contact: 'Startup - contacts informels.',
    status: 'contacted',
    communication_date: '2025-05-01',
    invoice_sent_date: null,
    payment_received_date: null,
    follow_up_date: '2026-08-01',
    contract_url: null,
    invoice_url: null,
    payment_status: 'unpaid',
    internal_notes: 'Très intéressés. En attente de leur approbation budget Q3.',
    booth_number: null,
    booth_size: 'standard',
    booth_zone: null,
    booth_status: 'not_required',
    setup_date: null,
    teardown_date: null,
    logo_received: false,
    logo_validated: false,
    company_name_confirmed: false,
    description_received: false,
    materials_received: false,
    promo_code: null,
    internal_owner_name: 'Sophie Martin',
    internal_owner_email: 'sophie@example.com',
    committee_owner: 'Comité exposants',
    last_updated_by: 'sophie@example.com',
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-05-05T00:00:00Z',
    archived_at: null,
  },
]

// ─── Data fetching (Server Components) ────────────────────

// Fiches archivées, pour pouvoir les restaurer depuis la liste
export async function getArchivedExhibitors(): Promise<Exhibitor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false })

  if (error) {
    console.error('[getArchivedExhibitors]', error.message)
    return []
  }

  return (data ?? []) as Exhibitor[]
}

export async function getExhibitors(): Promise<Exhibitor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_ADMIN_EXHIBITORS
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .is('archived_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[getExhibitors]', error.message)
    return []
  }

  return (data ?? []) as Exhibitor[]
}

export async function getExhibitorById(id: string): Promise<Exhibitor | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_ADMIN_EXHIBITORS.find((e) => e.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getExhibitorById]', error.message)
    return null
  }

  return data as Exhibitor
}
