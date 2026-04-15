import { getStackServerApp } from '@/lib/stack'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const upcoming = searchParams.get('upcoming') !== 'false'

  const events = await prisma.event.findMany({
    where:   upcoming ? { date: { gte: new Date() } } : {},
    include: { _count: { select: { registrations: true } } },
    orderBy: { date: 'asc' },
  })
  return Response.json(events)
}

export async function POST(request: Request) {
  const user = await getStackServerApp().getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, date, location, capacity, tags } = await request.json()
  if (!title || !description || !date || !location)
    return Response.json({ error: 'title, description, date, location required' }, { status: 400 })

  const event = await prisma.event.create({
    data: {
      title, description, location,
      date:     new Date(date),
      capacity: capacity ?? 50,
      tags:     tags     ?? [],
    },
    include: { _count: { select: { registrations: true } } },
  })

  return Response.json(event, { status: 201 })
}
