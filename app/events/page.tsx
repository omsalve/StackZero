import { getCurrentUser } from '@/lib/get-user'
import { prisma } from '@/lib/prisma'
import { Nav } from '@/components/Nav'
import { EventsGrid } from '@/components/EventsGrid'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const user = await getCurrentUser()

  const [events, myRegistrations] = await Promise.all([
    prisma.event.findMany({
      include: { _count: { select: { registrations: true } } },
      orderBy: { date: 'asc' },
    }),
    user
      ? prisma.eventRegistration.findMany({ where: { userId: user.id }, select: { eventId: true } })
      : Promise.resolve([]),
  ])

  const registeredIds = new Set(myRegistrations.map(r => r.eventId))

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-mono mb-1">events</p>
          <h1 className="text-3xl font-semibold mb-2">Upcoming events</h1>
          <p className="text-zinc-500 text-sm">
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <EventsGrid events={events} registeredIds={registeredIds} />
      </main>
    </>
  )
}
