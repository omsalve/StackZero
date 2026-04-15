import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAdmin } from '@/lib/verify-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  const adminUid = await verifyAdmin(request)
  if (!adminUid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { projectId, userId, userName, role, action } = await request.json()

  if (!projectId || !userId) {
    return NextResponse.json({ error: 'projectId and userId are required' }, { status: 400 })
  }

  const membershipId = `${projectId}_${userId}`
  const memberRef    = adminDb.collection('projectMembers').doc(membershipId)

  if (action === 'remove') {
    await memberRef.delete()
    // Decrement count
    await adminDb.collection('projects').doc(projectId).update({
      memberCount: FieldValue.increment(-1),
    })
    return NextResponse.json({ removed: true })
  }

  // add / upsert
  const snap = await memberRef.get()
  await memberRef.set({
    projectId,
    userId,
    userName: userName ?? 'Unknown',
    role:     role ?? 'member',
    joinedAt: FieldValue.serverTimestamp(),
  })

  // Only increment if this is a new membership
  if (!snap.exists) {
    await adminDb.collection('projects').doc(projectId).update({
      memberCount: FieldValue.increment(1),
    })
  }

  return NextResponse.json({ assigned: true })
}
