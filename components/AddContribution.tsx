'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const TYPES = ['commit', 'review', 'fix', 'update']

export function AddContribution({ projectId }: { projectId: string }) {
  const { userId, userName } = useAuth()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('commit')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    if (!message.trim() || !userId) return
    setLoading(true)
    await fetch('/api/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName, projectId, message, type })
    })
    setMessage('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 border border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
      >
        + Add contribution
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="font-medium mb-4">Log contribution</h3>

              <div className="flex gap-2 mb-4">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-colors ${
                      type === t ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What did you do? Be specific."
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-500 mb-4"
                rows={3}
              />

              <div className="flex gap-2 justify-end">
                <button onClick={() => setOpen(false)} className="text-sm text-zinc-500 hover:text-white px-4 py-2 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={loading || !message.trim()}
                  className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                >
                  {loading ? 'Saving...' : 'Log it'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}