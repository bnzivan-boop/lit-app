import s from './Glow.module.css'

/** Свечение за наградой вместо огня: вспышка при появлении, потом мягко пульсирует */
export function Glow({ className = '' }: { className?: string }) {
  return (
    <span className={`${s.glow} ${className}`} aria-hidden>
      <span className={s.core} />
      <span className={s.flash} />
    </span>
  )
}
