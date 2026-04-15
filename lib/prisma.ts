import { PrismaClient } from '@/lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    // Return a client that will fail at query time with a clear message
    // Keeps the module loadable during build when DB is not yet configured
    console.warn('[prisma] DATABASE_URL not set — database queries will fail until configured')
  }
  const adapter = new PrismaPg(url ?? 'postgresql://localhost/stackzero')
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
