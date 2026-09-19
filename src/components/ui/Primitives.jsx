import { motion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1]

export function Reveal({ children, delay = 0, y = 28, className = '', once = true, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

// background-clip:text 는 transform 된 자식 위에 그려지지 않으므로,
// 조각(단어/글자)마다 그라데이션을 직접 입히고 배경 위치를 이어 붙여 하나처럼 보이게 한다.
export function gradientSlice(i, n) {
  return {
    backgroundSize: `${n * 100}% 100%`,
    backgroundPosition: `${n > 1 ? (i / (n - 1)) * 100 : 0}% 0`,
  }
}

// 텍스트를 단어 단위로 잘라 아래에서 위로 마스킹 등장
export function SplitWords({ text, className = '', delay = 0, stagger = 0.05, as = 'span', gradient = false }) {
  const Comp = motion[as] ?? motion.span
  const words = text.split(' ')
  return (
    <Comp className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            className={`inline-block will-change-transform ${gradient ? 'text-gradient pr-[0.04em]' : ''}`}
            style={gradient ? gradientSlice(i, words.length) : undefined}
            initial={{ y: '110%', rotate: 4 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.9, ease, delay: delay + i * stagger }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Comp>
  )
}

export function SectionHeading({ eyebrow, title, accent, desc, align = 'left', className = '' }) {
  const isCenter = align === 'center'
  return (
    <div className={`${isCenter ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal className={`mb-5 flex items-center gap-3 ${isCenter ? 'justify-center' : ''}`}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-mint animate-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">{eyebrow}</span>
        </Reveal>
      )}
      <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-fg sm:text-5xl lg:text-6xl">
        <SplitWords text={title} />
        {accent && (
          <>
            {' '}
            <SplitWords text={accent} gradient delay={0.15} />
          </>
        )}
      </h2>
      {desc && (
        <Reveal delay={0.2} className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
          {desc}
        </Reveal>
      )}
    </div>
  )
}
