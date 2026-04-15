'use client'
import { motion } from 'framer-motion'
import { ProjectCard } from './ProjectCard'

type Project = {
  id: string
  title: string
  description: string
  stack: string[]
  status: string
  members: { userId: string; role: string }[]
  _count: { contributions: number }
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-zinc-600 text-sm font-mono">no projects yet</p>
        <p className="text-zinc-700 text-xs mt-2">Run the seed script to populate demo data.</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid sm:grid-cols-2 gap-4"
    >
      {projects.map(p => (
        <motion.div key={p.id} variants={item}>
          <ProjectCard project={p} />
        </motion.div>
      ))}
    </motion.div>
  )
}
