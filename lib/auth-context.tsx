'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

type AuthCtx = {
  user: User | null
  loading: boolean
  userId: string | null
  userName: string | null
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  userId: null,
  userName: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            name: u.displayName ?? `Builder_${u.uid.slice(0, 5)}`,
            email: u.email ?? '',
            createdAt: serverTimestamp(),
          })
        }
        setUser(u)
      } else {
        await signInAnonymously(auth)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const userName = user?.displayName ?? `Builder_${user?.uid?.slice(0, 5) ?? ''}`

  return (
    <AuthContext.Provider value={{ user, loading, userId: user?.uid ?? null, userName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}