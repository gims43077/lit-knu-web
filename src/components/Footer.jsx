import { ArrowUpRight, Github, Instagram, MapPin, MessageCircle, NotebookText } from 'lucide-react'
import Logo from './ui/Logo.jsx'
import { links, nav } from '../data/site.js'

const socials = [
  { label: 'Instagram', href: links.instagram, icon: Instagram, handle: '@lit_knu' },
  { label: 'GitHub', href: links.github, icon: Github, handle: 'LITofficial' },
  { label: 'Notion', href: links.notion, icon: NotebookText, handle: '운영 가이드' },
  { label: 'KakaoTalk', href: links.kakao, icon: MessageCircle, handle: '오픈채팅' },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="text-6xl" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Learn It, Teach. 경북대학교 컴퓨터학부 IT 기술 발표 동아리. 기술을 배우고, 발표하고, 전파합니다.
            </p>
            <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <MapPin className="h-3.5 w-3.5" /> KNU IT5호관 B102
            </div>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Menu</p>
            <ul className="mt-5 space-y-3">
              {[...nav, { label: 'FAQ', href: '#faq' }, { label: 'Recruit', href: '#recruit' }].map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-sm text-fg/80 transition-colors hover:text-fg">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Connect</p>
            <ul className="mt-5 space-y-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between text-sm text-fg/80 transition-colors hover:text-fg"
                  >
                    <span className="flex items-center gap-2.5">
                      <s.icon className="h-4 w-4 text-muted transition-colors group-hover:text-mint" />
                      {s.label}
                      <span className="text-muted">{s.handle}</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={links.mslearn}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  Microsoft Learn ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} LIT · Learn It, Teach</span>
          <span>Designed & built with ♥ by LIT</span>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none select-none text-center font-display text-[30vw] font-extrabold leading-[0.75] tracking-[-0.06em] text-outline mask-fade-b"
      >
        LIT
      </div>
    </footer>
  )
}
