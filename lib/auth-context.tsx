'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth'
import { auth } from './firebase'

type AuthState = {
  user:     User | null
  loading:  boolean
  userId:   string | null
  userName: string | null
  signOut:  () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null, loading: true, userId: null, userName: null, signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => onAuthStateChanged(auth, u => {
    setUser(u)
    setLoading(false)
  }), [])

  const userId   = user?.uid ?? null
  const userName = user?.displayName ?? (user ? `Builder_${user.uid.slice(0, 5)}` : null)

  async function signOut() {
    await fbSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, userId, userName, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
