'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const SUPER_ADMIN_EMAIL = 'realomsalve@gmail.com'

type AuthState = {
  user:         User | null
  loading:      boolean
  userId:       string | null
  userName:     string | null
  githubHandle: string | null
  isAdmin:      boolean
  signOut:      () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null, loading: true, userId: null, userName: null, githubHandle: null, isAdmin: false, signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,         setUser]         = useState<User | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [githubHandle, setGithubHandle] = useState<string | null>(null)

  useEffect(() => onAuthStateChanged(auth, async u => {
    setUser(u)
    if (u) {
      // Fetch githubHandle from Firestore user doc
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        setGithubHandle(snap.data()?.githubHandle ?? null)
      } catch {
        setGithubHandle(null)
      }
    } else {
      setGithubHandle(null)
    }
    setLoading(false)
  }), [])

  const userId   = user?.uid ?? null
  const userName = user?.displayName ?? (user ? `Builder_${user.uid.slice(0, 5)}` : null)
  const isAdmin  = user?.email === SUPER_ADMIN_EMAIL

  async function signOut() {
    await fbSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, userId, userName, githubHandle, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
