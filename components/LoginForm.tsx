'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

// ─── types ───────────────────────────────────────────────────────────────────
type Mode = 'signin' | 'signup'

// ─── error mapper ────────────────────────────────────────────────────────────
function friendlyError(code: string): string {
  if (code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-credential'))
    return 'Invalid email or password.'
  if (code.includes('email-already-in-use'))
    return 'An account with that email already exists.'
  if (code.includes('weak-password'))
    return 'Password must be at least 6 characters.'
  if (code.includes('popup-closed') || code.includes('cancelled-popup'))
    return 'Sign-in cancelled.'
  return 'Something went wrong — try again.'
}

// ─── animated label input ────────────────────────────────────────────────────
function Field({
  label, type = 'text', value, onChange, autoFocus,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0

  return (
    <div className="relative">
      <motion.label
        animate={{
          top:      focused || filled ? '6px'  : '50%',
          fontSize: focused || filled ? '10px' : '13px',
          color:    focused ? 'rgb(129 140 248)' : 'rgb(82 82 91)',
        }}
        transition={{ duration: 0.15 }}
        className="absolute left-3 -translate-y-1/2 pointer-events-none font-mono z-10"
        style={{ top: '50%' }}
      >
        {label}
      </motion.label>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-zinc-900 border rounded-lg px-3 pt-5 pb-2 text-sm text-white outline-none transition-colors duration-150 focus:border-indigo-500/70 hover:border-zinc-600"
        style={{
          borderColor: focused ? 'rgb(99 102 241 / 0.7)' : 'rgb(63 63 70)',
          boxShadow: focused ? '0 0 0 3px rgb(99 102 241 / 0.08)' : 'none',
        }}
      />
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter()

  const [mode,     setMode]     = useState<Mode>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  useEffect(() => { setError('') }, [email, password, name])

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
  }

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      setDone(true)
      router.push('/dashboard')
    } catch (e: any) {
      setError(friendlyError(e?.code ?? e?.message ?? ''))
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() })
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setDone(true)
      router.push('/dashboard')
      router.refresh()
    } catch (e: any) {
      setError(friendlyError(e?.code ?? e?.message ?? ''))
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Glow */}
      <div
        className="absolute -inset-px rounded-2xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />

      <div className="relative rounded-2xl border border-zinc-800 bg-[#0d0d0d] overflow-hidden">
        {/* Top edge accent */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="px-8 py-8">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 mb-8">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  mode === m ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 mb-6 rounded-lg border border-zinc-700 bg-zinc-900 text-sm text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white transition-all duration-150 disabled:opacity-40"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[10px] font-mono text-zinc-700 tracking-widest">OR</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <Field label="Display name" value={name} onChange={setName} autoFocus />
                </motion.div>
              )}
            </AnimatePresence>

            <Field label="Email" type="email" value={email} onChange={setEmail} autoFocus={mode === 'signin'} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />

            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/20"
                >
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || done || !email || !password}
              className="relative w-full py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white overflow-hidden hover:bg-indigo-500 disabled:opacity-50 transition-colors duration-150"
              style={{ marginTop: '20px' }}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
                    <CheckIcon /> Redirecting…
                  </motion.span>
                ) : loading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <SpinnerIcon />
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>

        <div className="px-8 py-4 border-t border-zinc-800/60 bg-zinc-900/30">
          <p className="text-center text-[11px] text-zinc-600">
            By continuing you agree to the{' '}
            <span className="text-zinc-500">club code of conduct.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── icons ────────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin mx-auto" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
