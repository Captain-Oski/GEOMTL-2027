'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { URL_SITE } from '@/lib/site'
import type { Role } from '@/lib/supabase/types'

const MOCK_MSG = 'Supabase non configuré - modifications non persistées en mode mock.'

// ─── Inviter un utilisateur par courriel ──────────────────
// Supabase envoie un email avec un lien magique.
// L'utilisateur clique le lien → /auth/callback → session créée.

export async function inviteUser(email: string): Promise<{ error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { error: MOCK_MSG }

  const check = await assertAdmin()
  if (check.error) return check

  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NODE_ENV === 'production' ? URL_SITE : 'http://localhost:3000'}/auth/callback`,
    })
    if (error) return { error: error.message }
  } catch {
    return { error: 'Client admin indisponible - vérifiez SUPABASE_SERVICE_ROLE_KEY.' }
  }

  revalidatePath('/admin/users')
  return {}
}

// ─── Créer un utilisateur avec mot de passe ───────────────
// Crée le compte directement, sans email d'invitation.
// Idéal pour onboarder rapidement un membre de l'équipe.

export async function createUser(
  email: string,
  password: string,
  role: Role,
): Promise<{ error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { error: MOCK_MSG }

  const check = await assertAdmin()
  if (check.error) return check

  if (password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }

  try {
    const adminClient = createAdminClient()

    // Créer l'utilisateur dans auth.users
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // confirmer immédiatement sans email
    })
    if (error) return { error: error.message }

    // Attribuer le rôle dans profiles (le trigger handle_new_user crée le profil,
    // mais on force le rôle tout de suite via upsert pour ne pas attendre)
    if (data.user) {
      const supabase = await createClient()
      await supabase
        .from('profiles')
        .update({ role })
        .eq('id', data.user.id)
    }
  } catch {
    return { error: 'Client admin indisponible - vérifiez SUPABASE_SERVICE_ROLE_KEY.' }
  }

  revalidatePath('/admin/users')
  return {}
}

// ─── Vérification que l'appelant est admin ─────────────────
// Chaque action re-vérifie indépendamment - ne pas faire confiance au client.

async function assertAdmin(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Accès refusé - rôle admin requis.' }
  return {}
}

// ─── Modifier le rôle d'un utilisateur ────────────────────

export async function updateUserRole(
  targetId: string,
  role: Role | null,
): Promise<{ error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { error: MOCK_MSG }

  const supabase = await createClient()

  // Empêcher de modifier son propre rôle
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === targetId) {
    return { error: 'Vous ne pouvez pas modifier votre propre rôle.' }
  }

  const check = await assertAdmin()
  if (check.error) return check

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', targetId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return {}
}

// ─── Révoquer l'accès (role → null) ───────────────────────

export async function revokeUserAccess(targetId: string): Promise<{ error?: string }> {
  return updateUserRole(targetId, null)
}

// ─── Supprimer définitivement un utilisateur ──────────────
// Nécessite le service role (SUPABASE_SERVICE_ROLE_KEY)

export async function deleteUser(targetId: string): Promise<{ error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { error: MOCK_MSG }

  const supabase = await createClient()

  // Empêcher de se supprimer soi-même
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === targetId) {
    return { error: 'Vous ne pouvez pas supprimer votre propre compte.' }
  }

  const check = await assertAdmin()
  if (check.error) return check

  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(targetId)
    if (error) return { error: error.message }
  } catch (e) {
    return { error: 'Client admin indisponible - vérifiez SUPABASE_SERVICE_ROLE_KEY.' }
  }

  revalidatePath('/admin/users')
  return {}
}
