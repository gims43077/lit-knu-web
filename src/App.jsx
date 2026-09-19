import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'

import Preloader from './components/Preloader.jsx'
import Cursor from './components/Cursor.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import Manifesto from './components/Manifesto.jsx'
import Activities from './components/Activities.jsx'
import Process from './components/Process.jsx'
import Stats from './components/Stats.jsx'
import Talks from './components/Talks.jsx'
import Roadmap from './components/Roadmap.jsx'
import Faq from './components/Faq.jsx'
import Recruit from './components/Recruit.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: { offset: -90 } })
    let id
    const raf = (t) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <ScrollProgress />
      <div className="noise" />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Manifesto />
        <Activities />
        <Process />
        <Stats />
        <Talks />
        <Roadmap />
        <Faq />
        <Recruit />
      </main>
      <Footer />
    </MotionConfig>
  )
}
