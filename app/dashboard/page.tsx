'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, doc, getDoc, getDocs, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { Nav } from '@/components/Nav'
import { ContributionFeed } from '@/components/ContributionFeed'
import { ProjectCard } from '@/components/ProjectCard'
import Link from 'next/link'

type Project = {
  id: string; title: string; description: string; stack: string[]
  status: string; members: { userId: string; role: string }[]; _count: { contributions: number }
}
type Contribution = { id: string; message: string; type: string; createdAt: string; userName: string }
type EventReg     = { eventId: string; eventTitle: string; eventDate: string; eventLocation: string }

export default function DashboardPage() {
  const { user, userId, userName, loading: authLoading } = useAuth()
  const router = useRouter()

  const [projects,           setProjects]           = useState<Project[]>([])
  const [contributions,      setContributions]      = useState<Contribution[]>([])
  const [totalContributions, setTotalContributions] = useState(0)
  const [eventRegs,          setEventRegs]          = useState<EventReg[]>([])
  const [dataLoading,        setDataLoading]        = useState(true)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !userId) router.push('/auth/login')
  }, [authLoading, userId, router])

  // Fetch dashboard data once userId is known
  useEffect(() => {
    if (!userId) return
    setDataLoading(true)

    async function loadDashboard() {
      // 1. Memberships → load each project doc
      const memberSnap = await getDocs(
        query(collection(db, 'projectMembers'), where('userId', '==', userId)),
      )
      const projectIds = memberSnap.docs.map(d => d.data().projectId as string)

      const [projectDocs, eventSnap] = await Promise.all([
        projectIds.length
          ? Promise.all(projectIds.map(pid => getDoc(doc(db, 'projects', pid))))
          : Promise.resolve([]),
        getDocs(query(collection(db, 'eventRegistrations'), where('userId', '==', userId))),
      ])

      const loadedProjects = projectDocs
        .filter(d => d.exists())
        .map(d => {
          const data = d.data()!
          return {
            id:          d.id,
            title:       data.title,
            description: data.description,
            stack:       data.stack  ?? [],
            status:      data.status ?? 'ACTIVE',
            members:     Array(data.memberCount ?? 0).fill({ userId: 'x', role: 'member' }),
            _count:      { contributions: data.contributionCount ?? 0 },
          } as Project
        })

      // 2. Total contributions across all projects — includes GitHub commits
      //    Use getCountFromServer for an accurate count without fetching all docs.
      //    Firestore 'in' supports up to 30 values; slice to be safe.
      let total = 0
      if (projectIds.length) {
        const countSnap = await getCountFromServer(
          query(
            collection(db, 'contributions'),
            where('projectId', 'in', projectIds.slice(0, 30)),
          ),
        )
        total = countSnap.data().count
      }

      // 3. Recent activity feed — all contributions from user's projects
      //    (includes GitHub commits, sorted newest-first)
      let recentContribs: Contribution[] = []
      if (projectIds.length) {
        const contribSnap = await getDocs(
          query(
            collection(db, 'contributions'),
            where('projectId', 'in', projectIds.slice(0, 30)),
          ),
        )
        recentContribs = contribSnap.docs
          .map(d => {
            const c = d.data()
            return {
              id:        d.id,
              message:   c.message,
              type:      c.type,
              userName:  c.userName ?? 'Unknown',
              createdAt: c.createdAt?.toDate?.()?.toISOString() ?? new Date(0).toISOString(),
              _ts:       c.createdAt?.toMillis?.() ?? 0,
            }
          })
          .sort((a, b) => b._ts - a._ts)
          .slice(0, 20)
      }

      // 4. Upcoming event registrations
      const eventRegs = eventSnap.docs
        .map(d => {
          const r = d.data()
          return {
            eventId:       r.eventId,
            eventTitle:    r.eventTitle    ?? 'Event',
            eventDate:     r.eventDate?.toDate?.()?.toISOString() ?? null,
            eventLocation: r.eventLocation ?? '',
            _ts:           r.eventDate?.toMillis?.() ?? 0,
          } as EventReg & { _ts: number }
        })
        .filter(r => r.eventDate && new Date(r.eventDate) >= new Date())
        .sort((a: any, b: any) => a._ts - b._ts)
        .slice(0, 3)

      setProjects(loadedProjects)
      setTotalContributions(total)
      setContributions(recentContribs)
      setEventRegs(eventRegs)
      setDataLoading(false)
    }

    loadDashboard()
  }, [userId])

  if (authLoading || (!userId && !authLoading)) {
    return (
      <>
        <Nav />
        <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
          <div className="py-24 text-center">
            <p className="text-zinc-600 text-sm font-mono">loading…</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">

        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">dashboard</p>
          <h1 className="text-3xl font-semibold">{userName ?? 'Builder'}</h1>
          {user?.email && <p className="text-zinc-500 text-sm mt-1">{user.email}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Projects',      value: dataLoading ? '—' : projects.length },
            { label: 'Contributions', value: dataLoading ? '—' : totalContributions },
            { label: 'Events',        value: dataLoading ? '—' : eventRegs.length },
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
            {dataLoading ? (
              <p className="text-zinc-700 text-sm font-mono">loading…</p>
            ) : projects.length ? (
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
            {dataLoading ? (
              <p className="text-zinc-700 text-sm font-mono">loading…</p>
            ) : contributions.length ? (
              <ContributionFeed contributions={contributions} />
            ) : (
              <div className="py-12 text-center rounded-xl border border-zinc-800/50 border-dashed">
                <p className="text-zinc-600 text-sm">No contributions yet.</p>
                <p className="text-zinc-700 text-xs mt-1">Join a project and start logging work.</p>
              </div>
            )}
          </div>
        </div>

        {!dataLoading && eventRegs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-400">Registered events</h2>
              <Link href="/events" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">view all →</Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {eventRegs.map(reg => (
                <Link key={reg.eventId} href={`/events/${reg.eventId}`}
                  className="block p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors">
                  <p className="text-sm font-medium text-zinc-200 mb-1">{reg.eventTitle}</p>
                  <p className="text-xs text-zinc-600">
                    {reg.eventDate ? new Date(reg.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                  <p className="text-xs text-zinc-700 mt-0.5">{reg.eventLocation}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
