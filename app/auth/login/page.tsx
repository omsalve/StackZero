import { LoginForm } from '@/components/LoginForm'

export const metadata = { title: 'Sign in — StackZero' }

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <span className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-[11px] font-black leading-none">SZ</span>
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            Stack<span className="text-indigo-400">Zero</span>
          </span>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
