import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import Showcase from '@/components/sections/Showcase'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import Header from '@/components/layout/Header'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Showcase />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
