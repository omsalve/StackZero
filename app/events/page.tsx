'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { Nav } from '@/components/Nav'
import { EventsGrid } from '@/components/EventsGrid'

type Event = {
  id: string
  title: string
  description: string
  date: string
  location: string
  capacity: number
  tags: string[]
  _count: { registrations: number }
}

export default function EventsPage() {
  const { userId } = useAuth()
  const [events,        setEvents]        = useState<Event[]>([])
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    getDocs(query(collection(db, 'events'), orderBy('date', 'asc')))
      .then(snap => {
        setEvents(snap.docs.map(d => {
          const data = d.data()
          return {
            id:          d.id,
            title:       data.title,
            description: data.description,
            date:        data.date?.toDate?.()?.toISOString() ?? null,
            location:    data.location,
            capacity:    data.capacity,
            tags:        data.tags ?? [],
            _count:      { registrations: data.registrationCount ?? 0 },
          }
        }))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!userId) { setRegisteredIds(new Set()); return }
    getDocs(query(collection(db, 'eventRegistrations'), where('userId', '==', userId)))
      .then(snap => setRegisteredIds(new Set(snap.docs.map(d => d.data().eventId))))
  }, [userId])

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">events</p>
          <h1 className="text-3xl font-semibold mb-2">Upcoming events</h1>
          <p className="text-zinc-500 text-sm">
            {loading ? '—' : `${events.length} event${events.length !== 1 ? 's' : ''} scheduled`}
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <p className="text-zinc-600 text-sm font-mono">loading…</p>
          </div>
        ) : (
          <EventsGrid events={events} registeredIds={registeredIds} />
        )}
      </main>
    </>
  )
}
