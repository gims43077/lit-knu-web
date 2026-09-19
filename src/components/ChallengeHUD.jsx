import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Plus,
  Share2,
  Sparkles,
  Trophy,
  TrendingUp,
  UserCheck,
  Edit3,
  ArrowRight,
} from 'lucide-react'
import { storageService, MILESTONES, extractContributorId } from '../services/storageService.js'
import MagneticButton from './ui/MagneticButton.jsx'
import { Reveal, SectionHeading } from './ui/Primitives.jsx'

export default function ChallengeHUD({ onOpenProfile, onOpenAuth, onFilterAuthor }) {
  const [currentUser, setCurrentUser] = useState(storageService.getCurrentUser())
  const [members, setMembers] = useState(storageService.getMembers())
  const [articles, setArticles] = useState(storageService.getArticles())
  const [copied, setCopied] = useState(false)
  const [justAdded, setJustAdded] = useState(null)

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setCurrentUser(storageService.getCurrentUser())
      setMembers(storageService.getMembers())
      setArticles(storageService.getArticles())
    })
    return unsub
  }, [])

  // 동아리 전체 종합 통계 계산
  const totalClicks = members.reduce((acc, m) => acc + (m.clicks || 0), 0)
  const finishersCount = members.filter((m) => (m.clicks || 0) >= 250).length
  const activeMembersCount = members.length
  const totalArticlesCount = articles.length

  // 내 다음 마일스톤 계산
  const myClicks = currentUser ? currentUser.clicks || 0 : 0
  const progressPercent = Math.min(100, Math.round((myClicks / 250) * 100))
  const nextMilestone = MILESTONES.find((m) => m.count > myClicks) || MILESTONES[MILESTONES.length - 1]
  const isFinished = myClicks >= 250
  const clicksLeft = isFinished ? 0 : nextMilestone.count - myClicks

  // 클릭수 빠른 증가
  const handleQuickAdd = (delta) => {
    if (!currentUser) return
    storageService.updateMemberClicks(currentUser.handle, delta)
    setJustAdded(`+${delta}`)
    setTimeout(() => setJustAdded(null), 1200)
  }

  // 링크 복사
  const handleCopyLink = () => {
    if (!currentUser?.msLink) return
    navigator.clipboard.writeText(currentUser.msLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="dashboard" className="relative scroll-mt-24 px-6 py-20 sm:py-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[500px] w-[90vw] -translate-x-1/2 rounded-full bg-gradient-to-b from-pink/15 via-violet/10 to-mint/10 blur-[140px]" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Dashboard"
          title="챌린지"
          accent="대시보드"
          desc="동아리 전체 현황과 나의 챌린지 진행 상태를 실시간으로 확인하세요."
        />

        {/* 1. 동아리 전체 요약 통계 그리드 (동일한 카드 크기 및 간결한 문구) */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 items-stretch">
          <Reveal delay={0.05} className="h-full">
            <div className="glass group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-pink/40 hover:bg-white/[0.06]">
              <div>
                <div className="flex items-center justify-between text-muted">
                  <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider">Clicks</span>
                  <Flame className="h-4 w-4 text-pink" />
                </div>
                <div className="mt-2.5 font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                  {totalClicks.toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-muted">회</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted truncate">전체 누적 클릭</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-pink to-violet opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <div className="glass group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-amber/40 hover:bg-white/[0.06]">
              <div>
                <div className="flex items-center justify-between text-muted">
                  <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider">Finishers</span>
                  <Trophy className="h-4 w-4 text-amber" />
                </div>
                <div className="mt-2.5 font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                  {finishersCount}
                  <span className="ml-1 text-xs font-normal text-muted">명</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted truncate">250 완주 부원</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber to-mint opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="h-full">
            <div className="glass group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-violet/40 hover:bg-white/[0.06]">
              <div>
                <div className="flex items-center justify-between text-muted">
                  <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider">Members</span>
                  <UserCheck className="h-4 w-4 text-violet" />
                </div>
                <div className="mt-2.5 font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                  {activeMembersCount}
                  <span className="ml-1 text-xs font-normal text-muted">명</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted truncate">참여 부원</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-violet to-mint opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Reveal>

          <Reveal delay={0.2} className="h-full">
            <div className="glass group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-mint/40 hover:bg-white/[0.06]">
              <div>
                <div className="flex items-center justify-between text-muted">
                  <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider">Feed</span>
                  <Share2 className="h-4 w-4 text-mint" />
                </div>
                <div className="mt-2.5 font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                  {totalArticlesCount}
                  <span className="ml-1 text-xs font-normal text-muted">편</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted truncate">공유된 글</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-mint to-pink opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Reveal>
        </div>

        {/* 2. My Progress Interactive HUD Card */}
        {currentUser && (
          <Reveal delay={0.25} className="mt-8">
            <div className="gradient-border gradient-border-spin relative overflow-hidden rounded-3xl bg-surface/90 p-6 sm:p-9 backdrop-blur-xl">
              {/* Inner ambient glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink/20 blur-[100px]" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-mint/15 blur-[100px]" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                {/* User Info & Status */}
                <div className="flex flex-1 items-start gap-4 sm:gap-6">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-16 w-16 rounded-2xl border-2 border-line object-cover sm:h-20 sm:w-20"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-line text-xs">
                      {isFinished ? '👑' : nextMilestone.icon}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                        {currentUser.name}
                      </span>
                      <span className="font-mono text-xs text-muted">@{currentUser.handle}</span>
                      {currentUser.certifications && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-cyan/40 bg-cyan/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan">
                          <Award className="h-3 w-3 text-cyan" />
                          MS 공인: {currentUser.certifications}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-muted sm:text-sm">{currentUser.major} · {currentUser.bio}</p>

                    {/* Active Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {currentUser.badges && currentUser.badges.length > 0 ? (
                        currentUser.badges.map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1 rounded-md border border-line bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-fg/80"
                          >
                            <Sparkles className="h-2.5 w-2.5 text-amber" />
                            {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted">아직 달성한 뱃지가 없습니다. 첫 30 클릭에 도전하세요!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Switch / Edit Profile Buttons */}
                <div className="flex items-center gap-2 self-start lg:self-center">
                  <button
                    onClick={onOpenProfile}
                    className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs text-muted transition-colors hover:border-white/30 hover:text-fg"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    프로필 수정
                  </button>
                  <button
                    onClick={onOpenAuth}
                    className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs text-muted transition-colors hover:border-white/30 hover:text-fg"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    부원 전환
                  </button>
                </div>
              </div>

              {/* Progress Bar & Quick Increments */}
              <div className="relative mt-8 border-t border-line/70 pt-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2 whitespace-nowrap">
                      <div className="relative inline-flex items-baseline">
                        <span className="font-sans text-4xl font-black tracking-tight text-fg sm:text-5xl">
                          {myClicks}
                        </span>
                        <AnimatePresence>
                          {justAdded && (
                            <motion.span
                              initial={{ opacity: 0, y: 5, scale: 0.8 }}
                              animate={{ opacity: 1, y: -18, scale: 1.1 }}
                              exit={{ opacity: 0, y: -28 }}
                              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute -top-1 left-full ml-1 font-mono text-sm font-bold text-pink pointer-events-none drop-shadow-[0_0_8px_rgba(255,111,177,0.8)]"
                            >
                              {justAdded}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <span className="font-mono text-base sm:text-lg text-muted whitespace-nowrap shrink-0">
                        / 250 clicks
                      </span>

                      <span className="rounded-full bg-mint/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-mint whitespace-nowrap shrink-0">
                        {progressPercent}%
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted sm:text-sm">
                      {isFinished ? (
                        <span className="text-mint font-semibold">🎉 축하합니다! MSA 공식 앰버서더 자격을 충족했습니다!</span>
                      ) : (
                        <>
                          다음 목표 <strong className="text-fg">{nextMilestone.count} 달성</strong>까지{' '}
                          <span className="text-gradient font-bold">{clicksLeft} 클릭</span> 남았습니다! ({nextMilestone.reward})
                        </>
                      )}
                    </p>
                  </div>

                  {/* Quick Increment buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted mr-1 hidden xs:inline sm:inline">Quick Add:</span>
                    {[1, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleQuickAdd(num)}
                        className="glass group flex h-8.5 items-center gap-1 rounded-xl px-2.5 sm:px-3 text-xs font-semibold text-fg transition-all active:scale-95 hover:border-pink/50 hover:bg-pink/15 shrink-0"
                      >
                        <Plus className="h-3 w-3 text-pink group-hover:scale-125 transition-transform" />
                        +{num}
                      </button>
                    ))}
                    <button
                      onClick={onOpenProfile}
                      className="glass h-8.5 rounded-xl px-2.5 sm:px-3 text-xs text-muted hover:text-fg hover:border-white/30 shrink-0"
                    >
                      직접 입력
                    </button>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-5 relative h-3.5 w-full overflow-hidden rounded-full bg-white/[0.06] p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-pink),var(--color-violet),var(--color-mint))]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {/* Milestones pin indicators */}
                  {MILESTONES.map((ml) => {
                    const pos = (ml.count / 250) * 100
                    const achieved = myClicks >= ml.count
                    return (
                      <div
                        key={ml.count}
                        style={{ left: `${pos}%` }}
                        className="absolute top-0 -translate-x-1/2 h-full flex items-center pointer-events-none"
                        title={`${ml.title} (${ml.count} Clicks)`}
                      >
                        <div
                          className={`h-4 w-1 rounded-full ${
                            achieved ? 'bg-white shadow-[0_0_8px_#5ef0d6]' : 'bg-white/20'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Milestone numbers underneath positioned at exact matching percentages */}
                <div className="relative mt-2.5 h-5 w-full font-mono text-[10px] text-muted select-none">
                  {/* 0 Start */}
                  <span className="absolute left-0 top-0 text-muted/70">0</span>

                  {MILESTONES.map((ml, idx) => {
                    const pos = (ml.count / 250) * 100
                    const isLast = idx === MILESTONES.length - 1
                    const achieved = myClicks >= ml.count

                    return (
                      <div
                        key={ml.count}
                        style={{ left: `${pos}%` }}
                        className={`absolute top-0 whitespace-nowrap transition-colors ${
                          isLast
                            ? '-translate-x-full pr-0.5 text-right'
                            : '-translate-x-1/2 text-center'
                        } ${achieved ? 'text-fg font-semibold' : 'text-muted/70'}`}
                      >
                        <span className={isLast ? 'text-amber font-bold' : ''}>
                          {ml.count}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Contributor ID & My Articles Action Bar (초간결 & 세련된 디자인) */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 sm:px-5 sm:py-3.5 backdrop-blur-md transition-all hover:border-white/20">
                  <div
                    onClick={handleCopyLink}
                    role="button"
                    tabIndex={0}
                    title="클릭하여 내 챌린지 링크 복사"
                    className="group flex items-center gap-3 cursor-pointer select-none"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-mint/20 bg-mint/10 text-mint shadow-[0_0_12px_rgba(94,240,214,0.15)] transition-transform group-hover:scale-105">
                      {copied ? <CheckCircle2 className="h-4 w-4 text-mint" /> : <Sparkles className="h-4 w-4" />}
                    </span>
                    <div>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                        Contributor ID
                        {copied && <span className="text-mint font-sans font-bold normal-case text-[10px]">· 링크 복사됨!</span>}
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold tracking-tight text-mint drop-shadow-[0_0_8px_rgba(94,240,214,0.3)] transition-colors group-hover:text-white">
                        {currentUser.contributorId || extractContributorId(currentUser.msLink)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onFilterAuthor(currentUser.handle)}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-5 py-2.5 text-xs sm:text-sm font-bold text-bg shadow-[0_0_18px_rgba(255,111,177,0.35)] transition-all duration-300 hover:shadow-[0_0_24px_rgba(94,240,214,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>내가 쓴 글 보기</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

