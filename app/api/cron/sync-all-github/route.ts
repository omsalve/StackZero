import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * Vercel Cron Job — called on the schedule defined in vercel.json.
 * Vercel passes Authorization: Bearer <CRON_SECRET> automatically.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all projects that have a linked GitHub repo
  const projectsSnap = await adminDb
    .collection('projects')
    .where('githubRepoUrl', '!=', '')
    .get()

  if (projectsSnap.empty) {
    return NextResponse.json({ message: 'No projects with GitHub repos linked.' })
  }

  const results: { projectId: string; synced?: number; error?: string }[] = []

  for (const projectDoc of projectsSnap.docs) {
    const projectId = projectDoc.id
    const githubUrl = projectDoc.data().githubRepoUrl as string

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      results.push({ projectId, error: 'Invalid GitHub URL' })
      continue
    }

    const owner = match[1]
    const repo  = match[2].replace('.git', '')

    try {
      const ghRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
        { headers: { Accept: 'application/vnd.github.v3+json' } },
      )

      if (!ghRes.ok) {
        results.push({ projectId, error: `GitHub ${ghRes.status}` })
        continue
      }

      const commits: any[] = await ghRes.json()
      const batch = adminDb.batch()
      const contribRef = adminDb.collection('contributions')

      for (const commitObj of commits) {
        const sha    = commitObj.sha
        const docRef = contribRef.doc(`gh_${sha}`)
        batch.set(docRef, {
          projectId,
          type:     'github_commit',
          message:  commitObj.commit.message.split('\n')[0],
          userName: commitObj.author?.login || commitObj.commit.author.name,
          link:     commitObj.html_url,
          createdAt: new Date(commitObj.commit.author.date),
          authorAvatar: commitObj.author?.avatar_url || null,
          githubSha: sha,
        }, { merge: true })
      }

      await batch.commit()
      results.push({ projectId, synced: commits.length })
    } catch (e: any) {
      results.push({ projectId, error: e.message })
    }
  }

  console.log('[cron] sync-all-github:', results)
  return NextResponse.json({ results })
}
