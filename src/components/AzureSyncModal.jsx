import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Award,
  CheckCircle,
  ChevronRight,
  Cloud,
  Copy,
  Database,
  Download,
  Edit3,
  ExternalLink,
  FileCode,
  HardDrive,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { azureService } from '../services/azureService.js'
import { storageService } from '../services/storageService.js'

export default function AzureSyncModal({ isOpen, onClose, onEditMember, onOpenRegister }) {
  const [activeTab, setActiveTab] = useState('members') // 'members', 'guide', 'config'
  const [members, setMembers] = useState(storageService.getMembers())
  const [searchQuery, setSearchQuery] = useState('')
  const [config, setConfig] = useState(azureService.getConfig())
  const [testResult, setTestResult] = useState(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState('')
  const [copiedText, setCopiedText] = useState(null)

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setMembers(storageService.getMembers())
    })
    return unsub
  }, [])

  useEffect(() => {
    if (isOpen) {
      setMembers(storageService.getMembers())
      setConfig(azureService.getConfig())
    }
  }, [isOpen])

  if (!isOpen) return null

  // 1. 멤버 검색 필터
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.handle || '').toLowerCase().includes(q) ||
      (m.major || '').toLowerCase().includes(q) ||
      (m.certifications || '').toLowerCase().includes(q) ||
      (m.contributorId || '').toLowerCase().includes(q)
    )
  })

  // 2. 부원 계정 삭제 (DB & LocalStorage 연동)
  const handleDeleteMember = async (member) => {
    if (member.handle === 'LIT') {
      alert('LIT 공식 운영진 대표 계정은 삭제할 수 없습니다.')
      return
    }

    if (
      confirm(
        `정말 '${member.name}(@${member.handle})' 부원 계정을 데이터베이스에서 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      storageService.deleteMember(member.handle)
      await azureService.deleteMemberFromDb(member.handle)
      setMembers(storageService.getMembers())
      alert(`'${member.name}' 부원의 계정이 데이터베이스에서 완전히 삭제되었습니다.`)
    }
  }

  // 3. Azure 클라우드로 전체 데이터 일괄 동기화 (Bulk Push)
  const handleCloudSync = async () => {
    setIsSyncing(true)
    setSyncStatus('Azure Cosmos DB로 최신 부원 데이터를 동기화하는 중...')
    const allData = storageService.exportAllData()
    const res = await azureService.pushDataToAzure(allData)
    setIsSyncing(false)
    if (res.success) {
      setSyncStatus(`동기화 완료: ${res.timestamp ? new Date(res.timestamp).toLocaleTimeString() : '방금'}`)
      setTimeout(() => setSyncStatus(''), 4000)
    } else {
      setSyncStatus(`동기화 실패: ${res.message}`)
    }
  }

  // 4. Azure 클라우드 연결 테스트
  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    const res = await azureService.testConnection(config)
    setTestResult(res)
    setIsTesting(false)
  }

  // 5. Azure 설정 저장
  const handleSaveConfig = (e) => {
    e.preventDefault()
    azureService.saveConfig(config)
    setSyncStatus('Azure 설정이 성공적으로 저장되었습니다.')
    setTimeout(() => setSyncStatus(''), 2500)
  }

  // 6. JSON 백업 다운로드
  const handleExportJson = () => {
    const data = storageService.exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lit-msa-azure-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 7. JSON 복원
  const handleImportJson = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result)
        const ok = storageService.importAllData(parsed)
        if (ok) {
          alert('데이터가 성공적으로 복원되었습니다!')
          setMembers(storageService.getMembers())
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.')
        }
      } catch (err) {
        alert('JSON 파싱 실패: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedText(key)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-line bg-surface shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan/15 border border-cyan/40 text-cyan">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-fg">Azure 클라우드 & 데이터베이스 관리</h3>
                <span className="rounded-full bg-cyan/15 border border-cyan/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan">
                  🎓 Azure for Students 무료
                </span>
              </div>
              <p className="text-xs text-muted">
                Cosmos DB NoSQL (평생 무료 1,000 RU/s & 25GB) + Static Web Apps 글로벌 호스팅
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:text-fg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line px-6 bg-white/[0.01]">
          {[
            { id: 'members', label: `🗄️ 부원 계정 DB 관리 (${members.length}명)`, icon: Users },
            { id: 'guide', label: '☁️ Azure for Students 배포 가이드', icon: Server },
            { id: 'config', label: '⚙️ 클라우드 API & 백업 설정', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'border-cyan text-cyan bg-cyan/[0.04]'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: 부원 계정 데이터베이스 관리 */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Top Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이름, 아이디, 전공, 자격증 검색..."
                    className="glass w-full rounded-xl py-2 pl-9 pr-3 text-xs text-fg placeholder:text-muted focus:border-cyan/50 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloudSync}
                    disabled={isSyncing}
                    className="glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-cyan hover:border-cyan/50 hover:bg-cyan/10 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? '동기화 중...' : '클라우드 DB 전체 동기화'}
                  </button>

                  <button
                    onClick={() => {
                      onClose()
                      onOpenRegister?.()
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-3.5 py-2 text-xs font-bold text-bg hover:opacity-90 transition-opacity shadow"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    + 신규 부원 DB 등록
                  </button>
                </div>
              </div>

              {syncStatus && (
                <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-3.5 py-2 text-xs font-mono text-cyan">
                  {syncStatus}
                </p>
              )}

              {/* Members Database Table */}
              <div className="overflow-hidden rounded-2xl border border-line bg-surface/80">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-line bg-white/[0.03] font-mono text-[11px] uppercase tracking-wider text-muted">
                      <tr>
                        <th className="py-3 px-4">프로필</th>
                        <th className="py-3 px-4">이름 / 계정</th>
                        <th className="py-3 px-4">전공 & 역할</th>
                        <th className="py-3 px-4">MS 공인 자격증</th>
                        <th className="py-3 px-4">클릭수 / 250</th>
                        <th className="py-3 px-4 text-right">데이터베이스 관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted">
                            일치하는 부원 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((m) => {
                          const percent = Math.min(100, Math.round(((m.clicks || 0) / 250) * 100))
                          const isFinished = (m.clicks || 0) >= 250
                          const isLitAdmin = m.handle === 'LIT'

                          return (
                            <tr key={m.handle} className="hover:bg-white/[0.02] transition-colors">
                              {/* Avatar */}
                              <td className="py-3 px-4">
                                <img
                                  src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.handle}`}
                                  alt={m.name}
                                  className="h-9 w-9 rounded-xl object-cover border border-line"
                                />
                              </td>

                              {/* Name & Handle */}
                              <td className="py-3 px-4">
                                <div className="font-semibold text-fg flex items-center gap-1.5">
                                  {m.name}
                                  {isFinished && (
                                    <span className="text-[10px] text-mint font-mono font-normal">👑 완주</span>
                                  )}
                                  {isLitAdmin && (
                                    <span className="text-[10px] text-pink font-mono font-normal">운영진</span>
                                  )}
                                </div>
                                <span className="font-mono text-[11px] text-muted">@{m.handle}</span>
                              </td>

                              {/* Role & Major */}
                              <td className="py-3 px-4">
                                <p className="text-fg/90">{m.role || 'LIT 부원'}</p>
                                <p className="text-[11px] text-muted">{m.major || '-'}</p>
                              </td>

                              {/* MS Certifications */}
                              <td className="py-3 px-4">
                                {m.certifications ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-cyan/10 border border-cyan/30 px-2 py-0.5 font-mono text-[10px] text-cyan">
                                    <Award className="h-3 w-3" />
                                    {m.certifications}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[10px] text-muted/60">미취득</span>
                                )}
                              </td>

                              {/* Clicks */}
                              <td className="py-3 px-4 min-w-[120px]">
                                <div className="flex items-baseline justify-between font-mono text-[11px]">
                                  <span className="font-bold text-fg">{m.clicks || 0}</span>
                                  <span className="text-muted">/ 250 ({percent}%)</span>
                                </div>
                                <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    style={{ width: `${percent}%` }}
                                    className={`h-full rounded-full ${
                                      isFinished ? 'bg-mint' : 'bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))]'
                                    }`}
                                  />
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose()
                                      onEditMember?.(m)
                                    }}
                                    title="부원 정보 및 클릭수 수정"
                                    className="glass inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted hover:text-fg hover:border-white/30"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                    수정
                                  </button>

                                  {!isLitAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMember(m)}
                                      title="데이터베이스에서 영구 삭제"
                                      className="glass inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-pink/70 hover:text-pink hover:border-pink/40 hover:bg-pink/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      삭제
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notice */}
              <div className="rounded-2xl border border-line/70 bg-white/[0.02] p-4 text-xs text-muted leading-relaxed">
                <p className="font-semibold text-fg mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-mint" />
                  클라우드 데이터베이스 안전 동기화 안내
                </p>
                부원의 클릭수, 소개, 보유 MS 자격증, 프로필 사진 변경 및 삭제는 즉시 데이터베이스에 반영됩니다.
                Azure Static Web Apps 배포 시 전 세계 어디서나 부원들이 동시에 접속하여 실시간으로 챌린지를 이어갈 수 있습니다.
              </div>
            </div>
          )}

          {/* TAB 2: Azure for Students 배포 가이드 */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-cyan/30 bg-cyan/[0.06] p-4.5">
                <h4 className="font-display text-sm font-bold text-fg flex items-center gap-2">
                  <Server className="h-4 w-4 text-cyan" />
                  Azure for Students 구독으로 0원 운영하는 방법
                </h4>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">
                  대학교 학생 계정으로 제공되는 <strong>Azure for Students</strong> 구독을 사용하면,
                  1년 $100 크레딧 뿐만 아니라 <strong>Azure Cosmos DB 평생 무료 계층 (1,000 RU/s & 25GB)</strong>과
                  <strong>Azure Static Web Apps 무료 티어</strong>를 통해 <strong>운영비 0원</strong>으로 LIT 웹 플랫폼을 영구 서비스할 수 있습니다.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-fg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/20 text-cyan text-xs font-mono">
                      1
                    </span>
                    Azure Portal에서 Cosmos DB (NoSQL) Free Tier 생성
                  </div>
                  <ol className="mt-3 space-y-1.5 text-xs text-muted pl-8 list-decimal">
                    <li><a href="https://portal.azure.com" target="_blank" rel="noreferrer" className="text-cyan underline">Azure Portal</a> 접속 → <strong>Azure Cosmos DB</strong> 검색</li>
                    <li><strong>Azure Cosmos DB for NoSQL</strong> 생성 클릭</li>
                    <li><strong>Apply Free Tier Discount (무료 계층 할인 적용)</strong> 옵션 반드시 <strong>체크</strong> (1,000 RU/s & 25GB 영구 무료)</li>
                    <li>배포 완료 후 <strong>키(Keys)</strong> 메뉴에서 <code>URI(엔드포인트)</code>와 <code>기본 키(Primary Key)</code> 복사</li>
                  </ol>
                </div>

                {/* Step 2 */}
                <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-fg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/20 text-cyan text-xs font-mono">
                      2
                    </span>
                    Azure Static Web Apps (SWA) 생성 및 GitHub 연결
                  </div>
                  <ol className="mt-3 space-y-1.5 text-xs text-muted pl-8 list-decimal">
                    <li>Azure Portal에서 <strong>정적 웹앱 (Static Web Apps)</strong> 검색 후 생성 클릭</li>
                    <li>플랜 유형: <strong>무료 (Free - 취미 또는 개인 프로젝트용)</strong> 선택</li>
                    <li>배포 세부 정보: <strong>GitHub</strong> 선택 후 LIT 웹 저장소(Repository) 선택</li>
                    <li>빌드 세부 정보:
                      <ul className="mt-1 space-y-1 font-mono text-[11px] text-fg/80 pl-4 list-disc">
                        <li>빌드 사전 설정: <code>Custom</code> 또는 <code>Vite</code></li>
                        <li>앱 위치: <code>/</code></li>
                        <li>API 위치: <code>api</code></li>
                        <li>출력 위치: <code>dist</code></li>
                      </ul>
                    </li>
                  </ol>
                </div>

                {/* Step 3 */}
                <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-fg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/20 text-cyan text-xs font-mono">
                      3
                    </span>
                    환경변수 (Application Settings) 등록
                  </div>
                  <p className="mt-2 text-xs text-muted pl-8">
                    Azure Static Web Apps의 <strong>구성 (Configuration) → 애플리케이션 설정</strong>에서 아래 4개 변수를 추가합니다:
                  </p>
                  <div className="mt-3 pl-8">
                    <pre className="rounded-xl bg-black/60 p-3 font-mono text-[11px] text-cyan overflow-x-auto">
{`AZURE_COSMOS_DB_ENDPOINT=https://<your-cosmos>.documents.azure.com:443/
AZURE_COSMOS_DB_KEY=<your-primary-key>
AZURE_COSMOS_DB_DATABASE=LitMsaDatabase
AZURE_COSMOS_DB_CONTAINER=Members`}
                    </pre>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-fg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint/20 text-mint text-xs font-mono">
                      4
                    </span>
                    배포 완료 및 글로벌 도메인 접속
                  </div>
                  <p className="mt-2 text-xs text-muted pl-8 leading-relaxed">
                    저장소의 <code>main</code> 브랜치에 코드를 푸시하면 GitHub Actions가 자동으로 빌드 및 Azure에 배포를 완료합니다.
                    제공되는 <code>https://*.azurestaticapps.net</code> 주소로 접속하면 즉시 실시간 동기화되는 LIT 웹을 만날 수 있습니다!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 클라우드 API & 백업 설정 */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="rounded-2xl border border-line bg-white/[0.02] p-4 space-y-4">
                  <h4 className="font-display text-sm font-bold text-fg">Azure 연결 엔드포인트 설정</h4>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                      Azure Functions API Base URL
                    </label>
                    <input
                      type="text"
                      value={config.functionsApiUrl}
                      onChange={(e) => setConfig({ ...config, functionsApiUrl: e.target.value })}
                      placeholder="/api 또는 https://lit-msa-functions.azurewebsites.net/api"
                      className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-cyan/50 focus:outline-none"
                    />
                    <p className="mt-1 font-mono text-[10px] text-muted">
                      * Azure Static Web Apps에 배포 시 기본값 <code>/api</code>로 자동 연동됩니다.
                    </p>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                      Azure Cosmos DB NoSQL 엔드포인트 URI
                    </label>
                    <input
                      type="text"
                      value={config.endpoint}
                      onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                      placeholder="https://lit-knu-cosmos.documents.azure.com:443/"
                      className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-cyan/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted mb-1">
                      Azure Cosmos DB Primary Key 또는 Functions Host Key
                    </label>
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="Azure Portal 키(Keys) 메뉴의 기본 키 입력"
                      className="glass w-full rounded-xl px-3 py-2 text-xs text-fg focus:border-cyan/50 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-fg hover:border-cyan/50"
                    >
                      <Server className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      {isTesting ? '연결 확인 중...' : '연결 테스트'}
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-cyan px-5 py-2 text-xs font-bold text-bg hover:opacity-90 transition-opacity"
                    >
                      설정 저장
                    </button>
                  </div>

                  {testResult && (
                    <div
                      className={`mt-3 rounded-xl p-3 text-xs font-mono flex items-center gap-2 ${
                        testResult.success
                          ? 'border border-mint/40 bg-mint/10 text-mint'
                          : 'border border-pink/40 bg-pink/10 text-pink'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              </form>

              {/* JSON Backup & Restore */}
              <div className="rounded-2xl border border-line bg-white/[0.02] p-4 space-y-3">
                <h4 className="font-display text-sm font-bold text-fg">로컬 & 클라우드 JSON 백업 / 복원</h4>
                <p className="text-xs text-muted">
                  현재 플랫폼의 모든 부원, 클릭수, 아티클 데이터를 안전한 JSON 파일로 다운로드하거나 복원합니다.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-fg hover:border-white/30"
                  >
                    <Download className="h-3.5 w-3.5" />
                    전체 데이터 백업 다운로드 (.json)
                  </button>

                  <label className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-fg hover:border-white/30 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    백업 파일 복원 (.json)
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
