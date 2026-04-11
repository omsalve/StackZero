'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/events', label: 'Events' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-0 inset-x-0 z-40 border-b border-white/[0.04]"
      style={{ background: 'rgba(8,8,8,0.7)', backdropFilter: 'blur(20px) saturate(180%)' }}
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

        {/* Links */}
        <div className="flex items-center gap-1">
          {LINKS.map(l => {
            const active = pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative px-3 py-1.5 text-sm transition-colors duration-150 rounded-md group"
              >
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

        {/* Status pill */}
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">All systems live</span>
        </div>

      </div>
    </nav>
  )
}