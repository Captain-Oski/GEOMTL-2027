'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { demanderReinitialisation } from '@/lib/actions/auth'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:       "Votre compte n'a pas encore de rôle attribué - contactez l'administrateur.",
  auth_callback_error:'Erreur lors de la connexion. Veuillez réessayer.',
  no_profile:         'Profil introuvable. Contactez l\'administrateur.',
}

function UrlErrorBanner() {
  const params = useSearchParams()
  const error  = params.get('error')
  if (!error) return null
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
      {ERROR_MESSAGES[error] ?? 'Une erreur est survenue.'}
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [oubli,    setOubli]    = useState(false)
  const [envoye,   setEnvoye]   = useState(false)

  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Courriel ou mot de passe invalide.'
          : error.message
      )
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleOubli(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await demanderReinitialisation(email)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setEnvoye(true)
  }

  function changerMode(versOubli: boolean) {
    setOubli(versOubli)
    setEnvoye(false)
    setError(null)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h1 className="text-white font-semibold text-xl mb-1">{oubli ? 'Mot de passe oublié' : 'Connexion'}</h1>
      <p className="text-gray-400 text-sm mb-6">
        {oubli ? 'Entrez votre courriel : nous vous enverrons un lien pour choisir un nouveau mot de passe.' : <>Accès réservé à l&apos;équipe GÉOMTL.</>}
      </p>

      <Suspense fallback={null}>
        <UrlErrorBanner />
      </Suspense>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {isMock ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm">
          Supabase non configuré - ajoutez les variables dans{' '}
          <code className="font-mono">.env.local</code> pour activer l&apos;authentification.
        </div>
      ) : oubli ? (
        envoye ? (
          <div className="space-y-4">
            <div role="status" className="bg-green-900/40 border border-green-700/50 text-green-300 text-sm px-4 py-3 rounded-xl">
              Si un compte existe pour cette adresse, un lien vient de lui être envoyé. Vérifiez aussi vos courriels indésirables.
            </div>
            <button type="button" onClick={() => changerMode(false)} className="w-full text-sm text-gray-400 hover:text-white">
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleOubli} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1" htmlFor="email-oubli">
                Adresse courriel
              </label>
              <input
                id="email-oubli"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="vous@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-3 transition-colors"
            >
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
            <button type="button" onClick={() => changerMode(false)} className="w-full text-sm text-gray-400 hover:text-white">
              Retour à la connexion
            </button>
          </form>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="email">
              Adresse courriel
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="vous@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-3 transition-colors"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
          <button type="button" onClick={() => changerMode(true)} className="w-full text-sm text-gray-400 hover:text-white">
            Mot de passe oublié ?
          </button>
        </form>
      )}

      <p className="text-gray-600 text-xs text-center mt-6">
        Accès non autorisé ? Contactez l&apos;administrateur GÉOMTL.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-rose-500 font-bold text-3xl tracking-tight">GÉOMTL</span>
          <p className="text-gray-500 mt-2 text-sm">Administration - GÉOMTL 2027</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
