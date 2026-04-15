import 'server-only'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ''
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  initializeApp(
    clientEmail && privateKey
      ? { credential: cert({ projectId, clientEmail, privateKey }) }
      : { projectId }, // falls back to ADC (gcloud auth application-default login)
  )
}

export const adminDb = getFirestore()
