'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { exigerAdmin, exigerEditeur } from '@/lib/auth/droits'
import type { SessionType, SessionDay, SessionStatus } from '@/lib/supabase/types'

type SessionInput = {
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
  type: SessionType
  day: SessionDay
  start_time: string
  end_time: string
  room: string
  speakers: string
  moderator: string
  public_visibility: boolean
  status: SessionStatus
  notes: string
  display_order: number
}

function toRow(input: SessionInput) {
  return {
    title_fr: input.title_fr,
    title_en: input.title_en || null,
    description_fr: input.description_fr || null,
    description_en: input.description_en || null,
    type: input.type,
    day: input.day,
    start_time: input.start_time,
    end_time: input.end_time,
    room: input.room || null,
    speakers: input.speakers || null,
    moderator: input.moderator || null,
    public_visibility: input.public_visibility,
    status: input.status,
    notes: input.notes || null,
    display_order: input.display_order,
    updated_at: new Date().toISOString(),
  }
}

export async function createSession(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect('/admin/programme')
  }

  const check = await exigerEditeur()
  if (check.error) throw new Error(check.error)

  const input = parseForm(formData)
  const client = await createClient()
  const { error } = await client.from('sessions').insert(toRow(input))

  if (error) {
    console.error('[createSession]', error.message)
    throw new Error(error.message)
  }

  revalidatePath('/admin/programme')
  redirect('/admin/programme')
}

export async function updateSession(id: string, formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect('/admin/programme')
  }

  const check = await exigerEditeur()
  if (check.error) throw new Error(check.error)

  const input = parseForm(formData)
  const client = await createClient()
  const { error } = await client.from('sessions').update(toRow(input)).eq('id', id)

  if (error) {
    console.error('[updateSession]', error.message)
    throw new Error(error.message)
  }

  revalidatePath('/admin/programme')
  redirect('/admin/programme')
}

export async function moveSession(id: string, day: SessionDay) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

  const check = await exigerEditeur()
  if (check.error) throw new Error(check.error)

  const client = await createClient()
  const { error } = await client
    .from('sessions')
    .update({ day, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) console.error('[moveSession]', error.message)
  revalidatePath('/admin/programme')
}

export async function deleteSession(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    revalidatePath('/admin/programme')
    return
  }

  const check = await exigerAdmin()
  if (check.error) throw new Error(check.error)

  const client = await createClient()
  const { error } = await client.from('sessions').delete().eq('id', id)

  if (error) {
    console.error('[deleteSession]', error.message)
    throw new Error(error.message)
  }

  revalidatePath('/admin/programme')
}

function parseForm(formData: FormData): SessionInput {
  return {
    title_fr: String(formData.get('title_fr') ?? ''),
    title_en: String(formData.get('title_en') ?? ''),
    description_fr: String(formData.get('description_fr') ?? ''),
    description_en: String(formData.get('description_en') ?? ''),
    type: String(formData.get('type') ?? 'conference') as SessionType,
    day: String(formData.get('day') ?? 'day1') as SessionDay,
    start_time: String(formData.get('start_time') ?? '09:00'),
    end_time: String(formData.get('end_time') ?? '10:00'),
    room: String(formData.get('room') ?? ''),
    speakers: String(formData.get('speakers') ?? ''),
    moderator: String(formData.get('moderator') ?? ''),
    public_visibility: formData.get('public_visibility') === 'true',
    status: String(formData.get('status') ?? 'draft') as SessionStatus,
    notes: String(formData.get('notes') ?? ''),
    display_order: Number(formData.get('display_order') ?? 99),
  }
}
