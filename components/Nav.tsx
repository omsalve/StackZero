'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/events', label: 'Events' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function Nav() {
  const pathname = usePathname()
  return (
    <nav className="fixed top-0 inset-x-0 z-40 border-b border-zinc-900 bg-[#080808]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          Stack<span className="text-indigo-400">Zero</span>
        </Link>
        <div className="flex gap-6">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                pathname.startsWith(l.href)
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}