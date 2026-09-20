import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'

import Preloader from './components/Preloader.jsx'
import Cursor from './components/Cursor.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import ArticleHub from './components/ArticleHub.jsx'
import Faq from './components/Faq.jsx'
import Footer from './components/Footer.jsx'

import AuthModal from './components/AuthModal.jsx'
import ProfilePage from './components/ProfilePage.jsx'
import { storageService } from './services/storageService.js'
import { getSiteBase } from './utils/siteBase.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const fallbackPath = sessionStorage.getItem('__lit_path') || ''
  const isProfileRoute = window.location.pathname.endsWith('/profile') || fallbackPath.includes('/profile') || window.location.hash === '#profile'
  const [authorFilter, setAuthorFilter] = useState(null)

  // Lenis smooth scroll
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: { offset: -90 } })
    const handleScrollLock = (event) => {
      if (event.detail) lenis.stop()
      else lenis.start()
    }
    window.addEventListener('modal-scroll-lock', handleScrollLock)
    let id
    const raf = (t) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('modal-scroll-lock', handleScrollLock)
      lenis.destroy()
    }
  }, [])

  // URL query parameter (?author=... 또는 ?member=...) 감지
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authorParam = params.get('author') || params.get('member')
    if (authorParam) {
      setAuthorFilter(authorParam)
      setTimeout(() => {
        const el = document.getElementById('articles')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 700)
    }
  }, [])

  const handleFilterAuthor = (handle) => {
    setAuthorFilter(handle)
    const el = document.getElementById('articles')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleClearAuthorFilter = () => {
    setAuthorFilter(null)
  }

  const handleSelectMember = (handle) => {
    storageService.setCurrentUser(handle)
  }

  const handleOpenAuth = (tab = 'login') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
  }

  const handleOpenProfile = (member = null) => {
    const handle = member?.handle || storageService.getCurrentUser()?.handle
    if (!handle) { handleOpenAuth('login'); return }
    const base = getSiteBase()
    window.location.assign(`${base.replace(/\/$/, '')}/profile?member=${encodeURIComponent(handle)}`)
  }

  if (isProfileRoute) {
    return <ProfilePage onOpenAuth={handleOpenAuth} />
  }

  return (
    <MotionConfig reducedMotion="user">
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <ScrollProgress />
      <div className="noise" />

      <Nav
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenProfile={() => handleOpenProfile(null)}
      />

      <main className="w-full max-w-[100vw] overflow-x-clip">
        <Hero ready={ready} />

        {/* 1. 피드 */}
        <ArticleHub
          authorFilter={authorFilter}
          onClearAuthorFilter={handleClearAuthorFilter}
          onFilterAuthor={handleFilterAuthor}
          onOpenProfile={handleOpenProfile}
          onOpenAuth={() => handleOpenAuth('login')}
        />
        {/* 2. 부원 순위 · 3. 단계별 보상 */}
        <Leaderboard onFilterAuthor={handleFilterAuthor} onSelectMember={handleSelectMember} onEditMember={handleOpenProfile} onOpenAuth={handleOpenAuth} />
        {/* 4. FAQ */}
        <Faq />
      </main>

      <Footer />

      {/* 모달 컴포넌트들 */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </MotionConfig>
  )
}
