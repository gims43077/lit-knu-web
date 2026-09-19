import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Logo from './ui/Logo.jsx'
import MagneticButton from './ui/MagneticButton.jsx'
import { links, nav } from '../data/site.js'

export default function Nav() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 160 && !open)
    setScrolled(y > 40)
  })

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-4 sm:pt-5"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: hidden ? 0 : 0.1 }}
      >
        <nav
          className={`flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-3 py-2 pl-5 transition-all duration-500 ${
            scrolled ? 'glass shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)]' : 'border border-transparent'
          }`}
        >
          <a href="#top" className="flex items-center gap-2" data-cursor="hover" aria-label="LIT 홈">
            <Logo className="text-3xl" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted sm:block">
              KNU
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group relative rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
                >
                  {item.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,var(--color-pink),var(--color-mint))] transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <MagneticButton
              as="a"
              href={links.apply}
              target="_blank"
              rel="noreferrer"
              className="hidden !px-5 !py-2.5 text-xs sm:inline-flex"
            >
              지원하기
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>
            <button
              className="glass flex h-10 w-10 items-center justify-center rounded-full md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="메뉴"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col justify-end bg-bg/85 px-6 pb-10 pt-28 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ul className="flex flex-col gap-2">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block font-display text-5xl font-bold tracking-tight text-fg"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.a
              href={links.apply}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-fg px-6 py-4 font-semibold text-bg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              LIT 지원하기 <ArrowUpRight className="h-4 w-4" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
