export default function Logo({ className = '' }) {
  return (
    <span
      className={`font-script font-bold leading-none tracking-tight text-gradient select-none ${className}`}
      aria-label="LIT"
    >
      lit
    </span>
  )
}
