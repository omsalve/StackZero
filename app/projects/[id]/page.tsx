import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { JoinButton } from '@/components/JoinButton'
import { ContributionFeed } from '@/components/ContributionFeed'
import { AddContribution } from '@/components/AddContribution'
import { MemberList } from '@/components/MemberList'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  ARCHIVED: 'bg-zinc-700/50 text-zinc-500',
  PLANNING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      contributions: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      _count: { select: { contributions: true, members: true } },
    },
  })

  if (!project) notFound()

  const members = project.members.map(m => ({
    userId: m.userId,
    userName: m.user.name,
    role: m.role,
  }))

  const contributions = project.contributions.map(c => ({
    id: c.id,
    message: c.message,
    type: c.type as string,
    createdAt: c.createdAt,
    userName: c.user.name,
  }))

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-600 font-mono mb-2">project / {project.id.slice(0, 8)}</p>
            <h1 className="text-3xl font-semibold mb-3">{project.title}</h1>
            <p className="text-zinc-400 leading-relaxed">{project.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[project.status] ?? STATUS_STYLES.ARCHIVED}`}>
              {project.status.toLowerCase()}
            </span>
            <JoinButton projectId={project.id} members={members} />
          </div>
        </div>

        {/* Tech stack */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {project.stack.map(t => (
            <span key={t} className="font-mono text-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
              {t}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'members', value: project._count.members },
            { label: 'contributions', value: project._count.contributions },
            { label: 'owner', value: project.owner.name },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
              <p className="text-lg font-semibold text-white">{s.value}</p>
              <p className="text-[11px] text-zinc-600 font-mono">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Body: feed + members */}
        <div className="grid md:grid-cols-[1fr_260px] gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-300">Activity feed</h2>
              <AddContribution projectId={project.id} />
            </div>
            <ContributionFeed contributions={contributions} />
          </div>

          <aside>
            <h2 className="text-sm font-medium text-zinc-300 mb-4">Members</h2>
            <MemberList members={members} />
          </aside>
        </div>
      </main>
    </>
  )
}
