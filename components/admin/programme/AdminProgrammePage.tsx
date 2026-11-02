'use client'

import { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { deleteSession, moveSession } from '@/lib/actions/programme'
import type { Session, SessionType, SessionDay, SessionStatus } from '@/lib/supabase/types'
import { SessionStatusBadge, SessionTypeBadge } from './SessionStatusBadge'

// ─── Constantes ───────────────────────────────────────────

const DAYS: { id: SessionDay; label: string }[] = [
  { id: 'day1',    label: 'Jour 1 - 4 oct.' },
  { id: 'day2',    label: 'Jour 2 - 5 oct.' },
]

const DAY_IDS = DAYS.map((d) => d.id)

const TYPE_OPTIONS: { value: SessionType | ''; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'keynote',    label: 'Keynote' },
  { value: 'conference', label: 'Conférence' },
  { value: 'panel',      label: 'Panel' },
  { value: 'workshop',   label: 'Atelier' },
  { value: 'networking', label: 'Réseautage' },
  { value: 'demo',       label: 'Démo' },
  { value: 'awards',     label: 'Remise de prix' },
]

const STATUS_OPTIONS: { value: SessionStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'draft',     label: 'Brouillon' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'cancelled', label: 'Annulée' },
]

const selectClass =
  'bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500'

// Droits du rôle connecté : les actions serveur les revérifient de leur côté
const Droits = createContext({ peutModifier: false, peutSupprimer: false })

// ─── Carte session ────────────────────────────────────────

function SessionCard({
  session: s,
  overlay = false,
  dragHandleListeners,
  dragHandleAttributes,
  style,
  innerRef,
}: {
  session: Session
  overlay?: boolean
  dragHandleListeners?: Record<string, unknown>
  dragHandleAttributes?: Record<string, unknown>
  style?: React.CSSProperties
  innerRef?: (node: HTMLElement | null) => void
}) {
  const { peutModifier, peutSupprimer } = useContext(Droits)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm(`Supprimer « ${s.title_fr} » ?`)) {
      await deleteSession(s.id)
    }
  }

  return (
    <div
      ref={innerRef}
      style={style}
      className={`flex items-start gap-3 bg-gray-900 border rounded-xl px-4 py-3 transition-colors group select-none
        ${overlay
          ? 'border-rose-500/60 shadow-2xl shadow-rose-900/40 rotate-1 opacity-95'
          : 'border-gray-800 hover:border-gray-700'
        }`}
    >
      {/* Poignée de drag */}
      {peutModifier && <div
        {...(dragHandleListeners ?? {})}
        {...(dragHandleAttributes ?? {})}
        className={`mt-1 shrink-0 text-gray-600 hover:text-gray-300 transition-colors ${overlay ? 'cursor-grabbing' : 'cursor-grab'}`}
        title="Glisser pour déplacer"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="7" cy="4" r="1.2"/><circle cx="13" cy="4" r="1.2"/>
          <circle cx="7" cy="10" r="1.2"/><circle cx="13" cy="10" r="1.2"/>
          <circle cx="7" cy="16" r="1.2"/><circle cx="13" cy="16" r="1.2"/>
        </svg>
      </div>}

      {/* Horaire */}
      <div className="w-14 shrink-0 text-center">
        <div className="text-xs font-mono text-white">{s.start_time}</div>
        <div className="text-xs font-mono text-gray-600">{s.end_time}</div>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <SessionTypeBadge type={s.type} />
          <SessionStatusBadge status={s.status} />
          {!s.public_visibility && <span className="text-xs text-gray-600">Masquée</span>}
        </div>
        <p className="text-sm font-medium text-white truncate">{s.title_fr}</p>
        {s.speakers && <p className="text-xs text-gray-500 mt-0.5 truncate">{s.speakers}</p>}
        {s.room && <p className="text-xs text-gray-600 mt-0.5">📍 {s.room}</p>}
      </div>

      {/* Actions - masquées sauf au survol */}
      {!overlay && peutModifier && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Link
            href={`/admin/programme/${s.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded-lg transition-colors"
          >
            Modifier
          </Link>
          {peutSupprimer && <button
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg transition-colors"
          >
            ✕
          </button>}
        </div>
      )}
    </div>
  )
}

// ─── Carte sortable ───────────────────────────────────────

function SortableSessionCard({ session }: { session: Session }) {
  const { peutModifier } = useContext(Droits)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: session.id,
    disabled: !peutModifier,
    data: { type: 'session', day: session.day },
  })

  return (
    <SessionCard
      session={session}
      innerRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      dragHandleListeners={listeners as unknown as Record<string, unknown>}
      dragHandleAttributes={attributes as unknown as Record<string, unknown>}
    />
  )
}

// ─── Colonne journée (droppable + sortable) ───────────────

function DayColumn({
  day,
  label,
  sessions,
  isOver,
}: {
  day: SessionDay
  label: string
  sessions: Session[]
  isOver: boolean
}) {
  // Rend la colonne elle-même droppable (zone d'accueil quand vide)
  const { setNodeRef } = useDroppable({ id: day, data: { type: 'day', day } })

  return (
    <div
      className={`flex-1 min-w-[280px] rounded-2xl border p-4 transition-colors duration-150 ${
        isOver ? 'border-rose-500/50 bg-rose-500/5' : 'border-gray-800 bg-gray-900/40'
      }`}
    >
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
        {label}
        <span className="text-gray-600 font-normal normal-case tracking-normal text-xs">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </h2>

      <SortableContext
        id={day}
        items={sessions.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {/* ref sur la zone interne pour que les items tombent dedans */}
        <div ref={setNodeRef} className="space-y-2 min-h-[80px]">
          {sessions.map((s) => (
            <SortableSessionCard key={s.id} session={s} />
          ))}
          {sessions.length === 0 && (
            <div className={`flex items-center justify-center h-16 rounded-xl border-2 border-dashed text-xs transition-colors ${
              isOver ? 'border-rose-500/50 text-rose-500/60' : 'border-gray-800 text-gray-700'
            }`}>
              {isOver ? 'Déposer ici' : 'Aucune session'}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────

export function AdminProgrammePage({
  sessions: initialSessions,
  peutModifier,
  peutSupprimer,
}: {
  sessions: Session[]
  peutModifier: boolean
  peutSupprimer: boolean
}) {
  const droits = useMemo(() => ({ peutModifier, peutSupprimer }), [peutModifier, peutSupprimer])
  const [sessions, setSessions] = useState(initialSessions)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverDay = useRef<SessionDay | null>(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<SessionType | ''>('')
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('')
  const [roomFilter, setRoomFilter] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const rooms = useMemo(() => {
    const set = new Set(sessions.map((s) => s.room).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [sessions])

  // Helper : trouver la journée d'un item (session id) ou d'une colonne
  const getDay = useCallback((id: UniqueIdentifier): SessionDay | null => {
    if (DAY_IDS.includes(id as SessionDay)) return id as SessionDay
    return sessions.find((s) => s.id === id)?.day ?? null
  }, [sessions])

  // Détection de collision : privilégie pointerWithin (plus précis pour colonnes)
  // puis rectIntersection en fallback
  function collisionDetection(args: Parameters<typeof pointerWithin>[0]) {
    const pointerHits = pointerWithin(args)
    if (pointerHits.length > 0) {
      // Si on survole directement une colonne, la prioritiser
      const dayHit = pointerHits.find(({ id }) => DAY_IDS.includes(id as SessionDay))
      if (dayHit) return [dayHit]
      return pointerHits
    }
    return rectIntersection(args)
  }

  // ── Filtres ──
  const filtered = useMemo(() => sessions.filter((s) => {
    if (search) {
      const q = search.toLowerCase()
      if (!s.title_fr.toLowerCase().includes(q) &&
          !s.speakers?.toLowerCase().includes(q) &&
          !s.room?.toLowerCase().includes(q)) return false
    }
    if (typeFilter && s.type !== typeFilter) return false
    if (statusFilter && s.status !== statusFilter) return false
    if (roomFilter && s.room !== roomFilter) return false
    return true
  }), [sessions, search, typeFilter, statusFilter, roomFilter])

  const grouped = useMemo(() => {
    const map: Record<SessionDay, Session[]> = { evening: [], day1: [], day2: [] }
    filtered.slice().sort((a, b) => a.start_time.localeCompare(b.start_time))
      .forEach((s) => map[s.day === 'evening' ? 'day1' : s.day].push(s))
    return map
  }, [filtered])

  const activeSession = activeId ? sessions.find((s) => s.id === activeId) ?? null : null
  const overDay = activeId ? lastOverDay.current : null

  // ── Handlers DnD ──

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id)
    lastOverDay.current = getDay(active.id)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeIdStr = active.id
    const overId = over.id

    const activeDay = getDay(activeIdStr)
    const targetDay = getDay(overId)

    if (!activeDay || !targetDay || activeDay === targetDay) return

    lastOverDay.current = targetDay

    // Déplacement visuel optimiste vers la nouvelle colonne
    setSessions((prev) => {
      const activeIdx = prev.findIndex((s) => s.id === activeIdStr)
      if (activeIdx === -1) return prev

      const overIdx = prev.findIndex((s) => s.id === overId)
      const newIndex = overIdx === -1
        ? prev.filter((s) => s.day === targetDay).length  // append à la fin
        : overIdx

      const next = prev.map((s, i) =>
        i === activeIdx ? { ...s, day: targetDay } : s
      )

      // Réordonner pour mettre la carte à la bonne position dans la colonne cible
      const fromIdx = next.findIndex((s) => s.id === activeIdStr)
      return arrayMove(next, fromIdx, newIndex)
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const activeIdStr = String(active.id)
    const finalDay = lastOverDay.current

    setActiveId(null)

    if (!over) return

    const overId = over.id
    const currentDay = sessions.find((s) => s.id === activeIdStr)?.day

    // Persister le changement de journée
    if (finalDay && finalDay !== initialSessions.find((s) => s.id === activeIdStr)?.day) {
      moveSession(activeIdStr, finalDay)
    }

    // Réordonner dans la même colonne
    setSessions((prev) => {
      const activeIdx = prev.findIndex((s) => s.id === activeIdStr)
      const overIdx = prev.findIndex((s) => s.id === overId)
      if (activeIdx === -1 || overIdx === -1 || activeIdx === overIdx) return prev
      if (prev[activeIdx].day !== prev[overIdx].day) return prev
      return arrayMove(prev, activeIdx, overIdx)
    })

    lastOverDay.current = null
  }

  const hasFilters = search || typeFilter || statusFilter || roomFilter
  const total = sessions.length
  const confirmed = sessions.filter((s) => s.status === 'confirmed').length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Programmation</h1>
          <p className="text-gray-500 text-sm mt-0.5">GÉOMTL 2027 · glisser-déposer pour réorganiser</p>
        </div>
        {peutModifier && <Link
          href="/admin/programme/new"
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Nouvelle session
        </Link>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: total },
          { label: 'Confirmées', value: confirmed },
          ...DAYS.map((d) => ({ label: d.label, value: sessions.filter((s) => s.day === d.id).length })),
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Session, conférencier…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <select className={selectClass} value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
          <option value="">Toutes les salles</option>
          {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as SessionType | '')}>
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SessionStatus | '')}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); setRoomFilter('') }}
            className="text-xs text-gray-500 hover:text-white px-3 py-2 transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">Aucune session trouvée.</div>
      ) : (
        <Droits.Provider value={droits}>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {DAYS.map((day) => (
              <DayColumn
                key={day.id}
                day={day.id}
                label={day.label}
                sessions={grouped[day.id]}
                isOver={overDay === day.id && activeId !== null}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeSession && <SessionCard session={activeSession} overlay />}
          </DragOverlay>
        </DndContext>
        </Droits.Provider>
      )}

      {hasFilters && (
        <p className="text-xs text-gray-600 mt-4">
          {filtered.length} session{filtered.length !== 1 ? 's' : ''} sur {sessions.length}
        </p>
      )}
    </div>
  )
}
