import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// 데스크톱(정밀 포인터)에서만 표시되는 커스텀 커서
export default function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState('default') // default | hover | drag
  const [label, setLabel] = useState('')

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 })

  useEffect(() => {
    const ok =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ok) return
    setEnabled(true)
    document.body.classList.add('has-cursor')

    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e) => {
      const t = e.target.closest('[data-cursor], a, button')
      if (!t) {
        setMode('default')
        setLabel('')
        return
      }
      setMode(t.dataset.cursor || 'hover')
      setLabel(t.dataset.cursorLabel || '')
    }
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.body.classList.remove('has-cursor')
    }
  }, [x, y])

  if (!enabled) return null

  const size = mode === 'drag' ? 84 : mode === 'hover' ? 56 : 14

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg mix-blend-difference"
        style={{ x, y }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[94] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-fg/70 mix-blend-difference"
        style={{ x: rx, y: ry }}
        animate={{
          width: size,
          height: size,
          backgroundColor: mode === 'default' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.9)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-bg">{label}</span>
        )}
      </motion.div>
    </>
  )
}
