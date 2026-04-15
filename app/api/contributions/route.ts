import { prisma } from '@/lib/prisma'
import type { ContributionType } from '@/lib/generated/prisma'

const VALID_TYPES: ContributionType[] = ['commit', 'review', 'fix', 'update']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const userId = searchParams.get('userId')
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)

  const contributions = await prisma.contribution.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(userId ? { userId } : {}),
    },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return Response.json(contributions)
}

export async function POST(request: Request) {
  const { userId, userName, projectId, message, type } = await request.json()

  if (!userId || !projectId || !message) {
    return Response.json({ error: 'userId, projectId, message required' }, { status: 400 })
  }

  const contributionType: ContributionType = VALID_TYPES.includes(type) ? type : 'commit'

  // Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, name: userName ?? `Builder_${userId.slice(0, 5)}` },
  })

  const contribution = await prisma.contribution.create({
    data: { userId, projectId, message: message.trim(), type: contributionType },
    include: { user: { select: { id: true, name: true } } },
  })

  return Response.json(contribution, { status: 201 })
}
