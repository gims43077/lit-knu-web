import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Flame, Sparkles, Trophy, BookOpen } from 'lucide-react'
import MagneticButton from './ui/MagneticButton.jsx'
import { gradientSlice } from './ui/Primitives.jsx'
import { links } from '../data/site.js'

const ease = [0.16, 1, 0.3, 1]

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


      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-28 pt-36 text-center"
      >
        <motion.a
          href="#dashboard"
          data-cursor="hover"
          className="glass group mb-8 inline-flex items-center rounded-full p-1 text-xs text-muted transition-all hover:scale-105 hover:border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] px-3.5 py-1 text-[11px] font-semibold text-bg shadow-[0_0_12px_rgba(255,111,177,0.25)]">
            <Sparkles className="h-3 w-3" /> LIT MSA 챌린지
          </span>
        </motion.a>

        <h1 className="font-display text-[14vw] font-extrabold leading-[0.92] tracking-[-0.04em] sm:text-[10vw] lg:text-[8.5rem]">
          <Letters text="Learn It," ready={ready} delay={0.2} />
          <br />
          <Letters text="Teach." ready={ready} delay={0.55} gradient className="pr-[0.08em]" />
        </h1>

        <motion.p
          className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease, delay: 0.95 }}
        >
          경북대학교 IT 기술 발표 동아리, LIT
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease, delay: 1.1 }}
        >
          <MagneticButton as="a" href="#dashboard" variant="gradient" className="!px-7 !py-4">
            <Flame className="h-4 w-4" />
            대시보드
          </MagneticButton>
          <MagneticButton as="a" href="#leaderboard" variant="ghost" className="!px-7 !py-4">
            <Trophy className="h-4 w-4" />
            리더보드
          </MagneticButton>
          <MagneticButton as="a" href="#articles" variant="ghost" className="!px-7 !py-4">
            <BookOpen className="h-4 w-4" />
            피드
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        className="relative mx-auto mb-8 flex w-full max-w-6xl items-end justify-center px-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <a href="#dashboard" className="flex flex-col items-center gap-2" aria-label="아래로 스크롤">
          <span className="tracking-widest">둘러보기</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-fg"
              animate={{ y: ['-100%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </a>
      </motion.div>
    </section>
  )
}
