// ─── Auth ─────────────────────────────────────────────────

export type Role = 'admin' | 'editor' | 'viewer'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: Role | null
  created_at: string
}

// ─── Partner (module complet) ─────────────────────────────

export type PartnerType = 'Gold' | 'Silver' | 'Bronze' | 'Networking'

export type PartnerStatus =
  | 'prospect'
  | 'contacted'
  | 'confirmed'
  | 'invoiced'
  | 'paid'
  | 'assets_pending'
  | 'ready_to_publish'
  | 'published'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'cancelled'

export type BoothStatus = 'not_required' | 'to_assign' | 'assigned' | 'confirmed'

export type Partner = {
  id: string

  // Identité
  company_name: string
  public_name: string | null
  partner_type: PartnerType
  status: PartnerStatus
  year: number

  // Visibilité publique
  website_url: string | null
  description_fr: string | null
  description_en: string | null
  logo_url: string | null
  logo_alt_text: string | null
  public_visibility: boolean
  display_order: number
  featured: boolean

  // Contact
  company_address: string | null // adresse civique de l'organisation
  company_phone: string | null // téléphone de l'organisation
  primary_contact_name: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  secondary_contact_name: string | null
  secondary_contact_email: string | null
  notes_contact: string | null

  // Administratif
  communication_date: string | null
  invoice_sent_date: string | null
  payment_received_date: string | null
  information_requested_date: string | null
  follow_up_date: string | null
  contract_url: string | null
  invoice_url: string | null
  payment_status: PaymentStatus
  internal_notes: string | null

  // Kiosque et livrables
  promo_code: string | null
  booth_number: string | null
  booth_status: BoothStatus
  deliverables: string | null
  deadlines: string | null
  logo_received: boolean
  company_name_confirmed: boolean
  description_received: boolean

  // Responsables internes
  internal_owner_name: string | null
  internal_owner_email: string | null
  committee_owner: string | null
  last_updated_by: string | null

  // Métadonnées
  created_at: string
  updated_at: string
  archived_at: string | null
}

// Sous-type public (vue filtrée, sans données sensibles)
export type PublicPartner = Pick<
  Partner,
  | 'id'
  | 'company_name'
  | 'public_name'
  | 'partner_type'
  | 'website_url'
  | 'description_fr'
  | 'description_en'
  | 'logo_url'
  | 'logo_alt_text'
  | 'display_order'
  | 'featured'
  | 'year'
>

// ─── Exhibitor ────────────────────────────────────────────

export type ExhibitorStatus =
  | 'prospect'
  | 'contacted'
  | 'confirmed'
  | 'invoiced'
  | 'paid'
  | 'assets_pending'
  | 'ready_to_publish'
  | 'published'
  | 'cancelled'

export type BoothSize = 'standard' | 'double' | 'corner' | 'island'

export type Exhibitor = {
  id: string

  // Identité
  company_name: string
  public_name: string | null
  sector: string | null
  year: number

  // Visibilité publique
  website_url: string | null
  description_fr: string | null
  description_en: string | null
  logo_url: string | null
  logo_alt_text: string | null
  public_visibility: boolean
  display_order: number
  featured: boolean

  // Contact
  company_address: string | null // adresse civique de l'organisation
  company_phone: string | null // téléphone de l'organisation
  primary_contact_name: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  secondary_contact_name: string | null
  secondary_contact_email: string | null
  notes_contact: string | null

  // Suivi administratif
  status: ExhibitorStatus
  communication_date: string | null
  invoice_sent_date: string | null
  payment_received_date: string | null
  follow_up_date: string | null
  contract_url: string | null
  invoice_url: string | null
  payment_status: PaymentStatus
  internal_notes: string | null

  // Kiosque
  booth_number: string | null
  booth_size: BoothSize
  booth_zone: string | null
  booth_status: BoothStatus
  setup_date: string | null
  teardown_date: string | null

  // Actifs / Livrables
  logo_received: boolean
  logo_validated: boolean
  company_name_confirmed: boolean
  description_received: boolean
  materials_received: boolean
  promo_code: string | null

  // Responsables internes
  internal_owner_name: string | null
  internal_owner_email: string | null
  committee_owner: string | null
  last_updated_by: string | null

  // Métadonnées
  created_at: string
  updated_at: string
  archived_at: string | null
}

export type PublicExhibitor = Pick<
  Exhibitor,
  | 'id'
  | 'company_name'
  | 'public_name'
  | 'sector'
  | 'website_url'
  | 'description_fr'
  | 'description_en'
  | 'logo_url'
  | 'logo_alt_text'
  | 'display_order'
  | 'featured'
  | 'booth_number'
  | 'year'
>

// ─── Contract ─────────────────────────────────────────────

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled'

export type Contract = {
  id: string
  partner_id: string | null
  exhibitor_id: string | null
  amount: number | null
  status: ContractStatus
  signed_at: string | null
  notes: string | null
  created_at: string
}

// ─── Contact ──────────────────────────────────────────────

export type Contact = {
  id: string
  partner_id: string | null
  exhibitor_id: string | null
  full_name: string
  email: string
  phone: string | null
  role: string | null
  is_primary: boolean
  created_at: string
}

// ─── Deliverable ──────────────────────────────────────────

export type DeliverableStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export type Deliverable = {
  id: string
  partner_id: string | null
  exhibitor_id: string | null
  title: string
  due_date: string | null
  status: DeliverableStatus
  notes: string | null
  created_at: string
}

// ─── Programme / Sessions ─────────────────────────────────

export type SessionType =
  | 'keynote'
  | 'conference'
  | 'panel'
  | 'workshop'
  | 'networking'
  | 'demo'
  | 'awards'

export type SessionDay = 'evening' | 'day1' | 'day2'

export type SessionStatus = 'draft' | 'confirmed' | 'cancelled'

export type Session = {
  id: string
  title_fr: string
  title_en: string | null
  description_fr: string | null
  description_en: string | null
  type: SessionType
  day: SessionDay
  start_time: string        // HH:MM
  end_time: string          // HH:MM
  room: string | null
  speakers: string | null   // noms séparés par virgule
  moderator: string | null
  public_visibility: boolean
  status: SessionStatus
  notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

// ─── KPI ──────────────────────────────────────────────────

export type KPI = {
  id: string
  metric_name: string
  value: number
  unit: string | null
  recorded_at: string
  notes: string | null
}

// ─── Kiosques et demandes de réservation (V007) ───────────

export type StatutKiosque = 'disponible' | 'reserve'

export type Kiosque = {
  numero: number
  statut: StatutKiosque
  organisation_affichee: string | null
  logo_url: string | null
  site_url: string | null
  exhibitor_id: string | null
  partner_id: string | null
  notes_internes: string | null
  updated_by: string | null
  updated_at: string
}

// Ce que le site public reçoit : rien d'interne
export type KiosquePublic = Pick<Kiosque, 'numero' | 'statut' | 'organisation_affichee' | 'logo_url' | 'site_url'>

export type NiveauDemande = 'exposant' | 'bronze' | 'argent' | 'or' | 'soiree' | 'a_determiner'

export type StatutDemande = 'nouvelle' | 'en_traitement' | 'acceptee' | 'refusee' | 'archivee' | 'spam'

export type DemandeKiosque = {
  id: string
  created_at: string
  kiosque_numero: number | null // 1er choix ; null : sans préférence
  kiosque_choix_2: number | null
  kiosque_choix_3: number | null
  niveau: NiveauDemande
  organisation: string
  organisation_adresse: string | null // null : demandes reçues avant V010
  organisation_telephone: string | null
  principal_nom: string
  principal_courriel: string
  principal_telephone: string
  kiosque_nom: string
  kiosque_courriel: string
  kiosque_telephone: string
  message: string | null
  langue: 'fr' | 'en'
  consentement: boolean
  statut: StatutDemande
  traite_par: string | null
  traite_le: string | null
  notes_internes: string | null
  fiche_exhibitor_id: string | null
  fiche_partner_id: string | null
  empreinte_ip: string | null
}
