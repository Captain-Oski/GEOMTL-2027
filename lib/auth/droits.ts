import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/supabase/types'

// Vérifications de droits de l'admin, côté serveur. Une action serveur peut être
// appelée directement, sans passer par l'interface : chacune doit commencer par
// exigerEditeur ou exigerAdmin, même si son bouton est masqué pour les autres rôles.

const MESSAGE_CONNEXION = 'Non authentifié.'

// Mode démo (sans Supabase) : admin, comme dans app/admin/layout.tsx
export async function sessionCourante(): Promise<{ userId: string | null; role: Role | null }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { userId: null, role: 'admin' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { userId: null, role: null }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return { userId: user.id, role: (profile?.role as Role | undefined) ?? null }
}

export const peutEditer = (role: Role | null) => role === 'admin' || role === 'editor'

export async function exigerEditeur(): Promise<{ error?: string; userId?: string }> {
  const { userId, role } = await sessionCourante()
  if (!userId) return { error: MESSAGE_CONNEXION }
  if (!peutEditer(role)) return { error: 'Accès refusé - rôle admin ou éditeur requis.' }
  return { userId }
}

export async function exigerAdmin(): Promise<{ error?: string; userId?: string }> {
  const { userId, role } = await sessionCourante()
  if (!userId) return { error: MESSAGE_CONNEXION }
  if (role !== 'admin') return { error: 'Accès refusé - rôle admin requis.' }
  return { userId }
}
