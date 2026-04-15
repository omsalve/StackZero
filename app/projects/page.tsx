import { prisma } from '@/lib/prisma'
import { Nav } from '@/components/Nav'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectsGrid } from '@/components/ProjectsGrid'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: { select: { userId: true, role: true } },
      _count: { select: { contributions: true } },
    },
  })

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">projects</p>
          <h1 className="text-3xl font-semibold mb-2">All projects</h1>
          <p className="text-zinc-500 text-sm">
            {projects.length} active initiative{projects.length !== 1 ? 's' : ''} in the system
          </p>
        </div>

        <ProjectsGrid projects={projects} />
      </main>
    </>
  )
}
