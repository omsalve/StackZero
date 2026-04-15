import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { joinedAt: 'asc' },
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

  // Ensure user exists in PG (idempotent upsert)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, name: userName ?? `Builder_${userId.slice(0, 5)}` },
  })

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: {},
    create: { projectId, userId, role: 'member' },
  })

  return Response.json(member, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const { userId } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  })

  return Response.json({ ok: true })
}
