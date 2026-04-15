import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../lib/auth-context'
import { SmoothScroll } from '../components/SmoothScroll'
import { PageTransition } from '../components/PageTransition'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StackZero',
  description: 'Software Engineering Club OS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#080808] text-white antialiased`}>
        <AuthProvider>
          <SmoothScroll>
            <PageTransition>
              {children}
            </PageTransition>
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  )
}
