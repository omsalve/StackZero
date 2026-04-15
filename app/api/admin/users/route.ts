import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAdmin } from '@/lib/verify-admin'

export async function GET(request: Request) {
  const adminUid = await verifyAdmin(request)
  if (!adminUid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const snap = await adminDb.collection('users').get()
  const users = snap.docs.map(d => {
    const data = d.data()
    return {
      uid:         d.id,
      displayName: data.displayName ?? 'Unknown',
      email:       data.email ?? '',
      avatar:      data.avatar ?? null,
      githubHandle: data.githubHandle ?? null,
    }
  })

  return NextResponse.json({ users })
}
