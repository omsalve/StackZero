import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from '../firebase-credentials.json'

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount as any) })
}

export const adminDb = getFirestore()