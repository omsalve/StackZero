import { adminDb } from '@/lib/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const snap = await adminDb.collection('projectMembers')
    .where('projectId', '==', projectId)
    .get()
  const members = snap.docs.map(d => {
    const m = d.data()
    return {
      projectId: m.projectId,
      userId:    m.userId,
      userName:  m.userName,
      role:      m.role,
      joinedAt:  m.joinedAt?.toDate?.()?.toISOString() ?? null,
    }
  })
  return Response.json(members)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const { userId, userName } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const memberRef  = adminDb.collection('projectMembers').doc(`${projectId}_${userId}`)
  const projectRef = adminDb.collection('projects').doc(projectId)

  const memberDoc = await memberRef.get()
  if (!memberDoc.exists) {
    const projectDoc  = await projectRef.get()
    const projectData = projectDoc.data() ?? {}

    const batch = adminDb.batch()
    batch.set(memberRef, {
      projectId,
      userId,
      userName:      userName ?? `Builder_${userId.slice(0, 5)}`,
      role:          'member',
      joinedAt:      Timestamp.now(),
      projectTitle:  projectData.title  ?? '',
      projectStatus: projectData.status ?? 'ACTIVE',
    })
    batch.update(projectRef, { memberCount: FieldValue.increment(1) })
    await batch.commit()
  }

  return Response.json({ projectId, userId }, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const { userId } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const memberRef  = adminDb.collection('projectMembers').doc(`${projectId}_${userId}`)
  const projectRef = adminDb.collection('projects').doc(projectId)

  const batch = adminDb.batch()
  batch.delete(memberRef)
  batch.update(projectRef, { memberCount: FieldValue.increment(-1) })
  await batch.commit()

  return Response.json({ ok: true })
}
