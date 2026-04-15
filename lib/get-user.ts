import 'server-only'
import { getStackServerApp } from './stack'
import { prisma } from './prisma'

/**
 * Returns the authenticated Stack Auth user synced into our PostgreSQL User table.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const stackUser = await getStackServerApp().getUser()
  if (!stackUser) return null

  const user = await prisma.user.upsert({
    where: { id: stackUser.id },
    update: {
      name:  stackUser.displayName  ?? undefined,
      email: stackUser.primaryEmail ?? undefined,
    },
    create: {
      id:    stackUser.id,
      name:  stackUser.displayName  ?? `Builder_${stackUser.id.slice(0, 5)}`,
      email: stackUser.primaryEmail ?? '',
    },
  })

  return user
}

/**
 * Like getCurrentUser but redirects to /auth/login if unauthenticated.
 */
export async function requireUser() {
  const stackUser = await getStackServerApp().getUser({ or: 'redirect' })

  const user = await prisma.user.upsert({
    where: { id: stackUser.id },
    update: {
      name:  stackUser.displayName  ?? undefined,
      email: stackUser.primaryEmail ?? undefined,
    },
    create: {
      id:    stackUser.id,
      name:  stackUser.displayName  ?? `Builder_${stackUser.id.slice(0, 5)}`,
      email: stackUser.primaryEmail ?? '',
    },
  })

  return user
}
