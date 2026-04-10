'use client'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import Link from 'next/link'

const ease = [0.25, 0.1, 0.25, 1] as const

const FADE_UP: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease }
  }
}

const STAGGER: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } }
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 max-w-5xl mx-auto">
      <motion.div initial="initial" animate="animate" variants={STAGGER}>
        <motion.p variants={FADE_UP} className="text-xs tracking-[0.2em] uppercase text-indigo-400 mb-6 font-medium">
          Software Engineering Club
        </motion.p>

        <motion.h1 variants={FADE_UP} className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight mb-6">
          Build real things.
          <br />
          <span className="text-zinc-500">Ship together.</span>
        </motion.h1>

        <motion.p variants={FADE_UP} className="text-zinc-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          StackZero is where engineers find projects, track contributions, and build things that matter.
        </motion.p>

        <motion.div variants={FADE_UP} className="flex gap-4 flex-wrap">
          <Link href="/projects" className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors duration-150">
            Browse projects
          </Link>
          <Link href="/dashboard" className="px-5 py-2.5 border border-zinc-700 text-sm text-zinc-300 rounded-md hover:border-zinc-500 hover:text-white transition-colors duration-150">
            Dashboard →
          </Link>
        </motion.div>
      </motion.div>

      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }}
      />
    </section>
  )
}