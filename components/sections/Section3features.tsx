'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

const FEATURES = [
  {
    tag: '01 / PROJECTS',
    title: 'Find your project.\nOwn the build.',
    body: 'Browse active club initiatives, join a team, and start shipping. Every project is tracked — stack, status, members, and every commit.',
    href: '/projects',
    cta: 'Browse projects →',
    visual: <ProjectVisual />,
  },
  {
    tag: '02 / CONTRIBUTIONS',
    title: 'Log what you built.\nGet credit.',
    body: 'Link your GitHub repo and watch commits sync automatically. Or log reviews, fixes, and updates manually. Your work, documented.',
    href: '/dashboard',
    cta: 'See your activity →',
    visual: <ContribVisual />,
  },
  {
    tag: '03 / EVENTS',
    title: 'Build nights.\nPaper reads.\nSprint days.',
    body: 'Register for club events, track who\'s coming, and show up. No spreadsheets. No forms. Just click and go.',
    href: '/events',
    cta: 'View upcoming events →',
    visual: <EventsVisual />,
  },
]

function ProjectVisual() {
  const items = [
    { title: 'ML Replication Lab', stack: ['Python', 'PyTorch'], status: 'active', members: 4 },
    { title: 'Campus DevOps Infra', stack: ['K8s', 'Docker'], status: 'active', members: 2 },
    { title: 'OS Contribution Tracker', stack: ['React', 'GraphQL'], status: 'planning', members: 1 },
  ]
  return (
    <div className="space-y-2.5 w-full">
      {items.map((p, i) => (
        <motion.div
          key={p.title}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.5 }}
          className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/60"
        >
          <div>
            <p className="text-sm text-zinc-200 font-medium">{p.title}</p>
            <div className="flex gap-1.5 mt-1">
              {p.stack.map(s => (
                <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded border border-zinc-700/50">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {p.status}
            </span>
            <span className="text-[11px] text-zinc-600">{p.members} members</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ContribVisual() {
  const commits = [
    { user: 'aryan', msg: 'feat: add contribution batch sync', type: 'commit', time: '2m ago' },
    { user: 'priya', msg: 'review: tighten API param types', type: 'review', time: '14m ago' },
    { user: 'dev', msg: 'fix: resolve PVC crash on restart', type: 'fix', time: '1h ago' },
    { user: 'riya', msg: 'update: switch to HF Trainer', type: 'update', time: '3h ago' },
  ]
  const TYPE_CLR: Record<string, string> = {
    commit: 'text-emerald-400 bg-emerald-500/10',
    review: 'text-blue-400 bg-blue-500/10',
    fix: 'text-red-400 bg-red-500/10',
    update: 'text-zinc-400 bg-zinc-800',
  }
  return (
    <div className="w-full space-y-2">
      {commits.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-300 font-medium shrink-0">
            {c.user[0].toUpperCase()}
          </div>
          <p className="flex-1 text-xs text-zinc-400 truncate">{c.msg}</p>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${TYPE_CLR[c.type]}`}>{c.type}</span>
          <span className="text-[10px] text-zinc-700 shrink-0 tabular-nums">{c.time}</span>
        </motion.div>
      ))}
    </div>
  )
}

function EventsVisual() {
  const events = [
    { day: '23', month: 'APR', title: 'Build Night #12 — Systems', capacity: '12/40', tags: ['systems', 'rust'] },
    { day: '27', month: 'APR', title: 'ML Reading Group', capacity: '8/25', tags: ['ml', 'transformers'] },
    { day: '02', month: 'MAY', title: 'Open Source Sprint Day', capacity: '18/60', tags: ['oss'] },
  ]
  return (
    <div className="w-full space-y-2.5">
      {events.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.45 }}
          className="flex items-center gap-4 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/60"
        >
          <div className="shrink-0 text-center w-10">
            <p className="text-xl font-bold text-white leading-none">{e.day}</p>
            <p className="text-[9px] text-zinc-600 font-mono">{e.month}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-200 font-medium truncate">{e.title}</p>
            <div className="flex gap-1.5 mt-1">
              {e.tags.map(t => (
                <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded">{t}</span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-zinc-600 font-mono shrink-0">{e.capacity} spots</span>
        </motion.div>
      ))}
    </div>
  )
}

function FeatureBlock({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const isEven = index % 2 === 0

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-12 items-center py-24 border-t border-zinc-900 ${isEven ? '' : 'md:grid-flow-dense'}`}
    >
      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={isEven ? '' : 'md:col-start-2'}
      >
        <p className="text-[10px] font-mono text-zinc-600 tracking-[0.25em] uppercase mb-5">{feature.tag}</p>
        <h3 className="text-4xl font-semibold leading-[1.1] tracking-tight mb-6 whitespace-pre-line">
          {feature.title}
        </h3>
        <p className="text-zinc-500 text-lg leading-relaxed mb-8 max-w-md">{feature.body}</p>
        <Link
          href={feature.href}
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors group"
        >
          {feature.cta}
        </Link>
      </motion.div>

      {/* Visual */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={`p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm ${isEven ? '' : 'md:col-start-1 md:row-start-1'}`}
        style={{
          background: 'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.05) 0%, transparent 60%), rgba(9,9,11,0.8)',
        }}
      >
        {feature.visual}
      </motion.div>
    </div>
  )
}

export function Section3Features() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-32">
      {FEATURES.map((f, i) => (
        <FeatureBlock key={f.tag} feature={f} index={i} />
      ))}
    </section>
  )
}