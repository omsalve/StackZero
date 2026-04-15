import { adminDb } from '@/lib/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const { userId, userName } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const eventRef = adminDb.collection('events').doc(eventId)
  const regRef   = adminDb.collection('eventRegistrations').doc(`${eventId}_${userId}`)

  const eventDoc = await eventRef.get()
  if (!eventDoc.exists) return Response.json({ error: 'Event not found' }, { status: 404 })

  const eventData = eventDoc.data()!
  if ((eventData.registrationCount ?? 0) >= eventData.capacity)
    return Response.json({ error: 'Event is at capacity' }, { status: 409 })

  const regDoc = await regRef.get()
  if (!regDoc.exists) {
    const batch = adminDb.batch()
    batch.set(regRef, {
      eventId,
      userId,
      userName:      userName ?? `Builder_${userId.slice(0, 5)}`,
      registeredAt:  Timestamp.now(),
      eventTitle:    eventData.title,
      eventDate:     eventData.date,
      eventLocation: eventData.location,
    })
    batch.update(eventRef, { registrationCount: FieldValue.increment(1) })
    await batch.commit()
  }

  return Response.json({ eventId, userId }, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const { userId } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const regRef   = adminDb.collection('eventRegistrations').doc(`${eventId}_${userId}`)
  const eventRef = adminDb.collection('events').doc(eventId)

  const batch = adminDb.batch()
  batch.delete(regRef)
  batch.update(eventRef, { registrationCount: FieldValue.increment(-1) })
  await batch.commit()

  return Response.json({ ok: true })
}
