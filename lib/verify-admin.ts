import 'server-only'
import { getAuth } from 'firebase-admin/auth'
import { adminDb } from './firebase-admin' // ensures admin app is initialized

const SUPER_ADMIN_EMAIL = 'realomsalve@gmail.com'

/**
 * Verifies the Authorization: Bearer <idToken> header and confirms the
 * caller is the super admin. Returns the decoded uid or null on failure.
 */
export async function verifyAdmin(request: Request): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) return null

  try {
    const decoded = await getAuth().verifyIdToken(token)
    if (decoded.email !== SUPER_ADMIN_EMAIL) return null
    return decoded.uid
  } catch {
    return null
  }
}
