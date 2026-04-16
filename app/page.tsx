import { Nav } from '@/components/Nav'
import { Section1ASCII } from '../components/sections/Section1ASCII'
import { Section2TextReveal } from '../components/sections/Section2TextReveal'
import { Section3Features } from '../components/sections/Section3features'
import { Section4CTA } from '../components/sections/Section4cta'

export default function Home() {
  return (
    <>
      <Nav />

      {/* Section 1: Full-screen ASCII hero */}
      <Section1ASCII />

      {/* Section 2: Letter-by-letter text reveal */}
      <Section2TextReveal />

      {/* Section 3: Feature breakdown — Projects, Contributions, Events */}
      <Section3Features />

      {/* Section 4: Stats + final CTA */}
      <Section4CTA />
    </>
  )
}