import { useRef, type ReactNode } from 'react'
import { useLiquid } from '../lib/useLiquid'
import s from './LiquidBar.module.css'

type Props = { value: number; max: number; label: string; left: ReactNode; right: ReactNode }

/** Жидкая шкала: живой край, подпись читается и на заливке, и на тёмном */
export function LiquidBar({ value, max, label, left, right }: Props) {
  const fill = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLSpanElement>(null)
  useLiquid(fill, Math.min(1, value / max), 'x', (px) => {
    if (glow.current) glow.current.style.transform = `translateX(${px}px)`
  })
  const text = (
    <>
      <b>{left}</b>
      <span>{right}</span>
    </>
  )
  return (
    <div className={s.bar} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span ref={glow} className={s.glow} />
      <div className={s.text}>{text}</div>
      <div ref={fill} className={`${s.text} ${s.fill}`} aria-hidden>
        {text}
      </div>
    </div>
  )
}
