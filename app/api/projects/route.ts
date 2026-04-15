import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET() {
  const snap = await adminDb.collection('projects').orderBy('createdAt', 'desc').get()
  const projects = snap.docs.map(d => {
    const data = d.data()
    return {
      id:               d.id,
      title:            data.title,
      description:      data.description,
      stack:            data.stack            ?? [],
      status:           data.status           ?? 'ACTIVE',
      ownerId:          data.ownerId,
      ownerName:        data.ownerName,
      memberCount:      data.memberCount      ?? 0,
      contributionCount: data.contributionCount ?? 0,
      createdAt:        data.createdAt?.toDate?.()?.toISOString() ?? null,
    }
  })
  return Response.json(projects)
}

export async function POST(request: Request) {
  const { userId, userName, title, description, stack, status } = await request.json()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!title || !description)
    return Response.json({ error: 'title and description are required' }, { status: 400 })

  const projectRef = adminDb.collection('projects').doc()
  const now = Timestamp.now()
  const resolvedStatus = status ?? 'ACTIVE'
  const resolvedName   = userName ?? `Builder_${userId.slice(0, 5)}`

  const batch = adminDb.batch()

  batch.set(projectRef, {
    title, description,
    stack:            stack ?? [],
    status:           resolvedStatus,
    ownerId:          userId,
    ownerName:        resolvedName,
    memberCount:      1,
    contributionCount: 0,
    createdAt:        now,
  })

  const memberRef = adminDb.collection('projectMembers').doc(`${projectRef.id}_${userId}`)
  batch.set(memberRef, {
    projectId:     projectRef.id,
    userId,
    userName:      resolvedName,
    role:          'owner',
    joinedAt:      now,
    projectTitle:  title,
    projectStatus: resolvedStatus,
  })

  await batch.commit()

  const doc  = await projectRef.get()
  const data = doc.data()!
  return Response.json({
    id: projectRef.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
  }, { status: 201 })
}
