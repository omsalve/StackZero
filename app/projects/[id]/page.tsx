'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { collection, doc, getDoc, getDocs, getCountFromServer, onSnapshot, query, where, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { JoinButton } from '@/components/JoinButton'
import { ContributionFeed } from '@/components/ContributionFeed'
import { AddContribution } from '@/components/AddContribution'
import { MemberList } from '@/components/MemberList'
import { useAuth } from '@/lib/auth-context'

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
  githubRepoUrl?: string
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
  const { githubHandle } = useAuth()

  const [project,            setProject]            = useState<Project | null | 'loading'>('loading')
  const [members,            setMembers]            = useState<Member[]>([])
  const [contributions,      setContributions]      = useState<Contribution[]>([])
  const [totalContributions, setTotalContributions] = useState<number | null>(null)

  // GitHub Sync States
  const [repoUrl, setRepoUrl]             = useState('')
  const [isEditingRepo, setIsEditingRepo] = useState(false)
  const [isSyncing, setIsSyncing]         = useState(false)
  const [syncMessage, setSyncMessage]     = useState('')
  const [userRepos, setUserRepos] = useState<{name: string, html_url: string}[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [githubSearchHandle, setGithubSearchHandle] = useState('')

  // Load project doc + accurate contribution count once
  useEffect(() => {
    Promise.all([
      getDoc(doc(db, 'projects', id)),
      getCountFromServer(query(collection(db, 'contributions'), where('projectId', '==', id))),
    ]).then(([d, countSnap]) => {
      if (!d.exists()) { setProject(null); return }
      const data = d.data()
      setProject({
        id:                d.id,
        title:             data.title,
        description:       data.description,
        stack:             data.stack            ?? [],
        status:            data.status           ?? 'ACTIVE',
        ownerId:           data.ownerId,
        ownerName:         data.ownerName,
        memberCount:       data.memberCount      ?? 0,
        contributionCount: data.contributionCount ?? 0,
        githubRepoUrl:     data.githubRepoUrl,
      })
      setTotalContributions(countSnap.data().count)
      if (data.githubRepoUrl) setRepoUrl(data.githubRepoUrl)
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

  async function handleSaveRepo() {
    if (!repoUrl.includes('github.com')) return
    try {
      await updateDoc(doc(db, 'projects', id), { githubRepoUrl: repoUrl })
      setProject(p => p !== 'loading' && p ? { ...p, githubRepoUrl: repoUrl } : p)
      setIsEditingRepo(false)
    } catch (e) {
      console.error('Failed to save repo:', e)
    }
  }

  async function handleSyncCommits() {
    if (!project || project === 'loading') return
    setIsSyncing(true)
    setSyncMessage('')
    try {
      const res = await fetch(`/api/projects/${project.id}/sync-github`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      setSyncMessage(`Synced ${data.count} commits!`)
    } catch (e: any) {
      setSyncMessage(e.message || 'Error syncing commits')
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncMessage(''), 4000)
    }
  }

  // Compute commit counts grouped by GitHub username
  const contributorStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of contributions) {
      if (c.type === 'github_commit' && c.userName) {
        counts[c.userName] = (counts[c.userName] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([handle, count]) => ({ handle, count }))
      .sort((a, b) => b.count - a.count)
  }, [contributions])

  const [feedTab, setFeedTab] = useState<'feed' | 'contributors'>('feed')

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

  function ContributorLeaderboard({
    stats,
    myHandle,
  }: {
    stats: { handle: string; count: number }[]
    myHandle: string | null
  }) {
    if (stats.length === 0) {
      return (
        <p className="text-zinc-600 text-sm py-8 text-center font-mono">
          No GitHub commits synced yet.
        </p>
      )
    }

    const max = stats[0].count

    return (
      <div className="space-y-3">
        {stats.map((s, i) => {
          const isMe = myHandle && s.handle.toLowerCase() === myHandle.toLowerCase()
          const pct  = Math.round((s.count / max) * 100)

          return (
            <div key={s.handle} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-700 font-mono w-4">{i + 1}</span>
                  <a
                    href={`https://github.com/${s.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-zinc-300 hover:text-white transition-colors font-mono"
                  >
                    {s.handle}
                  </a>
                  {isMe && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 font-medium">
                      you
                    </span>
                  )}
                </div>
                <span className={`text-xs font-semibold tabular-nums ${isMe ? 'text-indigo-400' : 'text-zinc-400'}`}>
                  {s.count} {s.count === 1 ? 'commit' : 'commits'}
                </span>
              </div>
              <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isMe ? 'bg-indigo-500' : 'bg-zinc-600'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  async function fetchGithubRepos(handle: string) {
  if (!handle) return
  setIsLoadingRepos(true)
  try {
    // Fetches the user's 10 most recently updated public repositories
    const res = await fetch(`https://api.github.com/users/${handle}/repos?sort=updated&per_page=100&type=public`)
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    setUserRepos(data)
  } catch (error) {
    console.error("Error fetching repos:", error)
    setUserRepos([])
  } finally {
    setIsLoadingRepos(false)
  }
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
            { label: 'contributions', value: totalContributions ?? '—' },
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
            {/* Tab bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                {(['feed', 'contributors'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFeedTab(tab)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-150 ${
                      feedTab === tab
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab === 'feed' ? 'Activity' : 'Contributors'}
                    {tab === 'contributors' && contributorStats.length > 0 && (
                      <span className="ml-1.5 text-[10px] text-zinc-600">
                        {contributorStats.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <AddContribution projectId={project.id} />
            </div>

            {feedTab === 'feed' ? (
              <ContributionFeed contributions={contributions} />
            ) : (
              <ContributorLeaderboard
                stats={contributorStats}
                myHandle={githubHandle}
              />
            )}
          </div>

          <aside>
            {/* GitHub Integration Panel */}
           <div className="mb-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-medium text-zinc-300">GitHub Repository</h2>
    {project.githubRepoUrl && !isEditingRepo && (
      <button onClick={() => setIsEditingRepo(true)} className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
        Edit
      </button>
    )}
  </div>
  
  {project.githubRepoUrl && !isEditingRepo ? (
    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
      <a 
        href={project.githubRepoUrl} 
        target="_blank" 
        rel="noreferrer"
        className="block text-xs font-mono text-indigo-400 hover:text-indigo-300 mb-3 truncate transition-colors"
      >
        {project.githubRepoUrl.replace('https://github.com/', '')}
      </a>
      <button
        onClick={handleSyncCommits}
        disabled={isSyncing}
        className="flex items-center justify-center w-full py-1.5 px-3 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 text-xs text-white transition-all disabled:opacity-50"
      >
        {isSyncing ? 'Syncing...' : 'Pull Latest Commits'}
      </button>
      {syncMessage && (
        <p className={`text-[10px] mt-2 text-center ${syncMessage.includes('failed') || syncMessage.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
          {syncMessage}
        </p>
      )}
    </div>
  ) : (
    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 flex flex-col gap-3">
      {/* Search Input for GitHub Handle */}
      <div className="flex gap-2">
        <input
          value={githubSearchHandle}
          onChange={e => setGithubSearchHandle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchGithubRepos(githubSearchHandle)}
          placeholder="GitHub username..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500/70 transition-colors"
        />
        <button
          onClick={() => fetchGithubRepos(githubSearchHandle)}
          disabled={isLoadingRepos || !githubSearchHandle}
          className="py-1.5 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors disabled:opacity-50"
        >
          Fetch
        </button>
      </div>

      {/* Repository List */}
      {userRepos.length > 0 && (
        <div className="max-h-40 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
          {userRepos.map(repo => (
            <button
              key={repo.name}
              onClick={() => {
                setRepoUrl(repo.html_url)
                // Optionally auto-save right here:
                // updateDoc(doc(db, 'projects', project.id), { githubRepoUrl: repo.html_url })
              }}
              className={`w-full text-left px-2 py-2 rounded text-xs font-mono transition-colors ${
                repoUrl === repo.html_url ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-950/50 text-zinc-400 hover:bg-zinc-800 border border-transparent'
              }`}
            >
              {repo.name}
            </button>
          ))}
        </div>
      )}

      {/* Manual URL fallback & Save actions */}
      <input
        value={repoUrl}
        onChange={e => setRepoUrl(e.target.value)}
        placeholder="Or paste URL directly..."
        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500/70 transition-colors"
      />
      
      <div className="flex gap-2">
        <button
          onClick={handleSaveRepo}
          disabled={!repoUrl.includes('github.com')}
          className="flex-1 py-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-xs text-white transition-colors disabled:opacity-50"
        >
          Save Repository
        </button>
        {isEditingRepo && (
          <button
            onClick={() => { setIsEditingRepo(false); setRepoUrl(project.githubRepoUrl || ''); setUserRepos([]) }}
            className="py-1.5 px-3 rounded border border-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )}
</div>

            <h2 className="text-sm font-medium text-zinc-300 mb-4">Members</h2>
            <MemberList members={members} />
          </aside>
        </div>
      </main>
    </>
  )
}