import { useEffect, useState } from 'react'
import { ArrowLeft, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'
import ChallengeHUD from './ChallengeHUD.jsx'
import ProfileModal from './ProfileModal.jsx'
import AuthModal from './AuthModal.jsx'
import { storageService } from '../services/storageService.js'

export default function ProfilePage({ onOpenAuth }) {
  const [member, setMember] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const load = () => {
    const fallbackPath = sessionStorage.getItem('__lit_path') || ''
    const requested = new URLSearchParams(window.location.search).get('member') || new URL(fallbackPath || window.location.href, window.location.origin).searchParams.get('member')
    const handle = requested || storageService.getCurrentUser()?.handle
    setMember(handle ? storageService.getMember(handle) : null)
  }
  useEffect(() => { load(); return storageService.subscribe(load) }, [])
  const home = () => { sessionStorage.removeItem('__lit_path'); window.location.assign(import.meta.env.BASE_URL || '/') }
  const openAuth = () => { if (onOpenAuth) onOpenAuth('login'); setAuthOpen(true) }
  const authorLink = (handle) => window.location.assign(`${import.meta.env.BASE_URL || '/'}?author=${encodeURIComponent(handle)}#articles`)

  return <div className="min-h-screen bg-bg">
    <Nav onOpenAuth={openAuth} onOpenProfile={() => window.location.reload()} />
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <button onClick={home} className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> 랜딩으로 돌아가기</button>
      {!member ? <div className="glass rounded-3xl p-10 text-center"><LockKeyhole className="mx-auto mb-4 h-8 w-8 text-mint" /><h1 className="font-display text-2xl font-bold">프로필을 보려면 로그인하세요</h1><button onClick={openAuth} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-5 py-3 text-sm font-bold text-bg"><LogIn className="h-4 w-4" /> 로그인</button></div> : <>
        <div className="mb-8 flex items-end gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.25em] text-mint">Member profile</p><h1 className="font-display text-4xl font-black">프로필</h1></div>{storageService.isAdmin() && <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-pink/40 bg-pink/10 px-3 py-1 text-xs text-pink"><ShieldCheck className="h-3.5 w-3.5" /> 관리자</span>}</div>
        <ProfileModal inline isOpen targetMember={member} onClose={home} />
        {(member.links?.length || member.socials) && <div className="mt-5 flex flex-wrap gap-2">
          {member.links?.filter((link) => link.url).map((link, index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-mint/30 bg-mint/10 px-3 py-2 text-xs text-mint hover:bg-mint/20">↗ {link.name || link.platform || link.url}</a>)}
          {Object.entries(member.socials || {}).filter(([, url]) => /^https?:\/\//i.test(url)).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-xs text-fg hover:border-mint/40">↗ {name}</a>)}
        </div>}
        <div className="mt-10"><ChallengeHUD memberOverride={member} onOpenProfile={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onOpenAuth={openAuth} onFilterAuthor={authorLink} /></div>
      </>}
    </main>
    <Footer />
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialTab="login" />
  </div>
}
