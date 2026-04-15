import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAdmin } from '@/lib/verify-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  const adminUid = await verifyAdmin(request)
  if (!adminUid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, stack, status, githubRepoUrl } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const projectRef = adminDb.collection('projects').doc()
  await projectRef.set({
    title:        title.trim(),
    description:  description?.trim() ?? '',
    stack:        Array.isArray(stack) ? stack : [],
    status:       status ?? 'ACTIVE',
    ownerId:      adminUid,
    ownerName:    'Admin',
    memberCount:  0,
    contributionCount: 0,
    createdAt:    FieldValue.serverTimestamp(),
    ...(githubRepoUrl ? { githubRepoUrl } : {}),
  })

  return NextResponse.json({ id: projectRef.id }, { status: 201 })
}
