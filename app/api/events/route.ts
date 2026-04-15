import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const upcoming = searchParams.get('upcoming') !== 'false'

  let q = adminDb.collection('events').orderBy('date', 'asc') as FirebaseFirestore.Query
  if (upcoming) q = q.where('date', '>=', Timestamp.now())

  const snap = await q.get()
  const events = snap.docs.map(d => {
    const data = d.data()
    return {
      id:                d.id,
      title:             data.title,
      description:       data.description,
      date:              data.date?.toDate?.()?.toISOString() ?? null,
      location:          data.location,
      capacity:          data.capacity,
      tags:              data.tags              ?? [],
      registrationCount: data.registrationCount ?? 0,
      _count:            { registrations: data.registrationCount ?? 0 },
    }
  })
  return Response.json(events)
}

export async function POST(request: Request) {
  const { userId, title, description, date, location, capacity, tags } = await request.json()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!title || !description || !date || !location)
    return Response.json({ error: 'title, description, date, location required' }, { status: 400 })

  const ref = adminDb.collection('events').doc()
  await ref.set({
    title, description, location,
    date:              Timestamp.fromDate(new Date(date)),
    capacity:          capacity ?? 50,
    tags:              tags     ?? [],
    registrationCount: 0,
    createdAt:         Timestamp.now(),
  })

  const doc  = await ref.get()
  const data = doc.data()!
  return Response.json({
    id: ref.id,
    ...data,
    date:      data.date?.toDate?.()?.toISOString()      ?? null,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    _count: { registrations: 0 },
  }, { status: 201 })
}
