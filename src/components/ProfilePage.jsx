import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, LockKeyhole, LogIn, Pencil, ShieldCheck } from 'lucide-react'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'
import ChallengeHUD from './ChallengeHUD.jsx'
import ProfileModal from './ProfileModal.jsx'
import AuthModal from './AuthModal.jsx'
import { storageService } from '../services/storageService.js'

function safeBack() {
  if (document.referrer && document.referrer.startsWith(window.location.origin) && window.history.length > 1) window.history.back()
  else window.location.assign(import.meta.env.BASE_URL || '/')
}

export default function ProfilePage({ onOpenAuth }) {
  const [member, setMember] = useState(null)
  const [currentUser, setCurrentUser] = useState(storageService.getCurrentUser())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorDirty, setEditorDirty] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const load = () => {
    const fallbackPath = sessionStorage.getItem('__lit_path') || ''
    const fallbackUrl = new URL(fallbackPath || window.location.href, window.location.origin)
    const requested = new URLSearchParams(window.location.search).get('member') || fallbackUrl.searchParams.get('member')
    const handle = requested || storageService.getCurrentUser()?.handle
    setCurrentUser(storageService.getCurrentUser())
    setMember(handle ? storageService.getMember(handle) : null)
  }
  useEffect(() => { load(); return storageService.subscribe(load) }, [])

  const ownProfile = useMemo(() => member && currentUser && member.handle.toLowerCase() === currentUser.handle.toLowerCase(), [member, currentUser])
  const canManage = Boolean(storageService.isAdmin())
  const base = import.meta.env.BASE_URL || '/'
  const home = () => { sessionStorage.removeItem('__lit_path'); window.location.assign(base) }
  const openAuth = () => { onOpenAuth?.('login'); setAuthOpen(true) }
  const authorLink = (handle) => window.location.assign(`${base}?author=${encodeURIComponent(handle)}#articles`)
  const requestNavigation = (action) => {
    if (!editorDirty) return action()
    setPendingAction(() => action)
    setConfirmOpen(true)
  }
  const closeEditor = () => requestNavigation(() => setEditorOpen(false))
  const navigateFromNav = (href) => requestNavigation(() => window.location.assign(`${base}${href}`))

  useEffect(() => {
    const warn = (event) => { if (editorDirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [editorDirty])

  return <div className="min-h-screen bg-bg">
    <Nav onNavigate={navigateFromNav} onOpenAuth={openAuth} onOpenProfile={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <button onClick={() => requestNavigation(safeBack)} className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> 돌아가기</button>
      {!member ? <div className="glass rounded-3xl p-10 text-center"><LockKeyhole className="mx-auto mb-4 h-8 w-8 text-mint" /><h1 className="font-display text-2xl font-bold">프로필을 보려면 로그인하세요</h1><button onClick={openAuth} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-5 py-3 text-sm font-bold text-bg"><LogIn className="h-4 w-4" /> 로그인</button></div> : <>
        <section className="glass relative rounded-3xl border border-line p-6 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start"><img src={member.avatar} alt={member.name} className="h-24 w-24 rounded-3xl border-2 border-mint/40 object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-xs text-mint">@{member.handle}</p>{canManage && <span className="inline-flex items-center gap-1 rounded-full border border-pink/40 bg-pink/10 px-2 py-0.5 text-[10px] text-pink"><ShieldCheck className="h-3 w-3" /> 관리자</span>}</div><h1 className="mt-1 font-display text-3xl font-black text-fg sm:text-4xl">{member.name}</h1><p className="mt-2 text-sm text-muted">{[member.role, member.major].filter(Boolean).join(' · ')}</p><p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg/80">{member.bio || '아직 소개가 등록되지 않았습니다.'}</p><div className="mt-5 flex flex-wrap gap-2">{(member.links || []).filter((link) => /^https?:\/\//i.test(link.url) && !/litofficial/i.test(link.url)).map((link, i) => <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-mint/30 bg-mint/10 px-3 py-2 text-xs text-mint"><ExternalLink className="h-3 w-3" /> {link.name || link.platform || '링크'}</a>)}{Object.entries(member.socials || {}).filter(([, url]) => /^https?:\/\//i.test(url) && !/litofficial/i.test(url)).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-xs text-fg"><ExternalLink className="h-3 w-3" /> {name}</a>)}</div></div></div>
          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-4"><div><p className="font-mono text-[10px] text-muted">현재 조회수</p><p className="mt-1 text-2xl font-black text-fg">{member.clicks || 0}</p></div><div><p className="font-mono text-[10px] text-muted">자격증</p><p className="mt-1 text-sm text-fg">{member.certifications || '등록 없음'}</p></div><div><p className="font-mono text-[10px] text-muted">달성 배지</p><p className="mt-1 text-sm text-fg">{member.badges?.length || 0}개</p></div><div><p className="font-mono text-[10px] text-muted">프로필</p><p className="mt-1 text-sm text-mint">{ownProfile ? '내 프로필' : '공개 프로필'}</p></div></div>
          {(ownProfile || canManage) && <button onClick={() => setEditorOpen(true)} className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-4 py-2.5 text-xs font-bold text-bg"><Pencil className="h-3.5 w-3.5" /> {ownProfile ? '수정하기' : '부원 관리'}</button>}
        </section>
        <div className="mt-10"><ChallengeHUD memberOverride={member} onOpenProfile={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onOpenAuth={openAuth} onFilterAuthor={authorLink} /></div>
      </>}
    </main>
    <Footer />
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialTab="login" />
    {confirmOpen && <div className="fixed inset-0 z-[120] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/75" onClick={() => setConfirmOpen(false)} /><div role="alertdialog" className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl"><h2 className="font-display text-lg font-bold text-fg">변경사항을 저장하시겠습니까?</h2><p className="mt-2 text-sm text-muted">저장하지 않은 프로필 수정 내용이 있습니다.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmOpen(false)} className="glass rounded-xl px-3 py-2 text-xs text-muted">취소</button><button onClick={() => { setConfirmOpen(false); setEditorOpen(false); setEditorDirty(false); pendingAction?.() }} className="glass rounded-xl px-3 py-2 text-xs text-pink">저장하지 않음</button><button onClick={() => { setConfirmOpen(false); document.querySelector('[data-profile-form]')?.requestSubmit() }} className="rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-3 py-2 text-xs font-bold text-bg">저장</button></div></div></div>}
    {member && <ProfileModal isOpen={editorOpen} targetMember={member} onClose={() => setEditorOpen(false)} onRequestClose={closeEditor} onSaved={() => { setEditorDirty(false); setEditorOpen(false); pendingAction?.(); setPendingAction(null) }} onDirtyChange={setEditorDirty} />}
  </div>
}
