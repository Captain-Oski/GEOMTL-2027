'use server'

import { createClient } from '@supabase/supabase-js'
import { URL_SITE } from '@/lib/site'

// « Mot de passe oublié » : Supabase envoie un lien vers /auth/confirm, qui
// affiche le formulaire de nouveau mot de passe. Flux implicite : le lien doit
// fonctionner même s'il est ouvert dans un autre navigateur que celui de la demande.
// La réponse est la même que le compte existe ou non, pour ne pas révéler
// quelles adresses ont un accès.

export async function demanderReinitialisation(email: string): Promise<{ error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !cle) return { error: 'Supabase non configuré.' }

  const adresse = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse)) return { error: 'Adresse courriel invalide.' }

  const supabase = createClient(url, cle, { auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false } })
  const { error } = await supabase.auth.resetPasswordForEmail(adresse, {
    redirectTo: `${process.env.NODE_ENV === 'production' ? URL_SITE : 'http://localhost:3000'}/auth/confirm`,
  })
  if (error) console.error('[demanderReinitialisation]', error.message)
  return {}
}
