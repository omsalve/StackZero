import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const { userId, userName } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  })
  if (!event) return Response.json({ error: 'Event not found' }, { status: 404 })
  if (event._count.registrations >= event.capacity) {
    return Response.json({ error: 'Event is at capacity' }, { status: 409 })
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, name: userName ?? `Builder_${userId.slice(0, 5)}` },
  })

  const registration = await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: {},
    create: { eventId, userId },
  })

  return Response.json(registration, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const { userId } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  await prisma.eventRegistration.delete({
    where: { eventId_userId: { eventId, userId } },
  })

  return Response.json({ ok: true })
}
