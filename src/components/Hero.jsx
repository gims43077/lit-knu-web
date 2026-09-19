import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react'
import MagneticButton from './ui/MagneticButton.jsx'
import { gradientSlice } from './ui/Primitives.jsx'
import { links, recruit } from '../data/site.js'

const ease = [0.16, 1, 0.3, 1]

const chips = [
  { t: 'Azure', x: '8%', y: '22%', r: '-8deg', d: '0s' },
  { t: 'MCP', x: '84%', y: '18%', r: '6deg', d: '-2s' },
  { t: 'RAG', x: '90%', y: '58%', r: '-5deg', d: '-4s' },
  { t: 'Copilot', x: '6%', y: '66%', r: '7deg', d: '-1s' },
  { t: 'K8s', x: '72%', y: '80%', r: '-4deg', d: '-3s' },
  { t: 'MS Learn', x: '20%', y: '84%', r: '5deg', d: '-5s' },
]

function Letters({ text, className = '', delay = 0, ready, gradient = false }) {
  const chars = text.split('')
  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {chars.map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
          <motion.span
            className={`inline-block will-change-transform ${gradient ? 'text-gradient' : ''}`}
            style={gradient ? gradientSlice(i, chars.length) : undefined}
            initial={{ y: '115%', rotate: 6 }}
            animate={ready ? { y: 0, rotate: 0 } : {}}
            transition={{ duration: 1, ease, delay: delay + i * 0.035 }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export default function Hero({ ready }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.25])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 40, damping: 20 })
  const py = useSpring(my, { stiffness: 40, damping: 20 })
  const blob1 = { x: useTransform(px, (v) => v * 40), y: useTransform(py, (v) => v * 40) }
  const blob2 = { x: useTransform(px, (v) => v * -60), y: useTransform(py, (v) => v * -30) }
  const chipX = useTransform(px, (v) => v * -22)
  const chipY = useTransform(py, (v) => v * -22)

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMove}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Aurora background */}
      <motion.div className="absolute inset-0 -z-10" style={{ scale: bgScale }}>
        <div className="absolute inset-0 grid-bg mask-radial opacity-70" />
        <motion.div
          style={blob1}
          className="absolute left-[10%] top-[10%] h-[48vw] w-[48vw] rounded-full bg-pink/35 blur-[120px] animate-aurora"
        />
        <motion.div
          style={blob2}
          className="absolute right-[5%] top-[30%] h-[42vw] w-[42vw] rounded-full bg-mint/30 blur-[120px] animate-aurora [animation-delay:-6s] [animation-duration:22s]"
        />
        <div className="absolute bottom-[-10%] left-[35%] h-[38vw] w-[38vw] rounded-full bg-violet/30 blur-[130px] animate-aurora [animation-delay:-12s] [animation-duration:26s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-bg)_95%)]" />
      </motion.div>

      {/* Giant watermark */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-4vw] -z-10 select-none text-center font-display text-[38vw] font-extrabold leading-none text-outline"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 0.45 } : {}}
        transition={{ duration: 2, delay: 0.6 }}
      >
        LIT
      </motion.div>

      {/* Floating chips */}
      <motion.div className="pointer-events-none absolute inset-0 -z-0 hidden md:block" style={{ x: chipX, y: chipY }}>
        {chips.map((c, i) => (
          <motion.span
            key={c.t}
            className="glass absolute rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-fg/80 animate-float"
            style={{ left: c.x, top: c.y, '--r': c.r, animationDelay: c.d }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={ready ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease, delay: 1.1 + i * 0.08 }}
          >
            {c.t}
          </motion.span>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-28 pt-36 text-center"
      >
        <motion.a
          href={links.apply}
          target="_blank"
          rel="noreferrer"
          data-cursor="hover"
          className="glass group mb-8 inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs text-muted transition-colors hover:text-fg"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-2.5 py-1 text-[11px] font-semibold text-bg">
            <Sparkles className="h-3 w-3" /> {recruit.generation} 모집
          </span>
          <span>{recruit.end.replace(/-/g, '.').slice(5)} 까지 · 경북대학교 컴퓨터학부 IT 기술 발표 동아리</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </motion.a>

        <h1 className="font-display text-[15vw] font-extrabold leading-[0.92] tracking-[-0.04em] sm:text-[11vw] lg:text-[9rem]">
          <Letters text="Learn It," ready={ready} delay={0.2} />
          <br />
          <Letters text="Teach." ready={ready} delay={0.55} gradient className="pr-[0.08em]" />
        </h1>

        <motion.p
          className="mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease, delay: 0.95 }}
        >
          기술을 배우고, 발표하고, 전파합니다.
          <br className="hidden sm:block" /> 매달 무대에 오르는 기술 커뮤니케이터들의 커뮤니티,{' '}
          <span className="text-fg">LIT</span>.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease, delay: 1.1 }}
        >
          <MagneticButton as="a" href={links.apply} target="_blank" rel="noreferrer" variant="gradient" className="!px-7 !py-4">
            LIT {recruit.generation} 지원하기
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </MagneticButton>
          <MagneticButton as="a" href="#about" variant="ghost" className="!px-7 !py-4">
            우리가 하는 일
            <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        className="relative mx-auto mb-8 flex w-full max-w-6xl items-end justify-between px-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <span className="hidden sm:block">KNU · IT5 B102</span>
        <a href="#about" className="flex flex-col items-center gap-2" aria-label="아래로 스크롤">
          <span>Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-fg"
              animate={{ y: ['-100%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </a>
        <span className="hidden sm:block">Since 2026</span>
      </motion.div>
    </section>
  )
}
