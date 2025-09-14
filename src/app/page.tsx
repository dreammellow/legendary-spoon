import { Hero } from '@/components/landing/hero'
import { Tokenomics } from '@/components/landing/tokenomics'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-crypto-dark">
      <Header />
      <Hero />
      <Tokenomics />
      <Footer />
    </main>
  )
}
