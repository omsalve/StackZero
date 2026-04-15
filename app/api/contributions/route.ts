import { adminDb } from '@/lib/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

const VALID_TYPES = ['commit', 'review', 'fix', 'update']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const userId    = searchParams.get('userId')
  const lim       = Math.min(Number(searchParams.get('limit') ?? '50'), 100)

  let q = adminDb.collection('contributions') as FirebaseFirestore.Query
  if (projectId) q = q.where('projectId', '==', projectId)
  if (userId)    q = q.where('userId',    '==', userId)

  const snap = await q.get()
  const contributions = snap.docs
    .map(d => {
      const c = d.data()
      return {
        id:        d.id,
        projectId: c.projectId,
        userId:    c.userId,
        userName:  c.userName,
        message:   c.message,
        type:      c.type,
        createdAt: c.createdAt?.toDate?.() ?? new Date(0),
        user:      { id: c.userId, name: c.userName },
      }
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, lim)
    .map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))

  return Response.json(contributions)
}

export async function POST(request: Request) {
  const { userId, userName, projectId, message, type } = await request.json()
  if (!userId || !projectId || !message)
    return Response.json({ error: 'userId, projectId, message required' }, { status: 400 })

  const contribType = VALID_TYPES.includes(type) ? type : 'commit'

  const ref        = adminDb.collection('contributions').doc()
  const projectRef = adminDb.collection('projects').doc(projectId)

  const batch = adminDb.batch()
  batch.set(ref, {
    projectId,
    userId,
    userName:  userName ?? `Builder_${userId.slice(0, 5)}`,
    message:   message.trim(),
    type:      contribType,
    createdAt: Timestamp.now(),
  })
  batch.update(projectRef, { contributionCount: FieldValue.increment(1) })
  await batch.commit()

  const doc  = await ref.get()
  const data = doc.data()!
  return Response.json({
    id:        ref.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    user:      { id: data.userId, name: data.userName },
  }, { status: 201 })
}
