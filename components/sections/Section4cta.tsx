'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

const STATS = [
  { value: 'Real projects', sub: 'not toy exercises' },
  { value: 'GitHub-synced', sub: 'commits auto-tracked' },
  { value: 'Zero fluff', sub: 'just code and shipping' },
  { value: 'One OS', sub: 'for your whole club' },
]

export function Section4CTA() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative overflow-hidden border-t border-zinc-900">
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 py-32" ref={ref}>
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.value}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30"
            >
              <p className="text-lg font-semibold text-zinc-100 mb-1">{s.value}</p>
              <p className="text-xs text-zinc-600 font-mono">{s.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-center"
        >
          <p className="text-[10px] font-mono text-zinc-600 tracking-[0.25em] uppercase mb-6">
            Built for software engineering clubs
          </p>
          <h2 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
            Stop planning.
            <br />
            <span className="text-zinc-500">Start shipping.</span>
          </h2>
          <p className="text-zinc-500 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            StackZero gives your club one place to find projects, log work, and show up.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Get started free
            </Link>
            <Link
              href="/projects"
              className="px-6 py-3 border border-zinc-700 text-sm text-zinc-300 rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
            >
              Browse projects
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}