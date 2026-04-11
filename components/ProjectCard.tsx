'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Props = {
  project: {
    id: string
    title: string
    description: string
    stack: string[]
    status: string
    members: { userId?: string; user?: { name: string; avatar?: string | null } }[]
    _count: { contributions: number }
  }
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  ARCHIVED: 'bg-zinc-700/50 text-zinc-500',
  PLANNING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

export function ProjectCard({ project }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group relative block p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 transition-all duration-300
          hover:border-zinc-700 hover:bg-zinc-900/80
          before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300
          before:bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.07),transparent_60%)]
          hover:before:opacity-100"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-zinc-200 group-hover:text-white transition-colors text-[15px] pr-3">
            {project.title}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${STATUS_STYLES[project.status] ?? STATUS_STYLES.ARCHIVED}`}>
            {project.status.toLowerCase()}
          </span>
        </div>

        <p className="text-zinc-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex gap-1.5 flex-wrap mb-5">
          {project.stack?.map((tech) => (
            <span key={tech} className="text-[11px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-500 font-mono border border-zinc-700/50">
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-700">
          <div className="flex -space-x-1.5">
            {Array.from({ length: Math.min(project.members.length, 4) }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[9px] text-zinc-400"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {project.members.length > 4 && (
              <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[9px] text-zinc-500">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <span className="tabular-nums">{project._count.contributions} contributions</span>
        </div>
      </Link>
    </motion.div>
  )
}