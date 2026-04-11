import { Nav } from '@/components/Nav'
import { Section1ASCII } from '../components/sections/Section1ASCII'
import { Section2TextReveal } from '../components/sections/Section2TextReveal'

export default function Home() {
  return (
    <>
      <Nav />

      {/* Section 1: Full-screen ASCII hero — zooms into screen on scroll */}
      <Section1ASCII />

      {/* Section 2: Letter-by-letter reveal — zooms into screen when done */}
      <Section2TextReveal />
    </>
  )
}