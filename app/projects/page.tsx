'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Nav } from '@/components/Nav'
import { ProjectsGrid } from '@/components/ProjectsGrid'

type Project = {
  id: string
  title: string
  description: string
  stack: string[]
  status: string
  members: { userId: string; role: string }[]
  _count: { contributions: number }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc')))
      .then(snap => {
        setProjects(snap.docs.map(d => {
          const data = d.data()
          return {
            id:          d.id,
            title:       data.title,
            description: data.description,
            stack:       data.stack  ?? [],
            status:      data.status ?? 'ACTIVE',
            // pass a stub array sized to memberCount so ProjectCard's avatar grid renders correctly
            members:     Array(data.memberCount ?? 0).fill({ userId: 'x', role: 'member' }),
            _count:      { contributions: data.contributionCount ?? 0 },
          }
        }))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">projects</p>
          <h1 className="text-3xl font-semibold mb-2">All projects</h1>
          <p className="text-zinc-500 text-sm">
            {loading ? '—' : `${projects.length} active initiative${projects.length !== 1 ? 's' : ''} in the system`}
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <p className="text-zinc-600 text-sm font-mono">loading…</p>
          </div>
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </main>
    </>
  )
}
