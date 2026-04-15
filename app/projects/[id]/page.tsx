'use client'

import { use, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { JoinButton } from '@/components/JoinButton'
import { ContributionFeed } from '@/components/ContributionFeed'
import { AddContribution } from '@/components/AddContribution'
import { MemberList } from '@/components/MemberList'

type Project = {
  id: string
  title: string
  description: string
  stack: string[]
  status: string
  ownerId: string
  ownerName: string
  memberCount: number
  contributionCount: number
}

type Member = { userId: string; userName: string; role: string }
type Contribution = { id: string; message: string; type: string; createdAt: string; userName: string }

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  ARCHIVED: 'bg-zinc-700/50 text-zinc-500',
  PLANNING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [project,       setProject]       = useState<Project | null | 'loading'>('loading')
  const [members,       setMembers]       = useState<Member[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])

  // Load project doc once
  useEffect(() => {
    getDoc(doc(db, 'projects', id)).then(d => {
      if (!d.exists()) { setProject(null); return }
      const data = d.data()
      setProject({
        id:               d.id,
        title:            data.title,
        description:      data.description,
        stack:            data.stack            ?? [],
        status:           data.status           ?? 'ACTIVE',
        ownerId:          data.ownerId,
        ownerName:        data.ownerName,
        memberCount:      data.memberCount      ?? 0,
        contributionCount: data.contributionCount ?? 0,
      })
    })
  }, [id])

  // Real-time members listener
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'projectMembers'), where('projectId', '==', id)),
      snap => setMembers(snap.docs.map(d => {
        const m = d.data()
        return { userId: m.userId, userName: m.userName ?? 'Unknown', role: m.role }
      })),
    )
  }, [id])

  // Real-time contributions listener
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'contributions'), where('projectId', '==', id)),
      snap => {
        const sorted = snap.docs
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
          .slice(0, 50)
        setContributions(sorted)
      },
    )
  }, [id])

  if (project === 'loading') {
    return (
      <>
        <Nav />
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
          <p className="text-zinc-600 text-sm font-mono">loading…</p>
        </main>
      </>
    )
  }

  if (!project) return notFound()

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
            { label: 'members',       value: members.length },
            { label: 'contributions', value: contributions.length },
            { label: 'owner',         value: project.ownerName },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
              <p className="text-lg font-semibold text-white">{s.value}</p>
              <p className="text-[11px] text-zinc-600 font-mono">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Body */}
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
