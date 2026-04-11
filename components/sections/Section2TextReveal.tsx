'use client'
import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, useSpring, motion } from 'framer-motion'

const BODY_TEXT =
  "StackZero is the operating system for your engineering club. " +
  "Find projects that match your stack. Log contributions. " +
  "Ship real things with real people. " +
  "No fluff. No slides. Just code."

// Split into words, track cumulative char index per word
const words = BODY_TEXT.split(' ')
const wordData: { word: string; start: number; end: number }[] = []
let cursor = 0
for (const word of words) {
  wordData.push({ word, start: cursor, end: cursor + word.length })
  cursor += word.length + 1 // +1 for the space
}
const totalChars = cursor

export function Section2TextReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 })

  useEffect(() => {
    return smooth.on('change', (v) => {
      const count = Math.floor(Math.min(1, v / 0.6) * totalChars)
      setRevealed(count)
    })
  }, [smooth])

  const scale   = useTransform(smooth, [0.6, 1], [1, 2.6])
  const opacity = useTransform(smooth, [0.6, 0.85], [1, 0])
  const blurPx  = useTransform(smooth, [0.6, 1], [0, 20])
  const blurStr = useTransform(blurPx, (v) => `blur(${v}px)`)

  return (
    <section ref={ref} style={{ position: 'relative', minHeight: '220vh' }}>
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <motion.div style={{
          scale,
          opacity,
          filter: blurStr,
          transformOrigin: 'center center',
          maxWidth: 720,
          padding: '0 2rem',
          willChange: 'transform, opacity, filter',
        }}>
          <p style={{
            fontSize: 'clamp(1.4rem, 2.8vw, 2.1rem)',
            fontWeight: 500,
            lineHeight: 1.65,
            letterSpacing: '-0.01em',
            color: '#fff',
            // Normal inline flow so words wrap naturally
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}>
            {wordData.map(({ word, start, end }, wi) => (
              // Each word is inline so browser wraps normally
              // The space after is a real text node, not a span
              <span key={wi} style={{ display: 'inline', whiteSpace: 'normal' }}>
                {word.split('').map((char, ci) => {
                  const charIdx = start + ci
                  const isRevealed = charIdx < revealed
                  return (
                    <span
                      key={ci}
                      style={{
                        display: 'inline',
                        opacity: isRevealed ? 1 : 0.07,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      {char}
                    </span>
                  )
                })}
                {/* Space between words as plain text so line-breaking works */}
                {wi < wordData.length - 1 && (
                  <span style={{
                    display: 'inline',
                    opacity: end < revealed ? 1 : 0.07,
                    transition: 'opacity 0.2s ease',
                  }}>{' '}</span>
                )}
              </span>
            ))}
          </p>
        </motion.div>
      </div>
    </section>
  )
}