'use client'
import { motion } from 'framer-motion'

export function DashboardStats({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-10">
          <div className="h-3 w-16 bg-zinc-800 rounded mb-2" />
          <div className="h-8 w-48 bg-zinc-800 rounded mb-2" />
          <div className="h-4 w-32 bg-zinc-800/60 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-900/60 border border-zinc-800" />
          ))}
        </div>
      </div>
    )
  }
  return null
}
