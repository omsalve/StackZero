import { adminDb } from '../lib/firebase-admin'
import { HeroSection } from '../components/landing/HeroSection'
import { Nav } from '../components/Nav'

export default async function Home() {
  return (
    <>
      <Nav />
      <HeroSection />
    </>
  )
}