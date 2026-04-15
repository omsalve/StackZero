'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

const LINKS = [
  { href: '/projects',  label: 'Projects'  },
  { href: '/events',    label: 'Events'    },
  { href: '/dashboard', label: 'Dashboard' },
]

export function Nav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, userName, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    router.push('/auth/login')
  }

  const initials = (userName ?? 'U').slice(0, 2).toUpperCase()

  return (
    <nav
      className="fixed top-0 inset-x-0 z-40 border-b border-white/[0.04]"
      style={{ background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(20px) saturate(180%)' }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-black leading-none">SZ</span>
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            Stack<span className="text-indigo-400">Zero</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {LINKS.map(l => {
            const active = pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} className="relative px-3 py-1.5 text-sm transition-colors duration-150 rounded-md group">
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-zinc-800 rounded-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`}>
                  {l.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Right: user menu or sign-in */}
        <div className="relative" ref={menuRef}>
          {user ? (
            <>
              <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 font-medium hover:border-indigo-500/60 transition-colors">
                  {initials}
                </div>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: 6,  scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-sm font-medium text-zinc-200 truncate">{userName}</p>
                      <p className="text-xs text-zinc-600 truncate">{user.email ?? '—'}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-lg transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}
