import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [projectDoc, membersSnap, contribSnap] = await Promise.all([
    adminDb.collection('projects').doc(id).get(),
    adminDb.collection('projectMembers').where('projectId', '==', id).get(),
    adminDb.collection('contributions').where('projectId', '==', id).get(),
  ])

  if (!projectDoc.exists) return Response.json({ error: 'Not found' }, { status: 404 })

  const data = projectDoc.data()!

  const members = membersSnap.docs.map(d => {
    const m = d.data()
    return {
      userId:   m.userId,
      userName: m.userName,
      role:     m.role,
      joinedAt: m.joinedAt?.toDate?.()?.toISOString() ?? null,
    }
  })

  const contributions = contribSnap.docs
    .map(d => {
      const c = d.data()
      return {
        id:        d.id,
        userId:    c.userId,
        userName:  c.userName,
        message:   c.message,
        type:      c.type,
        projectId: c.projectId,
        createdAt: c.createdAt?.toDate?.() ?? new Date(0),
      }
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50)
    .map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))

  return Response.json({
    id:               projectDoc.id,
    title:            data.title,
    description:      data.description,
    stack:            data.stack            ?? [],
    status:           data.status           ?? 'ACTIVE',
    ownerId:          data.ownerId,
    ownerName:        data.ownerName,
    memberCount:      data.memberCount      ?? 0,
    contributionCount: data.contributionCount ?? 0,
    createdAt:        data.createdAt?.toDate?.()?.toISOString() ?? null,
    members,
    contributions,
  })
}
