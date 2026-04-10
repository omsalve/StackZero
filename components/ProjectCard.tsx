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
    members: { user: { name: string; avatar?: string | null } }[]
    _count: { contributions: number }
  }
}

export function ProjectCard({ project }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="block p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900 transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-white group-hover:text-indigo-300 transition-colors text-[15px]">
            {project.title}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            project.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-zinc-700/50 text-zinc-400'
          }`}>
            {project.status.toLowerCase()}
          </span>
        </div>

        <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {project.stack.map((tech) => (
            <span key={tech} className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
          <span>{project._count.contributions} contributions</span>
        </div>
      </Link>
    </motion.div>
  )
}