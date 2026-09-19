// 사이트 전체 콘텐츠. 문구/링크/일정은 이 파일만 수정하면 됩니다.

export const links = {
  instagram: 'https://www.instagram.com/lit_knu/',
  linktree: 'https://linktr.ee/learnitandteach',
  github: 'https://github.com/LITofficial',
  notion: 'https://www.notion.so/LIT-311ab05f4ff2804bb983ce59e57d9ec3',
  kakao: 'https://open.kakao.com/o/sUWY1hii',
  apply: 'https://forms.gle/GPh7RGk7RLLV658L9',
  speaker: 'https://forms.gle/zHqafEuKe1sXXRnWA',
  mslearn: 'https://learn.microsoft.com/?wt.mc_id=studentamb_482865',
}

export const nav = [
  { label: 'About', href: '#about' },
  { label: 'Activities', href: '#activities' },
  { label: 'Process', href: '#process' },
  { label: 'Talks', href: '#talks' },
  { label: 'Roadmap', href: '#roadmap' },
]

export const recruit = {
  generation: '2기',
  start: '2026-08-31',
  end: '2026-09-15',
  endLabel: '9월 15일 (화) 23:59',
}

export const marquee = [
  'Azure', 'GitHub Copilot', 'MCP', 'RAG', 'LangChain', 'Vector Search', 'Kubernetes',
  'Entra ID', 'Semantic Kernel', 'Microsoft Learn', 'GH-900', 'Build Recap', 'Ignite Recap',
  'Tech Talk', 'Career Talk', 'MSA',
]

export const ddd = [
  {
    key: 'Development',
    ko: '개발',
    desc: 'Microsoft Learn에서 학습 경로를 고르고, 직접 코드를 짜며 기술의 핵심 구조를 파악합니다. 데모 코드는 LIT GitHub 조직에 기록됩니다.',
  },
  {
    key: 'Delivery',
    ko: '발표',
    desc: '컨텐츠 설계도 → PPT → 리허설. 세 번의 피드백을 거쳐 청중이 기술의 구조를 한눈에 이해할 수 있는 스토리를 만듭니다.',
  },
  {
    key: 'Distribution',
    ko: '전파',
    desc: '월간 Meetup에서 발표하고, LinkedIn · velog · GitHub로 확장합니다. 발표 한 번이 포트폴리오와 커리어로 이어집니다.',
  },
]

export const activities = [
  {
    title: '월간 Meetup',
    tag: 'Monthly',
    desc: '매달 한 번, IT5호관 B102에서 열리는 정기 기술 발표. 학습한 기술을 30분 세션으로 공유합니다.',
    icon: 'Mic2',
    span: 'md:col-span-2 md:row-span-2',
    accent: 'pink',
  },
  {
    title: 'MS Learn 스터디',
    tag: 'Study',
    desc: '2인 팀 또는 개인으로 학습 경로를 선택하고 함께 완주합니다.',
    icon: 'BookOpen',
    span: '',
    accent: 'mint',
  },
  {
    title: 'MSA 챌린지',
    tag: 'Challenge',
    desc: 'Microsoft Student Ambassadors에 도전하고 커뮤니티 활동을 공식 경력으로 인증받습니다.',
    icon: 'Award',
    span: '',
    accent: 'violet',
  },
  {
    title: '국제 자격증',
    tag: 'Certification',
    desc: 'GH-900 등 Microsoft 공인 자격증 응시 비용을 지원하고 함께 준비합니다.',
    icon: 'BadgeCheck',
    span: '',
    accent: 'amber',
  },
  {
    title: '커리어톡',
    tag: 'Career',
    desc: 'IT 업계 주니어 개발자를 초청해 취업 과정과 현장 이야기를 듣습니다.',
    icon: 'Briefcase',
    span: '',
    accent: 'mint',
  },
  {
    title: 'Build / Ignite Recap',
    tag: 'Recap',
    desc: 'Microsoft의 글로벌 컨퍼런스 핵심을 요약해 다시 발표하는 시즌 세션.',
    icon: 'Radio',
    span: 'md:col-span-2',
    accent: 'pink',
  },
  {
    title: '네트워킹',
    tag: 'Community',
    desc: 'OT · 피크닉 · MT · 워크샵. 기술 이야기를 나누는 사람들과 진짜 친해지는 시간.',
    icon: 'Users',
    span: '',
    accent: 'violet',
  },
  {
    title: '해커톤 & 대회',
    tag: 'Compete',
    desc: '팀을 꾸려 해커톤과 대회에 도전하고, 그 과정까지 발표 컨텐츠로 만듭니다.',
    icon: 'Trophy',
    span: '',
    accent: 'amber',
  },
]

export const process = [
  { step: '01', title: '세션 신청', desc: '구글 폼으로 발표 의사를 밝히면 운영진이 월별 연사 일정을 매칭합니다.', mode: 'Forms' },
  { step: '02', title: '주제 선택', desc: 'Microsoft Learn에서 학습 경로를 고르고 2인 팀 또는 개인 세션을 구성합니다.', mode: 'MS Learn' },
  { step: '03', title: '설계도 & Repo', desc: 'LITofficial GitHub에 레포를 만들고, 기술 로직과 발표 흐름을 시각화한 컨텐츠 설계도를 작성합니다.', mode: 'GitHub · Notion' },
  { step: '04', title: '피드백 ①', desc: '연사들끼리 온라인으로 모여 컨텐츠 설계를 서로 리뷰합니다.', mode: 'Online' },
  { step: '05', title: 'PPT 제작', desc: 'LIT 템플릿과 1·2·3 법칙(그림 2개, 핵심 텍스트 3개)으로 슬라이드를 만듭니다.', mode: 'Template' },
  { step: '06', title: '피드백 ②', desc: 'PPT와 스토리라인을 다시 다듬습니다. 설계도와 슬라이드가 하나의 흐름이 되도록.', mode: 'Online' },
  { step: '07', title: '리허설', desc: '실제 발표 환경과 동일하게 오프라인 리허설. 시간·톤·데모까지 점검합니다.', mode: 'Offline' },
  { step: '08', title: 'Meetup 발표', desc: '마지막 슬라이드에 GitHub QR을 담아 무대에 오릅니다. 그리고 SNS로 전파합니다.', mode: 'Stage' },
]

export const stats = [
  { value: 12, suffix: '+', label: '연간 세션', sub: '매달 Meetup · Recap · 특강' },
  { value: 3, suffix: '회', label: '피드백 라운드', sub: '설계 → PPT → 리허설' },
  { value: 2, suffix: '기', label: '신규 부원 모집', sub: '2026년 2학기' },
  { value: 100, suffix: '%', label: '실전 발표', sub: '모든 세션은 무대 위에서' },
]

export const talks = [
  { title: 'Vector Search로 의미를 검색하기', tags: ['Azure AI Search', 'Embedding'], month: 'JUN', color: 'from-pink/40 to-violet/20' },
  { title: 'LangChain + Gemini로 만드는 RAG', tags: ['RAG', 'LangChain'], month: 'JUN', color: 'from-mint/40 to-pink/10' },
  { title: 'Entra ID로 배우는 클라우드 보안', tags: ['Identity', 'Zero Trust'], month: 'JUN', color: 'from-violet/40 to-mint/20' },
  { title: 'Kubernetes Self-Healing의 원리', tags: ['K8s', 'Reliability'], month: 'JUN', color: 'from-amber/40 to-pink/20' },
  { title: 'MCP: AI 에이전트의 표준 연결 규약', tags: ['MCP', 'Agents'], month: 'APR', color: 'from-pink/40 to-mint/20' },
  { title: 'GitHub Copilot 200% 활용법', tags: ['Copilot', 'Productivity'], month: 'MAY', color: 'from-mint/40 to-violet/20' },
]

export const roadmap = [
  {
    season: '1학기',
    emoji: '🌱',
    items: [
      { date: '03.18', title: 'OT & 팀 빌딩' },
      { date: '03.18 – 28', title: 'MS Learn 학습 경로 선택' },
      { date: '04.27', title: '4월 Meetup' },
      { date: '05.09 – 30', title: 'GH-900 응시비 지원' },
      { date: '05.19', title: '5월 Meetup' },
      { date: '05.30', title: '5월 커리어톡' },
    ],
  },
  {
    season: '하계방학',
    emoji: '☀️',
    items: [
      { date: '06.23 – 08.30', title: 'MSA 달성 챌린지' },
      { date: '06.25', title: '6월 Meetup' },
      { date: '07.17 – 18', title: 'MT' },
    ],
  },
  {
    season: '2학기',
    emoji: '🍂',
    items: [
      { date: '08.31 – 09.15', title: '2기 신규 부원 모집', hot: true },
      { date: '09', title: 'OT & 연사자 모집' },
      { date: '09', title: '9월 Meetup' },
      { date: '10', title: '10월 Meetup' },
      { date: '11', title: '11월 정기 발표' },
    ],
  },
  {
    season: '동계방학',
    emoji: '❄️',
    items: [
      { date: '12', title: '워크샵' },
      { date: '01', title: 'Microsoft Build Recap' },
      { date: '02', title: '2월 정기 발표' },
    ],
  },
]

export const faq = [
  {
    q: '컴퓨터학부가 아니어도 지원할 수 있나요?',
    a: '기술을 배우고 공유하는 데 관심이 있다면 학부와 학년에 상관없이 환영합니다. 발표 경험이 없어도 괜찮아요. 3번의 피드백이 함께합니다.',
  },
  {
    q: '활동은 얼마나 자주 하나요?',
    a: '월 1회 Meetup이 중심이고, 발표를 맡은 달에는 온라인 피드백 2회와 오프라인 리허설 1회가 추가됩니다. 그 외 스터디는 팀별 자율입니다.',
  },
  {
    q: 'MSA(Microsoft Student Ambassadors)가 뭔가요?',
    a: 'Microsoft가 운영하는 글로벌 학생 앰버서더 프로그램입니다. LIT에서 만든 발표 컨텐츠와 커뮤니티 활동을 공식 경력으로 인증받을 수 있어요.',
  },
  {
    q: '발표 주제는 어떻게 정하나요?',
    a: 'Microsoft Learn의 학습 경로에서 팀 또는 개인이 원하는 주제를 고릅니다. AI, 클라우드, 보안, DevOps 등 범위는 자유입니다.',
  },
]
