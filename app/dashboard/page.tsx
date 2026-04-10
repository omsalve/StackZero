import { adminDb } from '@/lib/firebase-admin'
import { Nav } from '@/components/Nav'
import { ContributionFeed } from '@/components/ContributionFeed'
import { ProjectCard } from '@/components/ProjectCard'

export default async function DashboardPage() {
  // Fetches first user as demo — replace with session once auth is wired
  const usersSnap = await adminDb.collection('users').limit(1).get()
  if (usersSnap.empty) return <div className="p-20 text-zinc-500">Run seed first.</div>

  const userDoc = usersSnap.docs[0]
  const user = { id: userDoc.id, ...userDoc.data() } as any

  // Find all projects where this user is a member
  const projectsSnap = await adminDb.collection('projects').get()
  const memberships = (await Promise.all(
    projectsSnap.docs.map(async doc => {
      const memberDoc = await adminDb.doc(`projects/${doc.id}/members/${user.id}`).get()
      if (!memberDoc.exists) return null
      const [membersSnap, contribCount] = await Promise.all([
        adminDb.collection(`projects/${doc.id}/members`).get(),
        adminDb.collection(`projects/${doc.id}/contributions`).count().get()
      ])
      return {
        id: doc.id,
        ...doc.data(),
        members: membersSnap.docs.map(m => ({ userId: m.id })),
        _count: { contributions: contribCount.data().count }
      }
    })
  )).filter(Boolean)

  // Fetch recent contributions across all projects for this user
  const allContribs: any[] = []
  for (const doc of projectsSnap.docs) {
    const snap = await adminDb
      .collection(`projects/${doc.id}/contributions`)
      .where('userId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
    snap.docs.forEach(c => allContribs.push({
      id: c.id,
      ...c.data(),
      createdAt: c.data().createdAt?.toDate?.() ?? new Date()
    }))
  }
  allContribs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">dashboard</p>
          <h1 className="text-3xl font-semibold">{user.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">{user.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Projects', value: memberships.length },
            { label: 'Contributions', value: allContribs.length },
            { label: 'Role', value: 'member' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <p className="text-2xl font-semibold mb-1">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-4">Your projects</h2>
            <div className="space-y-3">
              {memberships.map((p: any) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-4">Recent activity</h2>
            <ContributionFeed contributions={allContribs} />
          </div>
        </div>
      </main>
    </>
  )
}