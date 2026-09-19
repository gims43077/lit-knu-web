import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './ui/Logo.jsx'

export default function Preloader({ onDone }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => setShow(false), 1700)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = ''
        onDone?.()
      }}
    >
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
          exit={{ y: '-100%', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <Logo className="text-[22vw] sm:text-[9rem]" />
            </motion.div>
            <motion.p
              className="mt-2 font-mono text-xs uppercase tracking-[0.35em] text-muted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Learn It, Teach
            </motion.p>
            <div className="mt-8 h-px w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full w-full origin-left bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.15 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
