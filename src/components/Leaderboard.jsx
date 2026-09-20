import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  ChevronRight,
  Edit3,
  ExternalLink,
  Flame,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { storageService, MILESTONES } from '../services/storageService.js'
import { Reveal, SectionHeading } from './ui/Primitives.jsx'

export default function Leaderboard({ onFilterAuthor, onSelectMember, onEditMember, onOpenAuth }) {
  const [members, setMembers] = useState(storageService.getMembers())
  const [isAdmin, setIsAdmin] = useState(storageService.isAdmin())
  const [activeTab, setActiveTab] = useState('all') // 'all', '250', '100', '50', '30'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setMembers(storageService.getMembers())
      setIsAdmin(storageService.isAdmin())
    })
    return unsub
  }, [])

  // 정렬: 클릭수 내림차순
  const sortedMembers = [...members].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))

  // 필터 적용
  const filteredMembers = sortedMembers.filter((m) => {
    // 탭 필터
    if (activeTab === '250' && (m.clicks || 0) < 250) return false
    if (activeTab === '200' && (m.clicks || 0) < 200) return false
    if (activeTab === '150' && (m.clicks || 0) < 150) return false
    if (activeTab === '100' && (m.clicks || 0) < 100) return false
    if (activeTab === '50' && (m.clicks || 0) < 50) return false
    if (activeTab === '30' && (m.clicks || 0) < 30) return false

    // 검색어 필터
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = m.name.toLowerCase().includes(q)
      const matchHandle = m.handle.toLowerCase().includes(q)
      const matchMajor = (m.major || '').toLowerCase().includes(q)
      return matchName || matchHandle || matchMajor
    }
    return true
  })

  return (
    <section id="leaderboard" className="relative scroll-mt-24 px-4 sm:px-6 py-24 sm:py-32 overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute right-1/4 top-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-violet/10 blur-[150px]" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Leaderboard"
          title="LIT"
          accent="리더보드"
          desc="부원별 달성 조회수와 단계별 보상입니다."
        />

        {/* 1. 체크포인트 단계별 보상 안내 */}
        <Reveal delay={0.1} className="mt-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MILESTONES.map((ml) => {
              const achieversCount = members.filter((m) => (m.clicks || 0) >= ml.count).length
              const isFinal = ml.count === 250
              const isHighlight = ml.count === 150 || ml.count === 200

              return (
                <div
                  key={ml.count}
                  className={`group relative flex items-center gap-3.5 rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.01] ${
                    isFinal
                      ? 'border-amber/50 bg-gradient-to-br from-amber/15 via-amber/5 to-surface/80 shadow-[0_0_25px_rgba(255,209,102,0.12)] hover:border-amber'
                      : isHighlight
                      ? 'border-violet/40 bg-surface/70 hover:border-violet/70 hover:bg-surface'
                      : 'border-line bg-surface/50 hover:border-white/30 hover:bg-surface/80'
                  }`}
                >
                  {/* Icon badge */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl transition-transform group-hover:scale-110 ${
                      isFinal
                        ? 'border-amber/40 bg-amber/20 shadow-[0_0_12px_rgba(255,209,102,0.25)]'
                        : isHighlight
                        ? 'border-violet/30 bg-violet/15'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    {ml.icon}
                  </div>

                  {/* Reward details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-xs font-black tracking-wide ${
                          isFinal ? 'text-amber' : 'text-mint'
                        }`}
                      >
                        {ml.count} 조회수
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                        <Users className="h-3 w-3" />
                        {achieversCount}명 달성
                      </span>
                    </div>

                    <h4
                      className={`mt-1 font-display text-sm sm:text-base font-bold leading-snug tracking-tight ${
                        isFinal
                          ? 'text-amber font-black drop-shadow-[0_0_8px_rgba(255,209,102,0.3)]'
                          : 'text-fg group-hover:text-white'
                      }`}
                    >
                      {ml.reward}
                    </h4>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>

        {/* 관리자 모드 안내 및 빠른 부원 등록 */}
        {isAdmin && (
          <Reveal delay={0.12} className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink/40 bg-pink/10 p-3.5 sm:px-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-pink" />
                <span className="font-display text-xs sm:text-sm font-bold text-fg">
                  👑 운영진 관리자 모드 활성
                </span>
                <span className="text-xs text-muted hidden md:inline">
                  · 부원별 클릭수 빠른 조정(+/-) 및 [정보 수정] 버튼을 통해 이름, 소개, 역할을 변경할 수 있습니다.
                </span>
              </div>
              <button
                onClick={() => onOpenAuth?.('register')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-3.5 py-1.5 text-xs font-bold text-bg transition-transform hover:scale-105 shadow-md shadow-pink/20"
              >
                <UserPlus className="h-3.5 w-3.5" />
                신규 부원 직접 등록
              </button>
            </div>
          </Reveal>
        )}

        {/* 2. 컨트롤 바 (필터 탭 및 검색) */}
        <Reveal delay={0.15} className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: '전체' },
                { id: '250', label: '👑 250' },
                { id: '200', label: '🍎 200+' },
                { id: '150', label: '🌳 150+' },
                { id: '100', label: '🪴 100+' },
                { id: '50', label: '🌿 50+' },
                { id: '30', label: '🌱 30+' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-fg text-bg shadow-lg'
                      : 'glass text-muted hover:text-fg hover:border-white/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>


            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="부원 이름, 전공 검색..."
                className="glass w-full rounded-full py-2 pl-9 pr-4 text-xs text-fg placeholder:text-muted focus:border-mint/60 focus:outline-none"
              />
            </div>
          </div>
        </Reveal>

        {/* 3. 리더보드 순위 목록 */}
        <div className="mt-6 space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center text-muted">
              <p className="text-sm">해당 조건에 일치하는 부원이 없습니다.</p>
            </div>
          ) : (
            filteredMembers.map((m, index) => {
              const rank = sortedMembers.findIndex((orig) => orig.handle === m.handle) + 1
              const percent = Math.min(100, Math.round(((m.clicks || 0) / 250) * 100))
              const isTop3 = rank <= 3
              const isFinished = (m.clicks || 0) >= 250

              const rankGlow =
                rank === 1
                  ? 'border-amber/50 bg-amber/5'
                  : rank === 2
                  ? 'border-white/40 bg-white/5'
                  : rank === 3
                  ? 'border-pink/40 bg-pink/5'
                  : 'border-line bg-surface/60'

              return (
                <motion.div
                  key={m.handle}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all hover:border-white/30 hover:bg-surface ${rankGlow}`}
                >
                  <div className="flex flex-col">
                    {/* 1. 상단: 순위 & 프로필 정보 (좌측) + 실시간 클릭수 (우측) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Rank badge */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black tracking-tight sm:h-11 sm:w-11 sm:text-xl">
                          <span className="text-muted font-mono text-sm sm:text-base font-bold">#{rank}</span>
                        </div>

                        {/* Avatar */}
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl border border-line object-cover"
                        />

                        {/* Name & Major (이름은 100% 온전히 보이고 절대 잘리지 않음) */}
                        <div className="min-w-0 flex-1">
                          <div className="font-display text-base sm:text-lg font-bold text-fg leading-tight whitespace-nowrap">
                            {m.name}
                          </div>
                          <p className="mt-1 text-xs text-muted truncate">
                            <span className="font-mono text-[11px] text-muted mr-1.5">@{m.handle}</span>
                            <span>· {m.role} · {m.major}</span>
                          </p>
                        </div>
                      </div>

                      {/* Clicks & Percent (상단 우측 정렬) */}
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline justify-end gap-1 sm:gap-1.5">
                          <span className="font-sans text-xl sm:text-3xl font-black text-fg">
                            {m.clicks || 0}
                          </span>
                          <span className="font-mono text-[11px] sm:text-xs text-muted">/ 250</span>
                          <span className="font-mono text-[11px] sm:text-xs font-semibold text-mint">
                            ({percent}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. 중단: 전체 너비 프로그레스 게이지 (시원하고 안정적인 배치) */}
                    <div className="mt-3.5 sm:mt-4 w-full">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFinished
                              ? 'bg-mint shadow-[0_0_8px_rgba(94,240,214,0.5)]'
                              : isTop3
                              ? 'bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))]'
                              : 'bg-violet'
                          }`}
                        />
                      </div>
                    </div>

                    {/* 3. 하단: 뱃지/자격증 (좌측) + 액션 버튼 (우측) */}
                    <div className="mt-3 flex items-center justify-between gap-2 min-h-[36px]">
                      {/* Badges container: 250 달성과 자격증 모두 AI-900과 동일한 둥근 사각형 및 색상 통일 디자인 */}
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        {isFinished && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] font-semibold text-fg/90 whitespace-nowrap shadow-sm">
                            <span>👑</span>
                            <span>250 달성!</span>
                          </span>
                        )}
                        {m.certifications && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] font-semibold text-fg/90 whitespace-nowrap shadow-sm">
                            <span>🎓</span>
                            <span>{m.certifications}</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons & Admin quick click buttons */}
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* 관리자용 클릭수 빠른 증감 (+/-) */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                storageService.updateMemberClicks(m.handle, -1)
                              }}
                              title={`${m.name} 클릭수 -1`}
                              className="glass flex h-7 px-1.5 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-muted transition-all active:scale-90 hover:text-pink hover:border-pink/50 hover:bg-pink/15 cursor-pointer"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                storageService.updateMemberClicks(m.handle, 1)
                              }}
                              title={`${m.name} 클릭수 +1`}
                              className="glass flex h-7 px-1.5 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-muted transition-all active:scale-90 hover:text-mint hover:border-mint/50 hover:bg-mint/15 cursor-pointer"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                storageService.updateMemberClicks(m.handle, 5)
                              }}
                              title={`${m.name} 클릭수 +5`}
                              className="glass flex h-7 px-1.5 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-muted transition-all active:scale-90 hover:text-mint hover:border-mint/50 hover:bg-mint/15 cursor-pointer"
                            >
                              +5
                            </button>
                          </div>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onEditMember?.(m)}
                            title={`${m.name} 부원의 정보, 소개, 클릭수 직접 관리`}
                            className="inline-flex items-center gap-1 rounded-xl border border-pink/40 bg-pink/15 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-pink whitespace-nowrap shrink-0 transition-all hover:bg-pink/25 hover:border-pink"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">정보 수정</span>
                            <span className="sm:hidden">수정</span>
                          </button>
                        )}

                        <button
                          onClick={() => onFilterAuthor(m.handle)}
                          title="이 부원이 작성한 글 모음 보기"
                          className="glass inline-flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-fg whitespace-nowrap shrink-0 transition-all hover:bg-white/10 hover:border-mint/50"
                        >
                          <span>글 모음</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                        </button>

                        <a
                          href={m.msLink}
                          target="_blank"
                          rel="noreferrer"
                          title="부원의 MS Learn 챌린지 링크 열기 (클릭 지원)"
                          className="glass inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:text-mint hover:border-mint/40"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

