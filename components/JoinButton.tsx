'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth-context'

export function JoinButton({ projectId, members }: {
  projectId: string
  members: { userId: string }[]
}) {
  const { userId, userName } = useAuth()
  const isMember = members.some(m => m.userId === userId)
  const [joined, setJoined] = useState(isMember)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!userId) return
    setLoading(true)
    await fetch(`/api/projects/${projectId}/members`, {
      method: joined ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName }),
    })
    setJoined(!joined)
    setLoading(false)
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={toggle}
      disabled={loading || !userId}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        joined
          ? 'border border-zinc-700 text-zinc-400 hover:border-red-800 hover:text-red-400'
          : 'bg-indigo-600 text-white hover:bg-indigo-500'
      }`}
    >
      {loading ? '...' : joined ? 'Leave project' : 'Join project'}
    </motion.button>
  )
}