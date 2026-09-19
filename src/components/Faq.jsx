import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Reveal, SectionHeading } from './ui/Primitives.jsx'
import { faq } from '../data/site.js'

function Item({ item, i, open, onToggle }) {
  return (
    <Reveal delay={i * 0.06}>
      <div className={`border-b border-line transition-colors ${open ? 'bg-white/[0.02]' : ''}`}>
        <button
          onClick={onToggle}
          data-cursor="hover"
          aria-expanded={open}
          className="flex w-full items-start justify-between gap-6 py-6 text-left"
        >
          <span className="flex gap-5">
            <span className="mt-1 font-mono text-xs tracking-widest text-muted">0{i + 1}</span>
            <span className="font-display text-lg font-semibold tracking-tight sm:text-2xl">{item.q}</span>
          </span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
              open ? 'border-mint/50 text-mint' : 'border-line text-muted'
            }`}
          >
            <Plus className="h-4 w-4" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="a"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-7 pl-[calc(1.25rem+1.5ch)] pr-14 text-[15px] leading-relaxed text-muted">{item.a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="relative scroll-mt-24 px-6 py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHeading eyebrow="FAQ" title="자주 묻는" accent="질문" desc="더 궁금한 게 있다면 카카오톡 오픈채팅으로 무엇이든 물어보세요." />
        <div className="border-t border-line">
          {faq.map((f, i) => (
            <Item key={f.q} item={f} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}
