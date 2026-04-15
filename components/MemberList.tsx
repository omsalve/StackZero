'use client'
import { motion } from 'framer-motion'

type Member = { userId: string; userName: string; role: string }

const ROLE_COLORS: Record<string, string> = {
  owner:  'text-amber-400',
  admin:  'text-indigo-400',
  member: 'text-zinc-500',
}

export function MemberList({ members }: { members: Member[] }) {
  if (!members.length) {
    return <p className="text-zinc-600 text-sm">No members yet.</p>
  }

  return (
    <div className="space-y-2">
      {members.map((m, i) => (
        <motion.div
          key={m.userId}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900/50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 font-medium shrink-0">
            {(m.userName ?? 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300 truncate">{m.userName ?? 'Unknown'}</p>
            <p className={`text-[11px] font-mono ${ROLE_COLORS[m.role] ?? ROLE_COLORS.member}`}>
              {m.role}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
