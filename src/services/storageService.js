// LIT x MSA 250 챌린지 데이터 및 스토리지 관리 서비스
// LocalStorage 기반 즉시 반응형 스토어 + Pub/Sub 이벤트 버스 탑재

const STORAGE_KEYS = {
  MEMBERS: 'lit_msa_members_v3',
  ARTICLES: 'lit_msa_articles_v1',
  MISSIONS: 'lit_msa_missions_v1',
  CURRENT_USER: 'lit_msa_current_user_v2',
  IS_ADMIN: 'lit_msa_is_admin_v2',
  FAQS: 'lit_msa_faqs_v1',
}

// 기본 마일스톤 및 리워드 정의
export const MILESTONES = [
  { count: 30, title: '30 달성', icon: '🌱', badge: '30 달성', reward: '커피 기프티콘', color: 'mint' },
  { count: 50, title: '50 달성', icon: '🌿', badge: '50 달성', reward: '편의점 기프티콘', color: 'amber' },
  { count: 100, title: '100 달성', icon: '🪴', badge: '100 달성', reward: '케익 기프티콘', color: 'pink' },
  { count: 150, title: '150 달성', icon: '🌳', badge: '150 달성', reward: '치킨 기프티콘', color: 'orange' },
  { count: 200, title: '200 달성', icon: '🍎', badge: '200 달성', reward: '자격증 응시비 지원', color: 'violet' },
  { count: 250, title: '250 달성', icon: '👑', badge: '250 달성', reward: 'MSA 달성', color: 'gold' },
]

export const createSolidColorAvatar = (hexColor) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(hexColor)}'/%3E%3C/svg%3E`

export const AVATAR_COLORS = [
  '#5EF0D6', // LIT Mint
  '#FF6FB1', // LIT Pink
  '#8B7BFF', // LIT Violet
  '#FFD166', // LIT Amber
  '#38BDF8', // Sky Blue
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F43F5E', // Coral
]

export const AVATAR_PRESETS = AVATAR_COLORS.map(createSolidColorAvatar)

// LIT 공식 관리자(운영진) 계정 정의
export const ADMIN_MEMBER = {
  id: 'admin-lit',
  handle: 'LIT',
  name: 'LIT 운영진',
  role: '운영진 (Admin)',
  major: 'LIT 운영국',
  contributorId: 'studentamb_482865',
  certifications: 'AI-900, AZ-900',
  clicks: 250,
  target: 250,
  msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482865',
  socials: {
    linkedin: 'https://linkedin.com/in/lit-knu',
    blog: 'https://velog.io/@lit-official',
    github: 'https://github.com/LITofficial',
  },
  bio: '경북대학교 IT 기술 발표 동아리 LIT 공식 운영진 계정입니다.',
  password: '1234',
  avatar: AVATAR_PRESETS[2], // LIT Violet (#8B7BFF)
  badges: ['30 달성', '50 달성', '100 달성', '150 달성', '200 달성', '250 달성'],
  isAdmin: true,
}

export function formatContributorLink(idOrUrl) {
  if (!idOrUrl) return 'https://learn.microsoft.com/?wt.mc_id=studentamb_482865'
  const trimmed = String(idOrUrl).trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  const cleanId = trimmed.replace(/^@/, '')
  const finalId = cleanId.startsWith('studentamb_') ? cleanId : `studentamb_${cleanId}`
  return `https://learn.microsoft.com/?wt.mc_id=${finalId}`
}

export function extractContributorId(idOrUrl) {
  if (!idOrUrl) return ''
  const trimmed = String(idOrUrl).trim()
  if (trimmed.includes('wt.mc_id=')) {
    const match = trimmed.match(/wt\.mc_id=([^&]+)/)
    if (match) return match[1]
  }
  if (!trimmed.startsWith('http')) {
    return trimmed
  }
  return trimmed
}

export function validateAndGenerateContributorUrl(originalUrl, contributorId) {
  if (!originalUrl || !String(originalUrl).trim()) {
    return { isValid: false, url: '', error: null }
  }

  let trimmed = String(originalUrl).trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed
  }

  let urlObj
  try {
    urlObj = new URL(trimmed)
  } catch (e) {
    return { isValid: false, url: '', error: '올바른 URL 형식(주소)을 입력해 주세요.' }
  }

  const hostname = urlObj.hostname.toLowerCase()

  // 1. 단축 URL 차단 (가이드 지침: Bitly 등 제3자 단축 URL 사용 금지)
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd', 'rebrand.ly', 'rb.gy', 'goo.gl']
  if (shorteners.some((s) => hostname === s || hostname.endsWith('.' + s))) {
    return {
      isValid: false,
      url: '',
      error: 'Bitly 등 제3자 단축 URL은 방문자 추적이 누락되므로 사용할 수 없습니다. Microsoft 원본 URL을 입력해 주세요.',
    }
  }

  // 2. Microsoft 적격 도메인 검사
  const isMsDomain =
    hostname === 'microsoft.com' ||
    hostname.endsWith('.microsoft.com') ||
    hostname === 'code.visualstudio.com' ||
    hostname.endsWith('.visualstudio.com')
  if (!isMsDomain) {
    return {
      isValid: false,
      url: '',
      error: 'Microsoft 공식 도메인(learn.microsoft.com, azure.microsoft.com 등)의 링크만 지원됩니다.',
    }
  }

  // 3. 언어-지역 코드 제거 (/ko-kr/, /en-us/, /ja-jp/ 등)
  urlObj.pathname = urlObj.pathname.replace(/^\/([a-zA-Z]{2}-[a-zA-Z]{2,4}|en|ko|ja|de|fr|es|zh|pt)(\/|$)/i, '/')

  // 4. 홈페이지 메인(루트) 링크 차단 (가이드 지침: 홈페이지 링크 지양, 구체적인 콘텐츠 공유 필요)
  const cleanPath = urlObj.pathname.replace(/\/+$/, '')
  if (!cleanPath || cleanPath === '') {
    return {
      isValid: false,
      url: '',
      error: '홈페이지 메인 주소(루트)는 유입 카운트 대상이 아닙니다. 구체적인 모듈이나 상세 콘텐츠 링크를 입력해 주세요.',
    }
  }

  // 5. Microsoft Learn Plans(플랜) 차단 (가이드 지침: Learn Plans는 Community Influencer 카운트 불가)
  if (/\/(training\/)?plans(\/|$)/i.test(urlObj.pathname)) {
    return {
      isValid: false,
      url: '',
      error: 'Microsoft Learn Plans(플랜) 링크는 Community Influencer 카운트 대상이 아닙니다. 모듈 또는 학습 경로 링크를 사용하세요.',
    }
  }

  // 6. Contributor ID 포맷팅
  let cleanId = String(contributorId || '').trim()
  if (!cleanId) cleanId = 'studentamb_482865'
  cleanId = cleanId.replace(/^@/, '')
  const finalId = cleanId.startsWith('studentamb_') ? cleanId : `studentamb_${cleanId}`

  // 7. 기존 파라미터 보존 및 Contributor ID 연결
  // 가이드 지침: 기존 파라미터(?WT.mc_id=academic 등)는 유지하고 &wt.mc_id=studentamb_... 추가
  // 단, 기존에 이미 studentamb_ 파라미터가 있다면 본인 ID로 교체
  const params = Array.from(urlObj.searchParams.entries())
  urlObj.search = ''
  let replacedAmb = false
  for (const [k, v] of params) {
    if (k.toLowerCase() === 'wt.mc_id' && v.toLowerCase().startsWith('studentamb_')) {
      if (!replacedAmb) {
        urlObj.searchParams.append('wt.mc_id', finalId)
        replacedAmb = true
      }
    } else {
      urlObj.searchParams.append(k, v)
    }
  }
  if (!replacedAmb) {
    urlObj.searchParams.append('wt.mc_id', finalId)
  }

  return { isValid: true, url: urlObj.toString(), error: null }
}

export function generateContributorUrl(originalUrl, contributorId) {
  const res = validateAndGenerateContributorUrl(originalUrl, contributorId)
  return res.isValid ? res.url : ''
}

// 초기 부원 목업 데이터 (LIT 부원 샘플)
const DEFAULT_MEMBERS = [
  {
    id: 'm1',
    handle: 'shlee',
    name: '이승현',
    role: 'LIT 회장 / MSA',
    major: '컴퓨터학부 21학번',
    contributorId: 'studentamb_482865',
    clicks: 184,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482865',
    socials: {
      linkedin: 'https://linkedin.com/in/lit-knu',
      blog: 'https://velog.io/@lit-official',
      github: 'https://github.com/LITofficial',
    },
    bio: '클라우드와 AI 에이전트 아키텍처에 관심이 많습니다. 함께 250 달성해요!',
    password: '1234',
    avatar: AVATAR_PRESETS[0], // LIT Mint (#5EF0D6)
    badges: ['30 달성', '50 달성', '100 달성', '150 달성'],
  },
  {
    id: 'm2',
    handle: 'minji_kim',
    name: '김민지',
    role: 'LIT 부원 / MSA',
    major: '컴퓨터학부 22학번',
    contributorId: 'studentamb_482866',
    clicks: 250,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482866',
    socials: {
      linkedin: 'https://linkedin.com',
      blog: 'https://velog.io',
      github: 'https://github.com',
    },
    bio: 'Azure OpenAI와 LangChain으로 RAG 챗봇 구축하기 시리즈를 연재 중입니다.',
    avatar: AVATAR_PRESETS[1], // LIT Pink (#FF6FB1)
    badges: ['30 달성', '50 달성', '100 달성', '150 달성', '200 달성', '250 달성'],
  },
  {
    id: 'm3',
    handle: 'junho_park',
    name: '박준호',
    role: 'LIT 기술팀장',
    major: '전자공학부 20학번',
    contributorId: 'studentamb_482867',
    clicks: 132,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482867',
    socials: {
      linkedin: 'https://linkedin.com',
      blog: 'https://velog.io',
      github: 'https://github.com',
    },
    bio: 'Kubernetes Self-Healing 및 클라우드 네이티브 아키텍처 스터디 리드.',
    avatar: AVATAR_PRESETS[4], // Sky Blue (#38BDF8)
    badges: ['30 달성', '50 달성', '100 달성'],
  },
  {
    id: 'm4',
    handle: 'sujin_choi',
    name: '최수진',
    role: 'LIT 기획팀장',
    major: '인공지능전공 23학번',
    contributorId: 'studentamb_482868',
    clicks: 86,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482868',
    socials: {
      linkedin: 'https://linkedin.com',
      blog: 'https://velog.io',
      github: 'https://github.com',
    },
    bio: 'GitHub Copilot과 개발 생산성 도구 활용법을 포스팅하고 있어요.',
    avatar: AVATAR_PRESETS[3], // Amber (#FFD166)
    badges: ['30 달성', '50 달성'],
  },
  {
    id: 'm5',
    handle: 'dohyun_lee',
    name: '이도현',
    role: 'LIT 부원',
    major: '컴퓨터학부 23학번',
    contributorId: 'studentamb_482869',
    clicks: 64,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482869',
    socials: {
      linkedin: 'https://linkedin.com',
      blog: 'https://velog.io',
      github: 'https://github.com',
    },
    bio: 'Entra ID 기반 클라우드 보안과 제로 트러스트 실습 중!',
    avatar: AVATAR_PRESETS[5], // Indigo (#6366F1)
    badges: ['30 달성', '50 달성'],
  },
  {
    id: 'm6',
    handle: 'chaewon_yoon',
    name: '윤채원',
    role: 'LIT 부원',
    major: '소프트웨어학과 24학번',
    contributorId: 'studentamb_482870',
    clicks: 42,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482870',
    socials: {
      linkedin: 'https://linkedin.com',
      blog: 'https://velog.io',
      github: 'https://github.com',
    },
    bio: '새싹 개발자의 MS Learn 첫 달성 일기. 링크 클릭 한 번씩 부탁드려요!',
    avatar: AVATAR_PRESETS[7], // Coral (#F43F5E)
    badges: ['30 달성'],
  },
  {
    id: 'm7',
    handle: 'taeyang_jung',
    name: '정태양',
    role: 'LIT 부원',
    major: '글로벌소프트웨어융합전공 22학번',
    contributorId: 'studentamb_482871',
    clicks: 218,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482871',
    socials: {
      linkedin: 'https://linkedin.com',
      blog: 'https://velog.io',
      github: 'https://github.com',
    },
    bio: 'Vector Search와 Semantic Kernel로 비정형 데이터 분석하기.',
    avatar: AVATAR_PRESETS[6], // Emerald (#10B981)
    badges: ['30 달성', '50 달성', '100 달성', '150 달성', '200 달성'],
  },
  {
    id: 'm8',
    handle: 'yejin_han',
    name: '한예진',
    role: 'LIT 홍보팀',
    major: '경영학부 21학번',
    contributorId: 'studentamb_482872',
    clicks: 28,
    target: 250,
    msLink: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482872',
    socials: {
      linkedin: 'https://linkedin.com',
      blog: 'https://velog.io',
      github: 'https://github.com',
    },
    bio: '비전공자의 테크 에반젤리스트 도전기! 30 클릭 돌파 직전!',
    avatar: AVATAR_PRESETS[2], // LIT Violet (#8B7BFF)
    badges: [],
  },
]

// 초기 아티클 목업 데이터 (부원들이 작성한 LinkedIn/블로그 글)
const DEFAULT_ARTICLES = [
  {
    id: 'art-1',
    title: '대학생이 Azure OpenAI와 LangChain으로 3일 만에 RAG 구축해본 후기',
    excerpt: 'LIT 동아리 6월 Meetup에서 발표한 RAG 파이프라인 실습 내용과 Microsoft Learn AI 경로 학습 및 달성 과정을 정리했습니다. 제 MSA 챌린지 링크도 함께 확인해 보세요!',
    url: 'https://linkedin.com/posts/example-rag-article',
    learnUrl: 'https://learn.microsoft.com/training/modules/get-started-with-ai-in-azure/?wt.mc_id=studentamb_517841',
    platform: 'linkedin',
    authorHandle: 'minji_kim',
    authorName: '김민지',
    authorAvatar: AVATAR_PRESETS[1], // LIT Pink (#FF6FB1)
    tags: ['Azure AI', 'RAG', 'LangChain', 'Meetup'],
    likes: 42,
    createdAt: '2026-09-15',
  },
  {
    id: 'art-2',
    title: 'Kubernetes 클러스터 Self-Healing 구조 파헤치기 (Feat. AKS)',
    excerpt: 'Pod가 죽었을 때 쿠버네티스는 어떻게 이를 감지하고 스스로 복구할까요? 노드 장애 시나리오와 함께 Azure Kubernetes Service 실습 가이드를 공유합니다.',
    url: 'https://velog.io/@junho/k8s-self-healing',
    learnUrl: 'https://learn.microsoft.com/training/modules/intro-to-kubernetes-on-azure/?wt.mc_id=studentamb_507003',
    platform: 'velog',
    authorHandle: 'junho_park',
    authorName: '박준호',
    authorAvatar: AVATAR_PRESETS[4], // Sky Blue (#38BDF8)
    tags: ['K8s', 'DevOps', 'AKS', 'CloudNative'],
    likes: 29,
    createdAt: '2026-09-12',
  },
  {
    id: 'art-3',
    title: 'Microsoft Learn Student Ambassadors(MSA) 250 클릭 챌린지 시작 가이드',
    excerpt: 'LIT 동아리 전 부원이 함께 도전하는 MSA 챌린지! 링크 생성 방법, LinkedIn 배포 전략, 그리고 중간 체크포인트 리워드 안내까지 총정리했습니다.',
    url: 'https://linkedin.com/posts/example-msa-guide',
    learnUrl: 'https://learn.microsoft.com/training/modules/get-started-with-ai-in-azure/?wt.mc_id=studentamb_482865',
    platform: 'linkedin',
    authorHandle: 'shlee',
    authorName: '이승현',
    authorAvatar: AVATAR_PRESETS[0], // LIT Mint (#5EF0D6)
    tags: ['MSA챌린지', 'MSA', 'TechCommunity', 'LIT'],
    likes: 58,
    createdAt: '2026-09-18',
  },
  {
    id: 'art-4',
    title: 'Vector Search로 텍스트 의미 검색 구현하기: Azure AI Search 심층 분석',
    excerpt: '단순 키워드 검색의 한계를 넘어 고차원 임베딩 벡터를 활용한 검색 엔진 구축 경험을 나눕니다. 코사인 유사도와 하이브리드 검색 비교.',
    url: 'https://velog.io/@taeyang/vector-search-ai',
    learnUrl: 'https://learn.microsoft.com/training/modules/get-started-azure-ai-search/?wt.mc_id=studentamb_522075',
    platform: 'velog',
    authorHandle: 'taeyang_jung',
    authorName: '정태양',
    authorAvatar: AVATAR_PRESETS[6], // Emerald (#10B981)
    tags: ['VectorSearch', 'Embedding', 'AzureSearch'],
    likes: 35,
    createdAt: '2026-09-10',
  },
  {
    id: 'art-5',
    title: '비전공자가 3주 만에 클라우드 기초(AZ-900) 정복한 공부법과 MS Learn 추천 경로',
    excerpt: '코딩을 몰라도 클라우드를 이해할 수 있을까요? 개념부터 차근차근 시작한 비전공자의 솔직한 학습 후기와 무료 학습 모듈 추천.',
    url: 'https://velog.io/@yejin/az-900-cloud-basics',
    learnUrl: 'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/?wt.mc_id=studentamb_544005',
    platform: 'velog',
    authorHandle: 'yejin_han',
    authorName: '한예진',
    authorAvatar: AVATAR_PRESETS[2], // LIT Violet (#8B7BFF)
    tags: ['AZ900', 'MSLearn', '비전공자', '스터디'],
    likes: 24,
    createdAt: '2026-09-08',
  },
  {
    id: 'art-6',
    title: '개발자 생산성을 2배로 올리는 GitHub Copilot 프롬프트 엔지니어링 팁 5가지',
    excerpt: '단순한 자동 완성을 넘어 컨텍스트 파일 주입, 테스트 코드 작성, 리팩토링까지 스마트하게 코파일럿을 부려먹는 실전 팁을 정리했습니다.',
    url: 'https://linkedin.com/posts/example-copilot-tips',
    learnUrl: 'https://learn.microsoft.com/training/modules/get-started-github-copilot/?wt.mc_id=studentamb_539571',
    platform: 'linkedin',
    authorHandle: 'sujin_choi',
    authorName: '최수진',
    authorAvatar: AVATAR_PRESETS[3], // Amber (#FFD166)
    tags: ['GitHubCopilot', 'Productivity', 'AI개발'],
    likes: 31,
    createdAt: '2026-09-14',
  },
]

// 관리자 미션 공지 목업 데이터
const DEFAULT_MISSIONS = [
  {
    id: 'mis-1',
    title: '🎯 LinkedIn에 첫 기술 글 게시 & LIT 피드 공유',
    desc: 'Microsoft Learn에서 이번 주 학습한 모듈이나 세션 주제를 바탕으로 LinkedIn에 글을 작성하고, 본문에 본인의 챌린지 링크를 연결한 후 LIT 피드에 등록하세요.',
    reward: '☕ 스타벅스 커피 쿠폰 추첨 + 동아리 50P',
    deadline: '2026-09-27',
    completedMemberHandles: ['shlee', 'minji_kim', 'junho_park', 'taeyang_jung'],
    active: true,
  },
  {
    id: 'mis-2',
    title: '🤝 다른 부원의 글 3개 이상 읽고 응원 댓글 & 피드백 달기',
    desc: 'LIT의 힘은 서로 배우고 가르치는(Learn It, Teach) 커뮤니티에서 나옵니다. LIT 피드에서 다른 부원들의 글을 읽고 LinkedIn/블로그에 피드백을 남겨주세요.',
    reward: '⭐ 커뮤니티 뱃지 + 동아리 30P',
    deadline: '2026-09-30',
    completedMemberHandles: ['shlee', 'sujin_choi', 'minji_kim'],
    active: true,
  },
  {
    id: 'mis-3',
    title: '⚡ 주말 동안 클릭수 +20 달성하기',
    desc: '학과 단톡방, SNS, 개발 커뮤니티에 내가 작성한 유익한 기술 요약글을 공유하여 주말 동안 클릭수를 20 이상 끌어올려 보세요!',
    reward: '🚀 LIT 한정판 스티커 팩 + 100달성 가속 보너스',
    deadline: '2026-09-22',
    completedMemberHandles: ['minji_kim', 'taeyang_jung'],
    active: true,
  },
  {
    id: 'mis-4',
    title: '👑 100 조회수 돌파하고 Microsoft 자격증 바우처 신청하기',
    desc: '누적 100 클릭을 달성한 부원은 운영진에게 알려주시면 GH-900 또는 AI-900 공식 시험 응시권(100% 지원)을 지급해 드립니다.',
    reward: '🎓 Microsoft 공인 자격증 시험 바우처 전액 지원',
    deadline: '2026-10-31',
    completedMemberHandles: ['shlee', 'minji_kim', 'junho_park', 'taeyang_jung'],
    active: true,
  },
]

// 초기 FAQ 목업 데이터 (관리자 추가/수정/삭제 지원)
const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    q: 'MSA(Microsoft Student Ambassadors) 챌린지란 무엇인가요?',
    a: 'Microsoft가 전 세계 학생 리더들을 육성하는 공식 프로그램의 일환으로, 각 부원에게 부여된 Microsoft Learn 고유 추천 링크를 통해 250명의 클릭/참여를 달성하는 챌린지입니다. 배운 내용을 사람들에게 나누고 기술을 널리 알리는 Tech Evangelism 활동의 공식 증명이 됩니다.',
  },
  {
    id: 'faq-2',
    q: '내 고유 링크(250 클릭 링크)는 어떻게 만드나요?',
    a: 'Microsoft Learn 포털(learn.microsoft.com)에 로그인 후, Ambassador 프로필 또는 특정 모듈 링크 뒤에 본인의 고유 태그(?wt.mc_id=studentamb_XXXXXX)를 붙여 발급받습니다. 발급받은 링크를 본 웹사이트의 [내 프로필]에 등록해 두면 언제든 쉽게 복사하고 공유할 수 있습니다.',
  },
  {
    id: 'faq-3',
    q: '체크포인트(30, 50, 100, 150, 200, 250) 리워드는 어떻게 받나요?',
    a: '본인의 대시보드에서 클릭수를 업데이트하면 리더보드에 자동으로 뱃지가 부여됩니다. 30 클릭(커피 기프티콘), 50 클릭(편의점 기프티콘), 100 클릭(케익 기프티콘), 150 클릭(치킨 기프티콘), 200 클릭(자격증 응시비 지원), 250 클릭(MSA 달성) 시 운영진이 확인 후 리워드를 전달합니다.',
  },
  {
    id: 'faq-4',
    q: '내가 쓴 글 링크는 어떻게 공유하나요?',
    a: 'LinkedIn, Velog, Tistory, Medium 등에 학습 글을 기고한 뒤, 웹 상단의 [새 글 공유하기] 버튼을 눌러 링크와 간단한 설명을 등록하면 LIT 피드에 즉시 노출됩니다. 내 글의 공유 링크(?author=내아이디)를 친구나 SNS에 보내면 내가 쓴 글들이 최우선으로 노출되면서도 동아리 전체 글도 함께 탐색할 수 있습니다.',
  },
  {
    id: 'faq-5',
    q: 'MS 공인 자격증(AI-900, AZ-900 등)은 어떻게 등록하나요?',
    a: '내 프로필 수정 화면에서 보유한 Microsoft 공인 자격증(예: AI-900, AZ-900, DP-900 등)을 입력하시면 리더보드와 내 대시보드에 공식 인증 뱃지가 자동으로 표시됩니다.',
  },
]

// Pub/Sub 리스너 관리
const listeners = new Set()
function notify() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch (err) {
      console.error('Storage listener error:', err)
    }
  })
}

// Cloud Sync Helper with Azure Cosmos DB & Functions
let isSyncing = false
export async function syncFromCloud() {
  if (isSyncing || typeof window === 'undefined') return
  isSyncing = true
  try {
    const res = await fetch('/api/members')
    if (res.ok) {
      const json = await res.json()
      const cloudMembers = Array.isArray(json.data) ? json.data : Array.isArray(json.members) ? json.members : []
      if (cloudMembers.length > 0) {
        // Cosmos DB에 등록된 부원이 있는 경우 로컬 저장소와 스마트 병합
        const local = storageService.getMembers()
        const map = new Map()

        // 1. 기본/로컬 멤버 먼저 세팅
        local.forEach((m) => {
          if (m && m.handle) map.set(m.handle.toLowerCase(), m)
        })

        // 2. 클라우드 멤버로 최신 업데이트 및 병합
        cloudMembers.forEach((cm) => {
          if (!cm || !cm.handle) return
          const key = cm.handle.toLowerCase()
          const existing = map.get(key)
          if (existing) {
            map.set(key, { ...existing, ...cm })
          } else {
            map.set(key, cm)
          }
        })

        const merged = Array.from(map.values())
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(merged))
        notify()
      } else {
        // Cosmos DB가 비어있는 초기 상태인 경우, 기본 부원 데이터를 클라우드로 일괄 전송(Seed)
        const local = storageService.getMembers()
        if (local.length > 0) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ members: local }),
          }).catch(() => {})
        }
      }
    }
  } catch (err) {
    console.debug('[Azure Sync] Local-first mode active:', err.message)
  } finally {
    isSyncing = false
  }
}

// 브라우저 환경에서 실시간 클라우드 자동 동기화 활성화
if (typeof window !== 'undefined') {
  setTimeout(syncFromCloud, 500)
  window.addEventListener('focus', () => syncFromCloud())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncFromCloud()
  })
  setInterval(syncFromCloud, 10000)
}

export const storageService = {
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  // 1. Members
  getMembers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      if (data) {
        const list = JSON.parse(data)
        return list.map((m) => {
          const rawClicks = Number(m.clicks)
          const clicks = isNaN(rawClicks) ? 0 : Math.max(0, rawClicks)
          const contributorId = m.contributorId || extractContributorId(m.msLink) || 'studentamb_482865'
          const badges = MILESTONES.filter((ml) => clicks >= ml.count).map((ml) => ml.badge)
          // 만약 기존 저장된 아바타가 Unsplash 사진이거나 비어있으면 새 단색 프리셋으로 자동 교체
          let avatar = m.avatar
          if (!avatar || avatar.includes('unsplash.com') || avatar.includes('dicebear')) {
            const defaultMatch = DEFAULT_MEMBERS.find((dm) => dm.handle === m.handle)
            if (defaultMatch) {
              avatar = defaultMatch.avatar
            } else {
              const hash = (m.handle || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
              avatar = AVATAR_PRESETS[hash % AVATAR_PRESETS.length]
            }
          }
          const memberClean = {
            ...m,
            clicks,
            avatar,
            role: (m.role || '').replace(/MLSA/g, 'MSA'),
            contributorId,
            certifications: m.certifications || (m.handle === 'shlee' ? 'AI-900, AZ-900' : m.handle === 'minji_kim' ? 'AI-900' : m.handle === 'junho_park' ? 'AZ-900' : ''),
            msLink: m.msLink || formatContributorLink(contributorId),
            password: m.password || '1234',
            badges,
          }
          delete memberClean.generation
          return memberClean
        })
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e)
    }
    // 기본값 저장 후 반환
    const withPw = DEFAULT_MEMBERS.map((m) => ({ ...m, password: m.password || '1234' }))
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(withPw))
    return withPw
  },

  getMember(handle) {
    if (!handle) return null
    const clean = String(handle).trim()
    if (clean.toUpperCase() === 'LIT') {
      try {
        const savedAdmin = localStorage.getItem('lit_admin_member_override')
        if (savedAdmin) {
          Object.assign(ADMIN_MEMBER, JSON.parse(savedAdmin))
        }
      } catch (e) {}
      return ADMIN_MEMBER
    }
    const members = this.getMembers()
    return members.find((m) => m.handle.toLowerCase() === clean.toLowerCase()) || null
  },

  // 권한 확인: 관리자이거나 현재 로그인한 본인 계정인지 검증
  checkEditPermission(targetHandle) {
    if (this.isAdmin()) return true
    const current = this.getCurrentUser()
    return current && current.handle.toLowerCase() === String(targetHandle).toLowerCase()
  },

  loginMember(handle, password) {
    const clean = String(handle || '').trim()

    // 1. LIT 운영진(관리자) 로그인 (아이디: LIT, 비밀번호: 1234)
    if (clean.toUpperCase() === 'LIT') {
      if (password !== '1234') {
        return { success: false, message: '비밀번호가 올바르지 않습니다. (운영진 비밀번호: 1234)' }
      }
      this.setAdmin(true)
      this.setCurrentUser('LIT')
      return { success: true, member: ADMIN_MEMBER, isAdmin: true }
    }

    // 2. 일반 부원 로그인
    const member = this.getMember(clean)
    if (!member) {
      return { success: false, message: '등록되지 않은 아이디입니다.' }
    }
    const memberPw = member.password || '1234'
    if (memberPw !== password) {
      return { success: false, message: '비밀번호가 올바르지 않습니다.' }
    }
    this.setAdmin(false)
    this.setCurrentUser(member.handle)
    return { success: true, member, isAdmin: false }
  },

  updateMemberClicks(handle, amount, isAbsolute = false) {
    if (!this.checkEditPermission(handle)) {
      alert('본인 계정의 클릭수만 수정할 수 있습니다. (관리자만 타인 계정 수정 가능)')
      return null
    }

    const clean = String(handle).trim()
    const delta = Number(amount) || 0

    if (clean.toUpperCase() === 'LIT') {
      const currentClicks = Math.max(0, Number(ADMIN_MEMBER.clicks) || 0)
      const nextClicks = isAbsolute ? Math.max(0, delta) : Math.max(0, currentClicks + delta)
      ADMIN_MEMBER.clicks = nextClicks
      ADMIN_MEMBER.badges = MILESTONES.filter((ml) => nextClicks >= ml.count).map((ml) => ml.badge)
      try {
        localStorage.setItem('lit_admin_member_override', JSON.stringify(ADMIN_MEMBER))
      } catch (e) {}
      notify()
      return ADMIN_MEMBER
    }

    const members = this.getMembers()
    const updated = members.map((m) => {
      if (m.handle.toLowerCase() === clean.toLowerCase()) {
        const currentClicks = Math.max(0, Number(m.clicks) || 0)
        const nextClicks = isAbsolute ? Math.max(0, delta) : Math.max(0, currentClicks + delta)
        // 뱃지 자동 계산
        const badges = MILESTONES.filter((ml) => nextClicks >= ml.count).map((ml) => ml.badge)
        return {
          ...m,
          clicks: nextClicks,
          badges,
        }
      }
      return m
    })
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated))
    notify()

    // Azure Cosmos DB로 클릭수 실시간 전송
    fetch('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: clean, amount, isAbsolute }),
    }).catch((e) => console.debug('[Azure Sync] clicks error:', e))

    return updated.find((m) => m.handle.toLowerCase() === clean.toLowerCase())
  },

  updateMemberProfile(handle, partial) {
    if (!this.checkEditPermission(handle)) {
      alert('본인의 프로필만 수정할 수 있습니다. (관리자만 타인 계정 수정 가능)')
      return null
    }

    const sanitized = { ...partial }
    delete sanitized.generation
    if (sanitized.contributorId) {
      sanitized.contributorId = sanitized.contributorId.trim()
      sanitized.msLink = formatContributorLink(sanitized.contributorId)
    }

    const clean = String(handle).trim()
    if (clean.toUpperCase() === 'LIT') {
      Object.assign(ADMIN_MEMBER, sanitized)
      try {
        localStorage.setItem('lit_admin_member_override', JSON.stringify(ADMIN_MEMBER))
      } catch (e) {}
      notify()
      return ADMIN_MEMBER
    }

    const members = this.getMembers()
    const updated = members.map((m) => {
      if (m.handle.toLowerCase() === clean.toLowerCase()) {
        return { ...m, ...sanitized }
      }
      return m
    })
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated))
    notify()

    // Azure Cosmos DB로 프로필 변경사항 실시간 전송
    const savedMember = updated.find((m) => m.handle.toLowerCase() === clean.toLowerCase())
    if (savedMember) {
      fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedMember),
      }).catch((e) => console.debug('[Azure Sync] profile update error:', e))
    }

    return savedMember
  },

  addMember(newMember) {
    const members = this.getMembers()
    const existing = members.find((m) => m.handle === newMember.handle)
    if (existing) {
      return this.updateMemberProfile(newMember.handle, newMember)
    }
    const contributorId = (newMember.contributorId || extractContributorId(newMember.msLink) || '').trim()
    const msLink = formatContributorLink(contributorId || newMember.msLink)
    const memberObj = {
      id: `m-${Date.now()}`,
      handle: newMember.handle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      name: newMember.name,
      password: newMember.password || '1234',
      role: newMember.role || 'LIT 부원',
      major: newMember.major || '컴퓨터학부',
      certifications: (newMember.certifications || '').trim(),
      contributorId: contributorId || (msLink ? extractContributorId(msLink) : ''),
      clicks: Number(newMember.clicks) || 0,
      target: 250,
      msLink,
      socials: {
        linkedin: newMember.linkedin || '',
        blog: newMember.blog || '',
        github: newMember.github || '',
      },
      bio: newMember.bio || 'MSA 챌린지 250 클릭 달성을 향해 달립니다!',
      avatar:
        newMember.avatar ||
        AVATAR_PRESETS[Math.abs((newMember.handle || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % AVATAR_PRESETS.length],
      badges: MILESTONES.filter((ml) => (Number(newMember.clicks) || 0) >= ml.count).map((ml) => ml.badge),
    }
    members.push(memberObj)
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))
    this.setCurrentUser(memberObj.handle)
    notify()

    // Azure Cosmos DB로 신규 부원 실시간 전송
    fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberObj),
    }).catch((e) => console.debug('[Azure Sync] addMember error:', e))

    return memberObj
  },

  deleteMember(handle) {
    if (!this.isAdmin()) {
      alert('관리자만 부원을 삭제할 수 있습니다.')
      return false
    }
    const clean = String(handle).trim()
    if (clean.toUpperCase() === 'LIT') {
      alert('LIT 운영진 대표 계정은 삭제할 수 없습니다.')
      return false
    }
    const members = this.getMembers().filter((m) => m.handle.toLowerCase() !== clean.toLowerCase())
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))
    const current = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (current && current.toLowerCase() === clean.toLowerCase()) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'LIT')
    }
    notify()

    // Azure Cosmos DB에서 부원 삭제 실시간 전송
    fetch(`/api/members?handle=${encodeURIComponent(clean)}`, {
      method: 'DELETE',
    }).catch((e) => console.debug('[Azure Sync] deleteMember error:', e))

    return true
  },

  // 2. Current User & Admin
  getCurrentUser() {
    const currentHandle = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (!currentHandle) {
      return null
    }
    if (String(currentHandle).toUpperCase() === 'LIT') {
      if (!this.isAdmin()) {
        localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true')
      }
      return ADMIN_MEMBER
    }
    return this.getMember(currentHandle) || null
  },

  setCurrentUser(handle) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, handle)
    if (String(handle).toUpperCase() === 'LIT') {
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true')
    }
    notify()
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    this.setAdmin(false)
    notify()
  },

  isAdmin() {
    const currentHandle = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (currentHandle && String(currentHandle).toUpperCase() === 'LIT') {
      return true
    }
    return localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true'
  },

  setAdmin(isAdmin) {
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, isAdmin ? 'true' : 'false')
    notify()
  },

  verifyAdminPasscode(code) {
    const valid = code === '1234' || code === 'lit2026!' || code === 'admin'
    if (valid) {
      this.setAdmin(true)
    }
    return valid
  },

  // 3. Articles
  getArticles() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARTICLES)
      if (data) {
        const list = JSON.parse(data)
        const members = this.getMembers()
        return list.map((art) => {
          let authorAvatar = art.authorAvatar
          if (!authorAvatar || authorAvatar.includes('unsplash.com') || authorAvatar.includes('dicebear')) {
            const author = members.find((m) => m.handle === art.authorHandle)
            authorAvatar = author?.avatar || AVATAR_PRESETS[0]
          }
          return { ...art, authorAvatar }
        })
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e)
    }
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(DEFAULT_ARTICLES))
    return DEFAULT_ARTICLES
  },

  addArticle(article) {
    const articles = this.getArticles()
    const author = this.getMember(article.authorHandle) || this.getCurrentUser()
    const newArt = {
      id: `art-${Date.now()}`,
      title: article.title,
      excerpt: article.excerpt || '',
      url: article.url,
      learnUrl: article.learnUrl || '',
      platform: article.platform || 'linkedin',
      authorHandle: author.handle,
      authorName: author.name,
      authorAvatar: author.avatar,
      tags: Array.isArray(article.tags)
        ? article.tags
        : (article.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      likes: 1,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    articles.unshift(newArt)
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
    notify()
    return newArt
  },

  toggleArticleLike(articleId) {
    const articles = this.getArticles()
    const updated = articles.map((a) => {
      if (a.id === articleId) {
        return { ...a, likes: (a.likes || 0) + 1 }
      }
      return a
    })
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updated))
    notify()
  },

  deleteArticle(articleId) {
    const articles = this.getArticles().filter((a) => a.id !== articleId)
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
    notify()
  },

  updateArticle(articleId, partial) {
    const articles = this.getArticles()
    const author = partial.authorHandle ? this.getMember(partial.authorHandle) : null
    const updated = articles.map((a) => {
      if (a.id === articleId) {
        const rawTags = partial.tags !== undefined ? partial.tags : a.tags
        const tags = Array.isArray(rawTags)
          ? rawTags
          : typeof rawTags === 'string'
          ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
          : a.tags
        return {
          ...a,
          ...partial,
          authorName: author ? author.name : (partial.authorName || a.authorName),
          authorAvatar: author ? author.avatar : (partial.authorAvatar || a.authorAvatar),
          tags,
        }
      }
      return a
    })
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updated))
    notify()
    return updated.find((a) => a.id === articleId)
  },

  // 4. Missions
  getMissions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSIONS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m) => ({
            ...m,
            title: (m.title || '')
              .replace(/\[주간 미션\]/g, '')
              .replace(/\[동료 피드백\]/g, '')
              .replace(/\[부스트 퀘스트\]/g, '')
              .replace(/\[마일스톤 챌린지\]/g, '')
              .replace(/\s+/g, ' ')
              .trim(),
          }))
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e)
    }
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(DEFAULT_MISSIONS))
    return DEFAULT_MISSIONS
  },

  addMission(mission) {
    const missions = this.getMissions()
    const newMis = {
      id: `mis-${Date.now()}`,
      title: mission.title,
      desc: mission.desc,
      reward: mission.reward || '동아리 포인트',
      category: mission.category || 'weekly',
      deadline: mission.deadline || '2026-10-31',
      completedMemberHandles: [],
      active: true,
    }
    missions.unshift(newMis)
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions))
    notify()
    return newMis
  },

  updateMission(missionId, partial) {
    const missions = this.getMissions()
    const updated = missions.map((m) => (m.id === missionId ? { ...m, ...partial } : m))
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated))
    notify()
  },

  deleteMission(missionId) {
    const missions = this.getMissions().filter((m) => m.id !== missionId)
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions))
    notify()
  },

  toggleMissionCompletion(missionId, memberHandle) {
    const cleanHandle = String(memberHandle || '').trim().toLowerCase()
    if (!cleanHandle) return
    const missions = this.getMissions()
    const updated = missions.map((m) => {
      if (m.id === missionId) {
        const rawHandles = Array.isArray(m.completedMemberHandles) ? m.completedMemberHandles : []
        const exists = rawHandles.some((h) => String(h).trim().toLowerCase() === cleanHandle)
        let nextHandles
        if (exists) {
          nextHandles = rawHandles.filter((h) => String(h).trim().toLowerCase() !== cleanHandle)
        } else {
          nextHandles = [...rawHandles, memberHandle]
        }
        return { ...m, completedMemberHandles: nextHandles }
      }
      return m
    })
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated))
    notify()
    return updated.find((m) => m.id === missionId)
  },

  // 5. FAQs (자주 묻는 질문 - 관리자 CRUD)
  getFaqs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAQS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((item) => !item.q?.includes('Azure 시스템으로 DB 관리'))
            .map((item, idx) => ({
              ...item,
              id: item.id || `faq-${idx + 1}`,
            }))
        }
      }
    } catch (e) {
      console.warn('LocalStorage FAQ read error:', e)
    }
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(DEFAULT_FAQS))
    return DEFAULT_FAQS
  },

  addFaq(faqItem) {
    const faqs = this.getFaqs()
    const newFaq = {
      id: `faq-${Date.now()}`,
      q: faqItem.q?.trim() || '새로운 질문',
      a: faqItem.a?.trim() || '',
      createdAt: new Date().toISOString(),
    }
    faqs.push(newFaq)
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs))
    notify()
    return newFaq
  },

  updateFaq(faqId, partial) {
    const faqs = this.getFaqs()
    const updated = faqs.map((item) => {
      if (item.id === faqId) {
        return {
          ...item,
          q: partial.q !== undefined ? partial.q.trim() : item.q,
          a: partial.a !== undefined ? partial.a.trim() : item.a,
          updatedAt: new Date().toISOString(),
        }
      }
      return item
    })
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(updated))
    notify()
    return updated.find((f) => f.id === faqId)
  },

  deleteFaq(faqId) {
    const faqs = this.getFaqs().filter((item) => item.id !== faqId)
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs))
    notify()
    return true
  },

  // 6. Cloud Backup & JSON Export
  exportAllData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      club: 'Learn It, Teach (LIT)',
      challenge: 'Microsoft Learn Student Ambassadors 250 Challenge',
      members: this.getMembers(),
      articles: this.getArticles(),
      missions: this.getMissions(),
      faqs: this.getFaqs(),
    }
  },

  importAllData(jsonObj) {
    if (jsonObj && jsonObj.members && jsonObj.articles && jsonObj.missions) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(jsonObj.members))
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(jsonObj.articles))
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(jsonObj.missions))
      if (jsonObj.faqs) {
        localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(jsonObj.faqs))
      }
      notify()
      return true
    }
    return false
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS))
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(DEFAULT_ARTICLES))
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(DEFAULT_MISSIONS))
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(DEFAULT_FAQS))
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'false')
    notify()
  },
}

