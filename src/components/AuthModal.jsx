import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Check,
  Lock,
  LogOut,
  ShieldAlert,
  Sparkles,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { storageService, AVATAR_PRESETS } from '../services/storageService.js'

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab) // 'login', 'register'
  const [members, setMembers] = useState(storageService.getMembers())
  const [currentUser, setCurrentUser] = useState(storageService.getCurrentUser())
  const [isAdmin, setIsAdmin] = useState(storageService.isAdmin())

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
    }
  }, [isOpen, initialTab])

  // 로그인 폼
  const [loginHandle, setLoginHandle] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')

  // 회원가입 폼
  const [newMember, setNewMember] = useState({
    name: '',
    handle: '',
    password: '',
    passwordConfirm: '',
    major: '',
    avatar: '',
    certifications: '',
    contributorId: '',
    bio: '',
    clicks: 0,
    linkedin: '',
  })
  const [registerError, setRegisterError] = useState('')

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      setRegisterError('프로필 사진 파일 크기는 3MB 이하여야 합니다.')
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      setNewMember((prev) => ({ ...prev, avatar: evt.target.result }))
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setMembers(storageService.getMembers())
      setCurrentUser(storageService.getCurrentUser())
      setIsAdmin(storageService.isAdmin())
    })
    return unsub
  }, [isOpen])

  if (!isOpen) return null

  // 1. 로그인 처리 (LIT 입력 시 자동으로 관리자 모드 활성화)
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginSuccess('')

    if (!loginHandle) {
      setLoginError('아이디를 입력해 주세요.')
      return
    }

    const res = storageService.loginMember(loginHandle, loginPassword)
    if (res.success) {
      const msg = res.isAdmin
        ? 'LIT 운영진(관리자)으로 로그인되었습니다! 모든 관리자 권한이 활성화됩니다.'
        : `${res.member.name}님으로 로그인되었습니다!`
      setLoginSuccess(msg)
      setTimeout(() => {
        setLoginSuccess('')
        setLoginPassword('')
        onClose()
      }, 700)
    } else {
      setLoginError(res.message || '로그인에 실패했습니다.')
    }
  }

  // 2. 부원 빠른 선택 (아이디 자동완성)
  const handleQuickSelect = (handle) => {
    setLoginHandle(handle)
    setLoginPassword('1234') // 기본 목업 계정 자동완성 편의 제공
  }

  // 3. 로그아웃
  const handleLogout = () => {
    storageService.logout()
    setCurrentUser(null)
  }

  // 4. 회원가입 처리
  const handleRegister = (e) => {
    e.preventDefault()
    setRegisterError('')

    if (!newMember.name || !newMember.handle || !newMember.password) {
      setRegisterError('필수 입력 항목(이름, 아이디, 비밀번호)을 모두 채워주세요.')
      return
    }

    if (newMember.password.length < 4) {
      setRegisterError('비밀번호는 최소 4자리 이상이어야 합니다.')
      return
    }

    if (newMember.password !== newMember.passwordConfirm) {
      setRegisterError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    const existing = storageService.getMember(newMember.handle)
    if (existing) {
      setRegisterError('이미 존재하는 아이디입니다. 다른 아이디를 입력해 주세요.')
      return
    }

    const created = storageService.addMember(newMember)
    setMembers(storageService.getMembers())
    setCurrentUser(created)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-pink" />
            <h3 className="font-display text-xl font-bold text-fg">부원 로그인 & 계정 보안</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 현재 로그인 상태 뱃지 */}
        {currentUser && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] border border-line px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-6 w-6 rounded-full object-cover border border-line"
              />
              <span className="text-fg font-semibold">{currentUser.name} (@{currentUser.handle})</span>
              <span className="text-muted">님으로 접속 중</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-[11px] text-pink hover:underline"
            >
              <LogOut className="h-3 w-3" />
              로그아웃
            </button>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mt-4 flex rounded-xl bg-white/[0.04] p-1">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === 'login' ? 'bg-fg text-bg shadow' : 'text-muted hover:text-fg'
            }`}
          >
            <UserCheck className="inline mr-1.5 h-3.5 w-3.5" />
            로그인
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === 'register' ? 'bg-fg text-bg shadow' : 'text-muted hover:text-fg'
            }`}
          >
            <UserPlus className="inline mr-1.5 h-3.5 w-3.5" />
            신규 부원 가입
          </button>
        </div>

        {/* TAB 1: 로그인 */}
        {tab === 'login' && (
          <div className="mt-5 space-y-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                  아이디 (영문 핸들)
                </label>
                <input
                  type="text"
                  required
                  value={loginHandle}
                  onChange={(e) => {
                    setLoginHandle(e.target.value)
                    setLoginError('')
                  }}
                  placeholder="예: LIT, shlee, minji_kim"
                  className="glass w-full rounded-xl px-3.5 py-2.5 text-xs text-fg focus:border-pink/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value)
                    setLoginError('')
                  }}
                  placeholder="비밀번호를 입력하세요"
                  className="glass w-full rounded-xl px-3.5 py-2.5 text-xs text-fg focus:border-pink/50 focus:outline-none"
                />
              </div>

              {loginError && (
                <p className="text-xs text-pink flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {loginError}
                </p>
              )}

              {loginSuccess && (
                <p className="text-xs text-mint flex items-center gap-1 font-semibold">
                  <Check className="h-3.5 w-3.5" />
                  {loginSuccess}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] py-2.5 text-xs font-bold text-bg hover:opacity-90 transition-opacity shadow-lg"
              >
                계정 로그인
              </button>
            </form>

            <div className="rounded-xl border border-line bg-white/[0.02] p-3 text-[11px] text-muted">
              <p className="font-semibold text-fg/90 mb-1">💡 빠른 계정 선택 & 안내:</p>
              <p className="mb-2 leading-relaxed text-[11px]">
                클릭 시 아이디와 비밀번호(기본: <span className="text-mint font-mono font-bold">1234</span>)가 자동 입력됩니다.<br />
                <span className="text-pink font-semibold">⚡ 관리자 계정:</span> 아이디 <span className="text-mint font-mono font-bold">LIT</span> / 비밀번호 <span className="text-mint font-mono font-bold">1234</span> 입력 시 모든 관리자 권한이 자동 부여됩니다.
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('LIT')}
                  className="glass rounded-lg px-2.5 py-1 text-[10px] font-bold text-mint border-mint/40 bg-mint/10 hover:border-mint hover:bg-mint/20 transition-all"
                >
                  👑 LIT (운영진)
                </button>
                {members.map((m) => (
                  <button
                    key={m.handle}
                    type="button"
                    onClick={() => handleQuickSelect(m.handle)}
                    className="glass rounded-lg px-2 py-1 text-[10px] text-fg/80 hover:text-fg hover:border-mint/50"
                  >
                    {m.name} (@{m.handle})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 신규 부원 등록 (비밀번호 필수) */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} noValidate className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {/* 프로필 사진 등록 */}
            <div className="rounded-2xl border border-line bg-white/[0.03] p-3">
              <div className="flex items-center gap-3">
                <div className="relative group shrink-0">
                  <img
                    src={newMember.avatar || AVATAR_PRESETS[0]}
                    alt="avatar-preview"
                    className="h-12 w-12 rounded-xl object-cover border-2 border-mint/50 shadow-md"
                  />
                  <label
                    htmlFor="register-avatar-file"
                    title="기기에서 사진 업로드"
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="register-avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono text-[10px] uppercase text-muted">프로필 사진 등록</label>
                    <label
                      htmlFor="register-avatar-file"
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-mint hover:underline cursor-pointer"
                    >
                      <Upload className="h-3 w-3" /> 내 기기에서 업로드
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newMember.avatar}
                    onChange={(e) => setNewMember({ ...newMember, avatar: e.target.value })}
                    placeholder="또는 이미지 URL (https://...)"
                    className="glass w-full rounded-xl px-2.5 py-1 text-xs text-fg focus:border-mint/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick avatar presets */}
              <div className="mt-2 flex items-center gap-1.5 pt-1.5 border-t border-line/40 flex-wrap">
                <span className="font-mono text-[9px] text-muted mr-1">추천 프리셋 (단색):</span>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewMember({ ...newMember, avatar: preset })}
                    title={`단색 컬러 프리셋 ${idx + 1}`}
                    className={`h-5 w-5 rounded-md overflow-hidden border transition-all shrink-0 ${
                      newMember.avatar === preset
                        ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)] ring-2 ring-white/50'
                        : 'border-white/20 hover:border-mint hover:scale-110'
                    }`}
                  >
                    <img src={preset} alt={`preset-${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="예: 홍길동"
                  className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                  아이디 (영문) *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.handle}
                  onChange={(e) => setNewMember({ ...newMember, handle: e.target.value.toLowerCase().trim() })}
                  placeholder="예: gildong_hong"
                  className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
                />
              </div>
            </div>

            {/* 비밀번호 & 비밀번호 확인 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                  비밀번호 설정 *
                </label>
                <input
                  type="password"
                  required
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  placeholder="4자리 이상"
                  className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                  비밀번호 확인 *
                </label>
                <input
                  type="password"
                  required
                  value={newMember.passwordConfirm}
                  onChange={(e) => setNewMember({ ...newMember, passwordConfirm: e.target.value })}
                  placeholder="동일하게 재입력"
                  className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                전공 / 학번
              </label>
              <input
                type="text"
                value={newMember.major}
                onChange={(e) => setNewMember({ ...newMember, major: e.target.value })}
                placeholder="예: 컴퓨터학부 23학번"
                className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                보유 MS 자격증
              </label>
              <input
                type="text"
                value={newMember.certifications}
                onChange={(e) => setNewMember({ ...newMember, certifications: e.target.value })}
                placeholder="예: AI-900, AZ-900, DP-900"
                className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] text-muted mr-1">빠른 선택:</span>
                {['AI-900', 'AZ-900', 'DP-900', 'SC-900'].map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => {
                      const current = newMember.certifications
                        ? newMember.certifications.split(',').map((s) => s.trim()).filter(Boolean)
                        : []
                      if (!current.includes(cert)) {
                        current.push(cert)
                        setNewMember({ ...newMember, certifications: current.join(', ') })
                      }
                    }}
                    className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted hover:border-cyan/40 hover:text-cyan hover:bg-cyan/10 transition-colors"
                  >
                    +{cert}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                Microsoft Learn Contributor ID
              </label>
              <input
                type="text"
                value={newMember.contributorId}
                onChange={(e) => setNewMember({ ...newMember, contributorId: e.target.value })}
                placeholder="예: studentamb_482865 또는 482865"
                className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                한 줄 소개
              </label>
              <input
                type="text"
                value={newMember.bio}
                onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-pink/50 focus:outline-none"
              />
            </div>

            {registerError && (
              <p className="text-xs text-pink flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                {registerError}
              </p>
            )}

            <button
              type="submit"
              className="mt-3 w-full rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] py-2.5 text-xs font-bold text-bg hover:opacity-90 transition-opacity"
            >
              부원 계정 생성 및 시작하기
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
