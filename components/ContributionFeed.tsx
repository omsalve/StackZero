'use client'
import { motion } from 'framer-motion'

const TYPE_STYLES: Record<string, string> = {
  commit: 'text-emerald-400 bg-emerald-500/10',
  review: 'text-blue-400 bg-blue-500/10',
  fix:    'text-red-400 bg-red-500/10',
  update: 'text-zinc-400 bg-zinc-800',
}

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

type Contribution = {
  id: string
  message: string
  type: string
  createdAt: string | Date
  userName?: string
  user?: { name: string }
}

export function ContributionFeed({ contributions }: { contributions: Contribution[] }) {
  if (!contributions.length) {
    return <p className="text-zinc-600 text-sm py-8 text-center">No contributions yet. Be the first.</p>
  }

  return (
    <div>
      {contributions.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="flex gap-3 py-3 border-b border-zinc-800/60 last:border-0"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-medium text-zinc-400">
                {c.userName ?? c.user?.name ?? 'Unknown'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${TYPE_STYLES[c.type] ?? TYPE_STYLES.update}`}>
                {c.type}
              </span>
            </div>
            <p className="text-sm text-zinc-300">{c.message}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{timeAgo(c.createdAt)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}