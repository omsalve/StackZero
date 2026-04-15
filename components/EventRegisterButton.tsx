'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function EventRegisterButton({
  eventId,
  initiallyRegistered,
  isFull,
}: {
  eventId: string
  initiallyRegistered: boolean
  isFull: boolean
}) {
  const { userId, userName } = useAuth()
  const [registered, setRegistered] = useState(initiallyRegistered)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    if (!userId) return
    setLoading(true)
    await fetch(`/api/events/${eventId}/register`, {
      method: registered ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName }),
    })
    setRegistered(!registered)
    setLoading(false)
    router.refresh()
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={toggle}
      disabled={loading || !userId || (isFull && !registered)}
      className={`shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        registered
          ? 'border border-zinc-700 text-zinc-400 hover:border-red-800 hover:text-red-400'
          : isFull
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
      }`}
    >
      {loading ? '...' : registered ? 'Registered ✓' : isFull ? 'Event full' : 'Register'}
    </motion.button>
  )
}
