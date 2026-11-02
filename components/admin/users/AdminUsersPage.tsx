'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Role } from '@/lib/supabase/types'
import { updateUserRole, revokeUserAccess, deleteUser, inviteUser, createUser } from '@/lib/actions/users'

interface Props {
  profiles: Profile[]
  currentUserId: string
}

// ─── Couleurs et labels des rôles ─────────────────────────

const ROLE_STYLES: Record<string, string> = {
  admin:  'bg-rose-900/60 text-rose-300 border border-rose-700/50',
  editor: 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
  viewer: 'bg-gray-700 text-gray-300 border border-gray-600',
  none:   'bg-amber-900/40 text-amber-400 border border-amber-700/50',
}

const ROLE_LABELS: Record<string, string> = {
  admin:  'Admin',
  editor: 'Éditeur',
  viewer: 'Lecteur',
  none:   'En attente',
}

function RoleBadge({ role }: { role: Role | null }) {
  const key = role ?? 'none'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ROLE_STYLES[key]}`}>
      {ROLE_LABELS[key]}
    </span>
  )
}

function Avatar({ profile }: { profile: Profile }) {
  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : profile.email[0].toUpperCase()

  const colors: Record<string, string> = {
    admin:  'bg-rose-700',
    editor: 'bg-blue-700',
    viewer: 'bg-gray-600',
  }
  const bg = profile.role ? colors[profile.role] : 'bg-amber-800'

  return (
    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Modal de confirmation ─────────────────────────────────

interface ModalProps {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/20 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              danger
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ───────────────────────────────────

// ─── Panneau d'ajout d'utilisateur ────────────────────────

type AddMode = 'create' | 'invite'

function AddUserPanel({ onDone }: { onDone: () => void }) {
  const [mode,     setMode]     = useState<AddMode>('create')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<Role>('viewer')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const res = mode === 'create'
      ? await createUser(email, password, role)
      : await inviteUser(email)

    setSaving(false)
    if (res.error) { setError(res.error); return }

    setSuccess(
      mode === 'create'
        ? `Compte créé pour ${email} avec le rôle « ${role} ».`
        : `Invitation envoyée à ${email}.`
    )
    setEmail('')
    setPassword('')
    onDone()
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
      <h2 className="text-white font-semibold text-sm mb-4">Ajouter un utilisateur</h2>

      {/* Sélecteur de mode */}
      <div className="flex gap-2 mb-5">
        {(['create', 'invite'] as AddMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); setSuccess(null) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {m === 'create' ? 'Créer avec mot de passe' : 'Inviter par courriel'}
          </button>
        ))}
      </div>

      {success && (
        <div className="bg-green-900/40 border border-green-700/50 text-green-300 text-sm px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-gray-400 mb-1">Courriel</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nouveau@example.com"
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {mode === 'create' && (
          <>
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-gray-400 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères min."
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rôle initial</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="viewer">Lecteur</option>
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          {saving
            ? '…'
            : mode === 'create' ? 'Créer le compte' : 'Envoyer l\'invitation'}
        </button>
      </form>

      {mode === 'invite' && (
        <p className="text-gray-600 text-xs mt-3">
          Supabase enverra un courriel d&apos;invitation. L&apos;utilisateur devra cliquer le lien pour activer son compte. Vous pourrez lui attribuer un rôle dès son apparition dans la liste.
        </p>
      )}
    </div>
  )
}

// ─── Composant principal ───────────────────────────────────

export function AdminUsersPage({ profiles, currentUserId }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  type ModalState =
    | { type: 'role'; profile: Profile; newRole: Role | null }
    | { type: 'revoke'; profile: Profile }
    | { type: 'delete'; profile: Profile }
    | null

  const [modal, setModal] = useState<ModalState>(null)

  function showError(msg: string) {
    setError(msg)
    setTimeout(() => setError(null), 5000)
  }

  async function run(key: string, fn: () => Promise<{ error?: string }>) {
    setPending(key)
    setError(null)
    const res = await fn()
    setPending(null)
    if (res.error) { showError(res.error); return }
    router.refresh()
    setModal(null)
  }

  function handleRoleChange(profile: Profile, value: string) {
    const newRole = value === 'none' ? null : value as Role
    if (newRole === profile.role) return
    setModal({ type: 'role', profile, newRole })
  }

  const isSelf = (id: string) => id === currentUserId

  const activeCount  = profiles.filter((p) => p.role !== null).length
  const pendingCount = profiles.filter((p) => p.role === null).length

  return (
    <>
      {/* Modal */}
      {modal?.type === 'role' && (
        <ConfirmModal
          title="Modifier le rôle"
          message={`Changer le rôle de ${modal.profile.full_name ?? modal.profile.email} vers « ${ROLE_LABELS[modal.newRole ?? 'none']} » ?`}
          confirmLabel="Confirmer"
          onConfirm={() => run(modal.profile.id, () => updateUserRole(modal.profile.id, modal.newRole))}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'revoke' && (
        <ConfirmModal
          title="Révoquer l'accès"
          message={`${modal.profile.full_name ?? modal.profile.email} perdra immédiatement l'accès à l'administration. Son compte reste en liste, en attente d'un rôle.`}
          confirmLabel="Révoquer"
          danger
          onConfirm={() => run(modal.profile.id, () => revokeUserAccess(modal.profile.id))}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Supprimer définitivement"
          message={`Supprimer le compte de ${modal.profile.full_name ?? modal.profile.email} ? Cette action est irréversible : pour lui redonner accès, il faudra créer un nouveau compte.`}
          confirmLabel="Supprimer définitivement"
          danger
          onConfirm={() => run(modal.profile.id, () => deleteUser(modal.profile.id))}
          onCancel={() => setModal(null)}
        />
      )}

      <div className="p-6 lg:p-8 max-w-5xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gestion des accès à l'administration GÉOMTL 2027
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl font-bold text-white">{profiles.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Actifs</p>
            <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">En attente</p>
            <p className={`text-3xl font-bold ${pendingCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {pendingCount}
            </p>
            {pendingCount > 0 && (
              <p className="text-amber-500/70 text-xs mt-1">Rôle à attribuer</p>
            )}
          </div>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Ajout d'utilisateur */}
        <AddUserPanel onDone={() => router.refresh()} />

        {/* Légende des rôles */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Rôles disponibles</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <RoleBadge role="admin" />
              <p className="text-gray-400 text-xs">Accès complet - gestion des utilisateurs et suppressions.</p>
            </div>
            <div className="flex items-start gap-2">
              <RoleBadge role="editor" />
              <p className="text-gray-400 text-xs">Peut traiter les demandes, modifier les fiches, les kiosques et la programmation, sans rien supprimer.</p>
            </div>
            <div className="flex items-start gap-2">
              <RoleBadge role="viewer" />
              <p className="text-gray-400 text-xs">Lecture seule - aucune modification possible.</p>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                <th className="text-left py-3 px-4 font-medium">Rôle</th>
                <th className="text-left py-3 px-4 font-medium">Membre depuis</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles.map((profile) => {
                const self = isSelf(profile.id)
                const isLoading = pending === profile.id

                return (
                  <tr
                    key={profile.id}
                    className={`hover:bg-white/5 transition-colors ${self ? 'bg-white/[0.02]' : ''}`}
                  >
                    {/* Utilisateur */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar profile={profile} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium text-sm">
                              {profile.full_name ?? <span className="text-gray-500 italic">Sans nom</span>}
                            </p>
                            {self && (
                              <span className="text-xs bg-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                                Vous
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs">{profile.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rôle */}
                    <td className="py-4 px-4">
                      {self ? (
                        <div className="flex items-center gap-2">
                          <RoleBadge role={profile.role} />
                          <span className="text-gray-600 text-xs">(non modifiable)</span>
                        </div>
                      ) : (
                        <select
                          value={profile.role ?? 'none'}
                          onChange={(e) => handleRoleChange(profile, e.target.value)}
                          disabled={isLoading}
                          className="bg-gray-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="none" className="bg-gray-900">En attente</option>
                          <option value="viewer" className="bg-gray-900">Lecteur</option>
                          <option value="editor" className="bg-gray-900">Éditeur</option>
                          <option value="admin" className="bg-gray-900">Admin</option>
                        </select>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {new Date(profile.created_at).toLocaleDateString('fr-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {self ? (
                        <span className="text-gray-700 text-xs">-</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {profile.role !== null && (
                            <button
                              onClick={() => setModal({ type: 'revoke', profile })}
                              disabled={isLoading}
                              className="text-xs text-amber-500 hover:text-amber-400 disabled:opacity-40 transition-colors px-2 py-1 rounded hover:bg-white/5"
                            >
                              Révoquer
                            </button>
                          )}
                          <button
                            onClick={() => setModal({ type: 'delete', profile })}
                            disabled={isLoading}
                            className="text-xs text-red-500 hover:text-red-400 disabled:opacity-40 transition-colors px-2 py-1 rounded hover:bg-white/5"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Note explicative */}
        <p className="text-gray-600 text-xs mt-4">
          Une personne invitée apparaît ici « En attente » dès que son compte est créé.
          Un rôle doit lui être attribué pour lui donner accès à l&apos;administration.
        </p>
      </div>
    </>
  )
}
