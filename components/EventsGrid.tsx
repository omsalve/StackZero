'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Event = {
  id: string
  title: string
  description: string
  date: Date | string
  location: string
  capacity: number
  tags: string[]
  _count: { registrations: number }
}

function formatDate(d: Date | string) {
  const date = new Date(d)
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  }
}

function EventCard({
  event,
  registered: initiallyRegistered,
}: {
  event: Event
  registered: boolean
}) {
  const { userId, userName } = useAuth()
  const [registered, setRegistered] = useState(initiallyRegistered)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const d = formatDate(event.date)
  const isFull = event._count.registrations >= event.capacity
  const isPast = new Date(event.date) < new Date()

  async function toggleRegister() {
    if (!userId) return
    setLoading(true)
    await fetch(`/api/events/${event.id}/register`, {
      method: registered ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName }),
    })
    setRegistered(!registered)
    setLoading(false)
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/40
        hover:border-zinc-700 hover:bg-zinc-900/70 transition-all duration-300
        before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300
        before:bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent_60%)]
        hover:before:opacity-100"
    >
      {/* Date block */}
      <div className="shrink-0 w-12 flex flex-col items-center pt-0.5">
        <span className="text-[10px] text-zinc-600 font-mono uppercase">{d.day}</span>
        <span className="text-2xl font-bold text-white leading-none">{d.date}</span>
        <span className="text-[11px] text-zinc-500 uppercase">{d.month}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <Link href={`/events/${event.id}`} className="text-[15px] font-medium text-zinc-200 hover:text-white transition-colors">
              {event.title}
            </Link>
            <p className="text-xs text-zinc-600 mt-0.5">{d.time} · {event.location}</p>
          </div>

          {!isPast && (
            <button
              onClick={toggleRegister}
              disabled={loading || !userId || (isFull && !registered)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                registered
                  ? 'border border-zinc-700 text-zinc-400 hover:border-red-800 hover:text-red-400'
                  : isFull
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {loading ? '...' : registered ? 'Registered ✓' : isFull ? 'Full' : 'Register'}
            </button>
          )}
          {isPast && (
            <span className="shrink-0 text-xs text-zinc-600 font-mono">past</span>
          )}
        </div>

        <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{event.description}</p>

        <div className="flex items-center gap-3">
          {event.tags.map(tag => (
            <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50">
              {tag}
            </span>
          ))}
          <span className="text-[11px] text-zinc-600 ml-auto">
            {event._count.registrations}/{event.capacity} spots
          </span>
        </div>
      </div>
    </motion.div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

export function EventsGrid({
  events,
  registeredIds,
}: {
  events: Event[]
  registeredIds: Set<string>
}) {
  if (!events.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-zinc-600 text-sm font-mono">no events scheduled</p>
        <p className="text-zinc-700 text-xs mt-2">Run the seed script to populate demo data.</p>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {events.map(e => (
        <motion.div key={e.id} variants={item}>
          <EventCard event={e} registered={registeredIds.has(e.id)} />
        </motion.div>
      ))}
    </motion.div>
  )
}
