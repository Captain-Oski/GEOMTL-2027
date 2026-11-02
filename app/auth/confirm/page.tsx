'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Gère les liens envoyés par Supabase par courriel :
//   - type=recovery  → formulaire de nouveau mot de passe
//   - type=invite    → formulaire du premier mot de passe
//   - type=signup    → confirmation de compte, redirect vers /admin
//
// Supabase envoie le token dans le hash (#) - non lisible côté serveur.
// Cette page est donc un Client Component.

type FlowType = 'recovery' | 'signup' | 'invite' | 'unknown'

export default function AuthConfirmPage() {
  const router = useRouter()
  const [flowType,  setFlowType]  = useState<FlowType | null>(null)
  const [ready,     setReady]     = useState(false)
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)

  useEffect(() => {
    const hash   = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)

    const accessToken  = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type         = (params.get('type') ?? 'unknown') as FlowType

    setFlowType(type)

    if (!accessToken || !refreshToken) {
      setFlowType('unknown')
      setError('Lien invalide ou expiré. Demandez un nouveau lien.')
      return
    }

    // Hydrater la session depuis les tokens du hash
    const supabase = createClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setError('Lien invalide ou expiré. Demandez un nouveau lien.')
          return
        }
        setReady(true)
        // Un mot de passe est à choisir pour recovery et invite ; sinon, vers l'admin
        if (type !== 'recovery' && type !== 'invite') {
          router.replace('/admin')
        }
      })
  }, [router])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    setTimeout(() => router.replace('/admin'), 1500)
  }

  // ── Erreur de token ───────────────────────────────────────
  if (error && !ready) {
    return (
      <Layout>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
        <p className="text-gray-500 text-xs text-center mt-4">
          Retourner à la{' '}
          <a href="/login" className="text-rose-400 hover:underline">page de connexion</a>.
        </p>
      </Layout>
    )
  }

  // ── Formulaire nouveau mot de passe ───────────────────────
  if ((flowType === 'recovery' || flowType === 'invite') && ready) {
    return (
      <Layout>
        <h1 className="text-white font-semibold text-xl mb-1">{flowType === 'invite' ? 'Choisissez votre mot de passe' : 'Nouveau mot de passe'}</h1>
        <p className="text-gray-400 text-sm mb-6">
          {flowType === 'invite' ? 'Dernière étape pour activer votre compte GÉOMTL.' : 'Choisissez un nouveau mot de passe pour votre compte GÉOMTL.'}
        </p>

        {success ? (
          <div className="bg-green-900/40 border border-green-700/50 text-green-300 text-sm px-4 py-3 rounded-xl text-center">
            Mot de passe mis à jour. Redirection…
          </div>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1" htmlFor="password">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1" htmlFor="confirm">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répéter le mot de passe"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-3 transition-colors"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}
      </Layout>
    )
  }

  // ── Chargement / redirect en cours ────────────────────────
  return (
    <Layout>
      <p className="text-gray-400 text-sm text-center">Vérification du lien…</p>
    </Layout>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-rose-500 font-bold text-3xl tracking-tight">GÉOMTL</span>
          <p className="text-gray-500 mt-2 text-sm">Administration - GÉOMTL 2027</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
