import { adminDb } from '@/lib/firebase-admin'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { JoinButton } from '@/components/JoinButton'
import { ContributionFeed } from '@/components/ContributionFeed'
import { AddContribution } from '@/components/AddContribution'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const [projectDoc, membersSnap, contribSnap] = await Promise.all([
    adminDb.doc(`projects/${params.id}`).get(),
    adminDb.collection(`projects/${params.id}/members`).get(),
    adminDb.collection(`projects/${params.id}/contributions`).orderBy('createdAt', 'desc').limit(30).get()
  ])

  if (!projectDoc.exists) notFound()

  const project = { id: projectDoc.id, ...projectDoc.data() } as any
  const members = membersSnap.docs.map(m => ({ userId: m.id, ...m.data() }))
  const contributions = contribSnap.docs.map(c => ({
    id: c.id,
    ...c.data(),
    createdAt: c.data().createdAt?.toDate?.() ?? new Date()
  }))

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs text-zinc-600 font-mono mb-2">project</p>
            <h1 className="text-3xl font-semibold mb-3">{project.title}</h1>
            <p className="text-zinc-400 max-w-xl">{project.description}</p>
          </div>
          <JoinButton projectId={params.id} members={members} />
        </div>

        <div className="flex gap-2 mb-10 flex-wrap">
          {project.stack?.map((t: string) => (
            <span key={t} className="font-mono text-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">{t}</span>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_260px] gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-300">Activity feed</h2>
              <AddContribution projectId={params.id} />
            </div>
            <ContributionFeed contributions={contributions as any} />
          </div>

          <aside>
            <h2 className="text-sm font-medium text-zinc-300 mb-4">Members</h2>
            <div className="space-y-3">
              {members.map((m: any) => (
                <div key={m.userId} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 font-medium">
                    {(m.userName ?? 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">{m.userName ?? 'Unknown'}</p>
                    <p className="text-xs text-zinc-600">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}