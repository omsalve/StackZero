'use client'

import { use, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { EventRegisterButton } from '@/components/EventRegisterButton'

type Event = {
  id: string
  title: string
  description: string
  date: string
  location: string
  capacity: number
  tags: string[]
  registrationCount: number
}

type Registration = { userId: string; userName: string }

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { userId } = useAuth()

  const [event,     setEvent]     = useState<Event | null | 'loading'>('loading')
  const [regs,      setRegs]      = useState<Registration[]>([])

  useEffect(() => {
    getDoc(doc(db, 'events', id)).then(d => {
      if (!d.exists()) { setEvent(null); return }
      const data = d.data()
      setEvent({
        id:                d.id,
        title:             data.title,
        description:       data.description,
        date:              data.date?.toDate?.()?.toISOString() ?? null,
        location:          data.location,
        capacity:          data.capacity,
        tags:              data.tags              ?? [],
        registrationCount: data.registrationCount ?? 0,
      })
    })
  }, [id])

  // Real-time registrations listener
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'eventRegistrations'), where('eventId', '==', id)),
      snap => setRegs(snap.docs.map(d => {
        const r = d.data()
        return { userId: r.userId, userName: r.userName ?? 'Unknown' }
      })),
    )
  }, [id])

  if (event === 'loading') {
    return (
      <>
        <Nav />
        <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
          <p className="text-zinc-600 text-sm font-mono">loading…</p>
        </main>
      </>
    )
  }

  if (!event) return notFound()

  const registered = userId ? regs.some(r => r.userId === userId) : false
  const isFull     = regs.length >= event.capacity
  const isPast     = new Date(event.date) < new Date()

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <p className="text-xs text-zinc-600 font-mono mb-3">event / {event.id.slice(0, 8)}</p>

        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-3">{event.title}</h1>
            <p className="text-zinc-400 leading-relaxed">{event.description}</p>
          </div>
          {!isPast && (
            <EventRegisterButton eventId={event.id} initiallyRegistered={registered} isFull={isFull} />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'date',     value: new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
            { label: 'location', value: event.location },
            { label: 'capacity', value: `${regs.length} / ${event.capacity}` },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
              <p className="text-sm font-medium text-zinc-200">{s.value}</p>
              <p className="text-[11px] text-zinc-600 font-mono">{s.label}</p>
            </div>
          ))}
        </div>

        {event.tags.length > 0 && (
          <div className="flex gap-2 mb-10 flex-wrap">
            {event.tags.map(tag => (
              <span key={tag} className="font-mono text-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">{tag}</span>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Attendees ({regs.length})</h2>
          {regs.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {regs.map(r => (
                <div key={r.userId} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/30">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-300 font-medium shrink-0">
                    {(r.userName)[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-400 truncate">{r.userName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm py-8 text-center">No attendees yet. Be the first.</p>
          )}
        </div>
      </main>
    </>
  )
}
