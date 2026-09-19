import { marquee } from '../data/site.js'

function Row({ items, reverse = false, className = '' }) {
  const list = [...items, ...items]
  return (
    <div className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} ${className}`}>
      {list.map((t, i) => (
        <span key={i} className="flex items-center gap-8 pr-8 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          <span className={i % 3 === 1 ? 'text-gradient' : i % 3 === 2 ? 'text-outline' : 'text-fg/90'}>{t}</span>
          <span className="text-mint/70">✦</span>
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="relative -mt-6 border-y border-line bg-surface/40 py-6 backdrop-blur-sm">
      <div className="mask-fade-x flex flex-col gap-4 overflow-hidden">
        <Row items={marquee} />
        <Row items={[...marquee].reverse()} reverse className="opacity-50" />
      </div>
    </div>
  )
}
