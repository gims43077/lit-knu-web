import Modal from './ui/Modal.jsx'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Flame,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Pencil,
  Users,
  X,
} from 'lucide-react'
import { storageService } from '../services/storageService.js'
import { Reveal, SectionHeading } from './ui/Primitives.jsx'

const categoryStyles = {
  notice: { label: '공지사항', color: 'bg-mint/15 text-mint border-mint/30' },
  weekly: { label: '주간 미션', color: 'bg-pink/15 text-pink border-pink/30' },
  community: { label: '커뮤니티', color: 'bg-mint/15 text-mint border-mint/30' },
  boost: { label: '부스트 퀘스트', color: 'bg-violet/15 text-violet border-violet/30' },
  special: { label: '특별 리워드', color: 'bg-amber/15 text-amber border-amber/30' },
}

export default function Missions({ onOpenAuth }) {
  const [missions, setMissions] = useState(storageService.getMissions())
  const [members, setMembers] = useState(storageService.getMembers())
  const [currentUser, setCurrentUser] = useState(storageService.getCurrentUser())
  const [isAdmin, setIsAdmin] = useState(storageService.isAdmin())
  const [expandedCompletedId, setExpandedCompletedId] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saveError, setSaveError] = useState('')

  // 새 미션 폼
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    reward: '',
    category: 'weekly',
    deadline: '',
  })

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setMissions(storageService.getMissions())
      setMembers(storageService.getMembers())
      setCurrentUser(storageService.getCurrentUser())
      setIsAdmin(storageService.isAdmin())
    })
    return unsub
  }, [])

  const handleToggleComplete = async (missionId) => {
    let user = currentUser || storageService.getCurrentUser()
    if (!user) {
      if (onOpenAuth) onOpenAuth()
      return
    }
    const userHandle = user.handle
    await storageService.toggleMissionCompletion(missionId, userHandle)
    setMissions(storageService.getMissions())
  }

  const handleDeleteMission = async (missionId) => {
    if (confirm('정말 이 공지를 삭제하시겠습니까?')) {
      await storageService.deleteMission(missionId)
    }
  }

  const openEditor = (mission = null) => {
    setEditingId(mission?.id ?? null)
    setSaveError('')
    setFormData({
      title: mission?.title ?? '',
      desc: mission?.desc ?? '',
      reward: mission?.reward ?? '',
      category: mission?.category ?? 'weekly',
      deadline: mission?.deadline ?? '',
    })
    setIsAddModalOpen(true)
  }

  const handleSaveMission = async (e) => {
    e.preventDefault()
    if (!storageService.isAdmin()) {
      setSaveError('공지사항을 수정할 권한이 없습니다.')
      return
    }
    if (!formData.title.trim() || !formData.desc.trim()) {
      setSaveError('제목과 상세 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setSaveError('')
    try {
      const values = { ...formData, title: formData.title.trim(), desc: formData.desc.trim() }
      if (editingId) {
        const { title, desc, reward, deadline } = values
        await storageService.updateMission(editingId, { title, desc, reward, deadline })
      } else {
        await storageService.addMission(values)
      }
      setIsAddModalOpen(false)
    } catch (error) {
      setSaveError(error.message || '저장하지 못했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="missions" className="relative scroll-mt-24 px-4 sm:px-6 py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Notice"
            title="공지사항"
            accent=""
          />

          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink/50 bg-pink/15 px-3 py-1.5 font-mono text-xs text-pink">
                <ShieldCheck className="h-3.5 w-3.5" />
                관리자 모드 활성
              </span>
              <button
                onClick={() => openEditor()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-4 py-2 text-xs font-bold text-bg transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                새 공지 등록하기
              </button>
            </div>
          )}
        </div>

        {/* 미션 카드 그리드 */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {missions.map((m, i) => {
            const cat = categoryStyles[m.category] || categoryStyles.weekly
            const isCompletedByMe = Boolean(
              currentUser &&
              (m.completedMemberHandles || []).some(
                (h) => String(h).trim().toLowerCase() === String(currentUser.handle).trim().toLowerCase()
              )
            )
            const completedCount = (m.completedMemberHandles || []).length

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group glass relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:border-white/30 ${
                  isCompletedByMe ? 'border-mint/30 bg-mint/[0.03]' : ''
                }`}
              >
                <div>
                  {/* Deadline & Admin Delete */}
                  <div className="flex items-center justify-between">
                    <div>
                      {m.deadline && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/50 px-2.5 py-0.5 font-mono text-[11px] text-muted">
                          <Clock className="h-3 w-3 text-mint/80" /> {m.deadline}까지
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditor(m)}
                          title="공지사항 수정"
                          className="p-1 text-muted hover:text-mint transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMission(m.id)}
                          title="공지사항 삭제"
                          className="p-1 text-muted hover:text-pink transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-fg sm:text-xl">
                    {m.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 whitespace-pre-wrap text-xs leading-relaxed text-muted sm:text-sm">
                    {m.desc}
                  </p>

                  {/* Reward Box */}
                  {m.reward && (
                    <div className="mt-5 rounded-xl bg-white/[0.03] border border-line p-3 text-xs">
                      <span className="font-semibold text-fg/90">{m.reward}</span>
                    </div>
                  )}
                </div>

                {/* Footer: Completion status & Participated count */}
                <div className="mt-6 flex items-center justify-between border-t border-line/70 pt-4">
                  {completedCount > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setExpandedCompletedId(expandedCompletedId === m.id ? null : m.id)
                      }}
                      className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-fg transition-colors group/completed cursor-pointer"
                      title="완료한 부원 목록 보기"
                    >
                      <Users className="h-3.5 w-3.5 text-muted group-hover/completed:text-mint transition-colors" />
                      <span className="underline decoration-dotted underline-offset-4 group-hover/completed:text-mint">
                        {completedCount}명 완료
                      </span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${
                          expandedCompletedId === m.id ? 'rotate-180 text-mint' : 'text-muted'
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
                      <Users className="h-3.5 w-3.5" />
                      <span>0명 완료</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleToggleComplete(m.id)
                    }}
                    data-cursor="hover"
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                      isCompletedByMe
                        ? 'border border-mint/50 bg-mint/15 text-mint shadow-[0_0_12px_rgba(94,240,214,0.2)]'
                        : 'glass text-muted hover:text-fg hover:border-white/30 active:scale-95'
                    }`}
                  >
                    {isCompletedByMe ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-mint" />
                        <span>완료됨</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4" />
                        <span>완료</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 완료한 부원 명단 토글 표시 */}
                <AnimatePresence>
                  {expandedCompletedId === m.id && completedCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden rounded-xl border border-line bg-surface/80 p-3"
                    >
                      <div className="mb-2 text-[11px] font-mono text-muted flex items-center justify-between">
                        <span>완료한 부원 ({completedCount}명)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {(m.completedMemberHandles || []).map((handle) => {
                          const mem = members.find(
                            (u) => String(u.handle).toLowerCase() === String(handle).toLowerCase()
                          )
                          const name = mem?.name || handle
                          const avatar = mem?.avatar
                          return (
                            <div
                              key={handle}
                              className="flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.04] px-2.5 py-1 text-xs text-fg"
                            >
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={name}
                                  className="h-4 w-4 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-mint/20 text-[10px] text-mint font-bold">
                                  {name[0]}
                                </div>
                              )}
                              <span className="font-semibold text-fg/90">{name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 새 미션 공지 등록 모달 (관리자용) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-panel relative w-full max-w-lg rounded-3xl border border-line bg-surface p-7 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-pink" />
                  <h3 className="font-display text-xl font-bold text-fg">
                    {editingId ? '공지사항 수정' : '새 공지 등록'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-full p-1 text-muted hover:text-fg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {saveError && (
                <p role="alert" className="mt-4 text-sm text-pink">
                  {saveError}
                </p>
              )}

              <form onSubmit={handleSaveMission} className="mt-5 space-y-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-muted mb-1.5">
                    공지 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: 📢 [공지] 이번 주 챌린지 일정 및 주요 안내"
                    className="glass w-full rounded-xl px-3.5 py-2.5 text-xs text-fg focus:border-pink/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-muted mb-1.5">
                    마감일 (선택)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="glass w-full rounded-xl px-3.5 py-2.5 text-xs text-fg focus:border-pink/50 focus:outline-none bg-surface"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-muted mb-1.5">
                    달성 보상 / 혜택 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                    placeholder="예: ☕ 스타벅스 커피 쿠폰 또는 활동 인증"
                    className="glass w-full rounded-xl px-3.5 py-2.5 text-xs text-fg focus:border-pink/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-muted mb-1.5">
                    공지 상세 내용 *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="부원들에게 안내할 공지사항이나 미션 내용을 상세히 적어주세요."
                    className="glass w-full rounded-xl px-3.5 py-2.5 text-xs text-fg focus:border-pink/50 focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="glass rounded-xl px-4 py-2.5 text-xs text-muted hover:text-fg"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-5 py-2.5 text-xs font-bold text-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isSubmitting ? '공지 저장 중...' : (editingId ? '변경 내용 저장' : '공지 등록하기')}
                  </button>
                </div>
              </form>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </section>
  )
}
