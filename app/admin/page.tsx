'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { Nav } from '@/components/Nav'

// ─── Types ────────────────────────────────────────────────────────────────────

type FSProject = {
  id: string
  title: string
  description: string
  stack: string[]
  status: string
  githubRepoUrl?: string
  memberCount: number
}

type FSUser = {
  uid: string
  displayName: string
  email: string
  avatar: string | null
  githubHandle: string | null
}

type GHRepo = {
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function adminFetch(
  url: string,
  idToken: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...(options.headers ?? {}),
    },
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
      {children}
    </h2>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    ARCHIVED: 'bg-zinc-700/50 text-zinc-500',
    PLANNING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles[status] ?? styles.ARCHIVED}`}>
      {status.toLowerCase()}
    </span>
  )
}

// ─── Create Project Panel ─────────────────────────────────────────────────────

function CreateProjectPanel({
  idToken,
  onCreated,
}: {
  idToken: string
  onCreated: (id: string) => void
}) {
  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [stackInput,   setStackInput]   = useState('')
  const [status,       setStatus]       = useState('ACTIVE')
  const [ghHandle,     setGhHandle]     = useState('')
  const [repos,        setRepos]        = useState<GHRepo[]>([])
  const [repoLoading,  setRepoLoading]  = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<GHRepo | null>(null)
  const [saving,       setSaving]       = useState(false)
  const [msg,          setMsg]          = useState('')

  async function fetchRepos() {
    if (!ghHandle.trim()) return
    setRepoLoading(true)
    setRepos([])
    setSelectedRepo(null)
    try {
      // Fetch up to 100 most-recently-updated public repos
      const res = await fetch(
        `https://api.github.com/users/${ghHandle.trim()}/repos?sort=updated&per_page=100&type=public`,
      )
      if (!res.ok) throw new Error('GitHub user not found')
      const data: GHRepo[] = await res.json()
      setRepos(data)
    } catch (e: any) {
      setMsg(e.message)
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setRepoLoading(false)
    }
  }

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    setMsg('')
    const stack = stackInput.split(',').map(s => s.trim()).filter(Boolean)
    try {
      const res = await adminFetch('/api/admin/create-project', idToken, {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          stack,
          status,
          githubRepoUrl: selectedRepo?.html_url ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg(`Project created! ID: ${data.id}`)
      onCreated(data.id)
      // Reset form
      setTitle('')
      setDescription('')
      setStackInput('')
      setStatus('ACTIVE')
      setGhHandle('')
      setRepos([])
      setSelectedRepo(null)
      setTimeout(() => setMsg(''), 5000)
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
      <SectionHeading>Create New Project</SectionHeading>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: project metadata */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this project do?"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Tech Stack (comma-separated)</label>
            <input
              value={stackInput}
              onChange={e => setStackInput(e.target.value)}
              placeholder="Next.js, TypeScript, Firebase"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors"
            >
              <option value="ACTIVE">Active</option>
              <option value="PLANNING">Planning</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Right: repo picker */}
        <div className="space-y-3">
          <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Link GitHub Repository</label>
          <div className="flex gap-2">
            <input
              value={ghHandle}
              onChange={e => setGhHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRepos()}
              placeholder="GitHub username"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors"
            />
            <button
              onClick={fetchRepos}
              disabled={repoLoading || !ghHandle.trim()}
              className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {repoLoading ? 'Loading…' : 'Fetch Repos'}
            </button>
          </div>

          {repos.length > 0 && (
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {repos.map(repo => (
                <button
                  key={repo.full_name}
                  onClick={() => setSelectedRepo(repo === selectedRepo ? null : repo)}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-colors border ${
                    selectedRepo?.full_name === repo.full_name
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      : 'bg-zinc-950/60 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  <span className="font-mono font-medium">{repo.name}</span>
                  {repo.language && (
                    <span className="ml-2 text-zinc-600">{repo.language}</span>
                  )}
                  {repo.description && (
                    <p className="text-zinc-600 mt-0.5 truncate">{repo.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedRepo && (
            <div className="px-3 py-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 font-mono truncate">
              ✓ {selectedRepo.full_name}
            </div>
          )}

          {!selectedRepo && repos.length === 0 && ghHandle && !repoLoading && (
            <p className="text-xs text-zinc-600 font-mono">No repos found for that username.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        {msg && (
          <p className={`text-xs font-mono ${msg.startsWith('Project') ? 'text-emerald-400' : 'text-red-400'}`}>
            {msg}
          </p>
        )}
        <button
          onClick={handleCreate}
          disabled={saving || !title.trim()}
          className="ml-auto px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Creating…' : 'Create Project'}
        </button>
      </div>
    </div>
  )
}

// ─── Project Management Panel ─────────────────────────────────────────────────

function ProjectManagePanel({
  project,
  users,
  idToken,
}: {
  project: FSProject
  users: FSUser[]
  idToken: string
}) {
  const [members,       setMembers]       = useState<{ userId: string; userName: string; role: string }[]>([])
  const [membersLoaded, setMembersLoaded] = useState(false)
  const [expanded,      setExpanded]      = useState(false)
  const [assigning,     setAssigning]     = useState<string | null>(null)
  const [removing,      setRemoving]      = useState<string | null>(null)
  const [syncing,       setSyncing]       = useState(false)
  const [syncMsg,       setSyncMsg]       = useState('')
  const [ghHandle,      setGhHandle]      = useState('')
  const [repos,         setRepos]         = useState<GHRepo[]>([])
  const [repoLoading,   setRepoLoading]   = useState(false)
  const [selectedRepo,  setSelectedRepo]  = useState<GHRepo | null>(null)
  const [repoMsg,       setRepoMsg]       = useState('')
  const [savingRepo,    setSavingRepo]    = useState(false)
  const [currentRepo,   setCurrentRepo]   = useState(project.githubRepoUrl ?? '')

  const loadMembers = useCallback(async () => {
    const snap = await getDocs(
      query(collection(db, 'projectMembers'), ...[]),
    )
    // Filter client-side since we can't do compound queries without composite index
    const all = snap.docs
      .filter(d => d.data().projectId === project.id)
      .map(d => {
        const m = d.data()
        return { userId: m.userId, userName: m.userName ?? 'Unknown', role: m.role }
      })
    setMembers(all)
    setMembersLoaded(true)
  }, [project.id])

  function toggle() {
    if (!expanded && !membersLoaded) loadMembers()
    setExpanded(e => !e)
  }

  async function assignUser(user: FSUser) {
    setAssigning(user.uid)
    try {
      const res = await adminFetch('/api/admin/assign-member', idToken, {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          userId:    user.uid,
          userName:  user.displayName,
          role:      'member',
          action:    'add',
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setMembers(prev => {
        if (prev.find(m => m.userId === user.uid)) return prev
        return [...prev, { userId: user.uid, userName: user.displayName, role: 'member' }]
      })
    } catch (e: any) {
      console.error(e)
    } finally {
      setAssigning(null)
    }
  }

  async function removeUser(userId: string) {
    setRemoving(userId)
    try {
      const res = await adminFetch('/api/admin/assign-member', idToken, {
        method: 'POST',
        body: JSON.stringify({ projectId: project.id, userId, action: 'remove' }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setMembers(prev => prev.filter(m => m.userId !== userId))
    } catch (e: any) {
      console.error(e)
    } finally {
      setRemoving(null)
    }
  }

  async function syncCommits() {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await adminFetch(`/api/projects/${project.id}/sync-github`, idToken, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSyncMsg(`Synced ${data.count} commits`)
    } catch (e: any) {
      setSyncMsg(e.message)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 4000)
    }
  }

  async function fetchRepos() {
    if (!ghHandle.trim()) return
    setRepoLoading(true)
    setRepos([])
    try {
      const res = await fetch(
        `https://api.github.com/users/${ghHandle.trim()}/repos?sort=updated&per_page=100&type=public`,
      )
      if (!res.ok) throw new Error('Not found')
      setRepos(await res.json())
    } catch (e: any) {
      setRepoMsg(e.message)
      setTimeout(() => setRepoMsg(''), 3000)
    } finally {
      setRepoLoading(false)
    }
  }

  async function saveRepo() {
    const url = selectedRepo?.html_url ?? currentRepo
    if (!url.includes('github.com')) return
    setSavingRepo(true)
    try {
      const res = await adminFetch('/api/admin/create-project', idToken, {
        method: 'PATCH',
        body: JSON.stringify({ projectId: project.id, githubRepoUrl: url }),
      })
      // PATCH not implemented yet — fall back to direct Firestore update via client
      // (admin is the ownerId so the security rule allows it)
      const { doc, updateDoc } = await import('firebase/firestore')
      await updateDoc(doc(db, 'projects', project.id), { githubRepoUrl: url })
      setCurrentRepo(url)
      setSelectedRepo(null)
      setRepos([])
      setGhHandle('')
      setRepoMsg('Repo linked!')
    } catch (e: any) {
      setRepoMsg(e.message)
    } finally {
      setSavingRepo(false)
      setTimeout(() => setRepoMsg(''), 3000)
    }
  }

  const memberIds = new Set(members.map(m => m.userId))
  const nonMembers = users.filter(u => !memberIds.has(u.uid))

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {/* Header row */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium text-zinc-200 truncate">{project.title}</span>
          <StatusBadge status={project.status} />
          {currentRepo && (
            <span className="hidden sm:block text-[10px] font-mono text-indigo-400 truncate max-w-[180px]">
              {currentRepo.replace('https://github.com/', '')}
            </span>
          )}
        </div>
        <span className="text-zinc-600 text-xs ml-4">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-zinc-800 pt-4 space-y-5">
          {/* Tech stack */}
          {project.stack.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {project.stack.map(t => (
                <span key={t} className="font-mono text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-500">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            {/* Members column */}
            <div>
              <p className="text-[11px] font-mono text-zinc-500 mb-2">Current Members</p>
              {members.length === 0 ? (
                <p className="text-xs text-zinc-700">No members yet.</p>
              ) : (
                <ul className="space-y-1.5 mb-3">
                  {members.map(m => (
                    <li key={m.userId} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">{m.userName}</span>
                      <button
                        onClick={() => removeUser(m.userId)}
                        disabled={removing === m.userId}
                        className="text-[10px] text-red-500 hover:text-red-400 transition-colors disabled:opacity-40"
                      >
                        {removing === m.userId ? 'removing…' : 'Remove'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[11px] font-mono text-zinc-500 mb-2">Add Members</p>
              {nonMembers.length === 0 ? (
                <p className="text-xs text-zinc-700">All users already members.</p>
              ) : (
                <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {nonMembers.map(u => (
                    <li key={u.uid} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-300">{u.displayName}</span>
                        {u.email && (
                          <span className="block text-[10px] text-zinc-600">{u.email}</span>
                        )}
                      </div>
                      <button
                        onClick={() => assignUser(u)}
                        disabled={assigning === u.uid}
                        className="text-[10px] px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/50 transition-colors disabled:opacity-40"
                      >
                        {assigning === u.uid ? 'Adding…' : 'Add'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* GitHub column */}
            <div className="space-y-3">
              <p className="text-[11px] font-mono text-zinc-500">GitHub Repository</p>

              {currentRepo && (
                <a
                  href={currentRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs font-mono text-indigo-400 hover:text-indigo-300 truncate"
                >
                  {currentRepo.replace('https://github.com/', '')}
                </a>
              )}

              <div className="flex gap-2">
                <input
                  value={ghHandle}
                  onChange={e => setGhHandle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchRepos()}
                  placeholder="GitHub username"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500/70 transition-colors"
                />
                <button
                  onClick={fetchRepos}
                  disabled={repoLoading || !ghHandle.trim()}
                  className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors disabled:opacity-50"
                >
                  {repoLoading ? '…' : 'Fetch'}
                </button>
              </div>

              {repos.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {repos.map(repo => (
                    <button
                      key={repo.full_name}
                      onClick={() => setSelectedRepo(repo === selectedRepo ? null : repo)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors border font-mono ${
                        selectedRepo?.full_name === repo.full_name
                          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                          : 'bg-zinc-950/60 border-transparent text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {repo.name}
                      {repo.language && <span className="ml-2 text-zinc-600">{repo.language}</span>}
                    </button>
                  ))}
                </div>
              )}

              {(selectedRepo || currentRepo) && (
                <button
                  onClick={saveRepo}
                  disabled={savingRepo || (!selectedRepo && !currentRepo)}
                  className="w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors disabled:opacity-50"
                >
                  {savingRepo ? 'Saving…' : selectedRepo ? `Link "${selectedRepo.name}"` : 'Re-save current repo'}
                </button>
              )}

              {currentRepo && (
                <button
                  onClick={syncCommits}
                  disabled={syncing}
                  className="w-full py-1.5 rounded border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs text-emerald-400 transition-colors disabled:opacity-50"
                >
                  {syncing ? 'Syncing…' : 'Pull Latest Commits'}
                </button>
              )}

              {(syncMsg || repoMsg) && (
                <p className={`text-[10px] font-mono ${
                  syncMsg.includes('Error') || syncMsg.includes('fail') || repoMsg ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {syncMsg || repoMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()

  const [idToken,   setIdToken]   = useState<string | null>(null)
  const [projects,  setProjects]  = useState<FSProject[]>([])
  const [users,     setUsers]     = useState<FSUser[]>([])
  const [dataReady, setDataReady] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/dashboard')
    }
  }, [authLoading, isAdmin, router])

  // Get ID token for API calls
  useEffect(() => {
    if (!user) return
    user.getIdToken().then(setIdToken)
  }, [user])

  // Load projects and users once we have the token
  useEffect(() => {
    if (!idToken) return

    async function loadData() {
      // Projects from Firestore (client SDK — public read)
      const projSnap = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc')))
      const projs: FSProject[] = projSnap.docs.map(d => {
        const data = d.data()
        return {
          id:           d.id,
          title:        data.title,
          description:  data.description,
          stack:        data.stack ?? [],
          status:       data.status ?? 'ACTIVE',
          githubRepoUrl: data.githubRepoUrl,
          memberCount:  data.memberCount ?? 0,
        }
      })

      // Users via admin API
      const usersRes = await adminFetch('/api/admin/users', idToken!)
      const usersData = usersRes.ok ? (await usersRes.json()).users as FSUser[] : []

      setProjects(projs)
      setUsers(usersData)
      setDataReady(true)
    }

    loadData()
  }, [idToken])

  function handleProjectCreated(id: string) {
    // Re-fetch projects list
    getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'))).then(snap => {
      setProjects(snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          title: data.title,
          description: data.description,
          stack: data.stack ?? [],
          status: data.status ?? 'ACTIVE',
          githubRepoUrl: data.githubRepoUrl,
          memberCount: data.memberCount ?? 0,
        }
      }))
    })
  }

  if (authLoading || !isAdmin) {
    return (
      <>
        <Nav />
        <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
          <p className="text-zinc-600 text-sm font-mono">
            {authLoading ? 'loading…' : 'Access denied.'}
          </p>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">super admin</p>
          <h1 className="text-3xl font-semibold mb-2">Control Panel</h1>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-zinc-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <p className="text-2xl font-semibold mb-1">{dataReady ? projects.length : '—'}</p>
            <p className="text-xs text-zinc-500 font-mono">total projects</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <p className="text-2xl font-semibold mb-1">{dataReady ? users.length : '—'}</p>
            <p className="text-xs text-zinc-500 font-mono">registered users</p>
          </div>
        </div>

        {/* Create project */}
        {idToken && (
          <div className="mb-10">
            <CreateProjectPanel idToken={idToken} onCreated={handleProjectCreated} />
          </div>
        )}

        {/* Manage existing projects */}
        <div>
          <SectionHeading>Manage Projects</SectionHeading>
          {!dataReady ? (
            <p className="text-zinc-600 text-sm font-mono py-8 text-center">Loading…</p>
          ) : projects.length === 0 ? (
            <p className="text-zinc-600 text-sm py-8 text-center">No projects yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {idToken && projects.map(p => (
                <ProjectManagePanel
                  key={p.id}
                  project={p}
                  users={users}
                  idToken={idToken}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
