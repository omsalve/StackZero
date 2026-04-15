'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'

const ASCIIText = dynamic(() => import('@/components/ASCIIText'), { ssr: false })

export function Section1ASCII() {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // GPU-compositable properties only: transform (scale) + opacity
  // No blur here — blur forces a repaint and kills perf on this already-heavy canvas
  const scale   = useTransform(scrollYProgress, [0, 1], [1, 2.2])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.6, 0])

  return (
    <section ref={ref} style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <motion.div
        style={{
          scale,
          opacity,
          position: 'absolute',
          inset: 0,
          transformOrigin: 'center center',
          willChange: 'transform, opacity',
        }}
      >
        <ASCIIText
          text="what's up?"
          asciiFontSize={8}
          textFontSize={20}
          enableWaves
          planeBaseHeight={8}
        />
      </motion.div>
    </section>
  )
}