import { requireUser } from '@/lib/get-user'
import { prisma } from '@/lib/prisma'
import { Nav } from '@/components/Nav'
import { ContributionFeed } from '@/components/ContributionFeed'
import { ProjectCard } from '@/components/ProjectCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await requireUser()

  const [memberships, contributions, upcomingRegs] = await Promise.all([
    prisma.projectMember.findMany({
      where: { userId: user.id },
      include: {
        project: {
          include: {
            members: { select: { userId: true, role: true } },
            _count:  { select: { contributions: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    }),
    prisma.contribution.findMany({
      where: { userId: user.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.eventRegistration.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { event: { date: 'asc' } },
      take: 3,
    }),
  ])

  const projects = memberships.map(m => m.project)
  const feed = contributions.map(c => ({
    id: c.id, message: c.message, type: c.type as string,
    createdAt: c.createdAt, userName: c.user.name,
  }))

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">

        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">dashboard</p>
          <h1 className="text-3xl font-semibold">{user.name}</h1>
          {user.email && <p className="text-zinc-500 text-sm mt-1">{user.email}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Projects',      value: projects.length },
            { label: 'Contributions', value: contributions.length },
            { label: 'Events',        value: upcomingRegs.length },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <p className="text-2xl font-semibold mb-1">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-400">Your projects</h2>
              <Link href="/projects" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">view all →</Link>
            </div>
            {projects.length ? (
              <div className="space-y-3">
                {projects.slice(0, 4).map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            ) : (
              <div className="py-12 text-center rounded-xl border border-zinc-800/50 border-dashed">
                <p className="text-zinc-600 text-sm">No projects yet.</p>
                <Link href="/projects" className="text-xs text-indigo-500 hover:text-indigo-400 mt-2 inline-block">Browse projects →</Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-4">Recent activity</h2>
            {feed.length ? (
              <ContributionFeed contributions={feed} />
            ) : (
              <div className="py-12 text-center rounded-xl border border-zinc-800/50 border-dashed">
                <p className="text-zinc-600 text-sm">No contributions yet.</p>
                <p className="text-zinc-700 text-xs mt-1">Join a project and start logging work.</p>
              </div>
            )}
          </div>
        </div>

        {upcomingRegs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-400">Registered events</h2>
              <Link href="/events" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">view all →</Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {upcomingRegs.map(({ event }) => (
                <Link key={event.id} href={`/events/${event.id}`}
                  className="block p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors">
                  <p className="text-sm font-medium text-zinc-200 mb-1">{event.title}</p>
                  <p className="text-xs text-zinc-600">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-zinc-700 mt-0.5">{event.location}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
