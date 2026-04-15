import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin' // Ensure this matches your admin DB export name

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await ctx.params
    
    // 1. Fetch the project document to get the GitHub URL
    const projectRef = adminDb.collection('projects').doc(projectId)
    const projectSnap = await projectRef.get()
    
    if (!projectSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const projectData = projectSnap.data()
    const githubUrl = projectData?.githubRepoUrl 
    
    if (!githubUrl) {
       return NextResponse.json({ error: 'No GitHub repository linked to this project' }, { status: 400 })
    }
    
    // 2. Parse the owner and repo from the URL (e.g., https://github.com/omsalve/stackzero)
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
       return NextResponse.json({ error: 'Invalid GitHub URL format' }, { status: 400 })
    }
    
    const owner = match[1]
    const repo = match[2].replace('.git', '') // Strip .git if present
    
    // 3. Fetch recent commits from GitHub REST API
    // Note: Unauthenticated requests are limited to 60 per hour by GitHub. 
    // You can add an Authorization header with a Personal Access Token later if needed.
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    })
    
    if (!ghRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch commits from GitHub' }, { status: ghRes.status })
    }
    
    const commits = await ghRes.json()
    
    // 4. Batch write commits to the Firestore 'contributions' collection
    const batch = adminDb.batch()
    const contributionsRef = adminDb.collection('contributions')
    
    let syncedCount = 0
    
    for (const commitObj of commits) {
       const sha = commitObj.sha
       
       // Use a unique ID based on the commit SHA so we never duplicate data
       const docId = `gh_${sha}`
       const contribDocRef = contributionsRef.doc(docId)
       
       batch.set(contribDocRef, {
         projectId,
         type: 'github_commit',
         // 'message' and 'userName' match what ContributionFeed expects
         message: commitObj.commit.message.split('\n')[0], // first line only
         userName: commitObj.author?.login || commitObj.commit.author.name,
         link: commitObj.html_url,
         createdAt: new Date(commitObj.commit.author.date),
         authorAvatar: commitObj.author?.avatar_url || null,
         githubSha: sha,
       }, { merge: true })
       
       syncedCount++
    }
    
    await batch.commit()
    
    return NextResponse.json({ 
      message: `Successfully synced ${syncedCount} commits`, 
      count: syncedCount 
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('GitHub Sync Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}