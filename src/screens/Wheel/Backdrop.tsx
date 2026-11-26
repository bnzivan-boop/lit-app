import type { CSSProperties } from 'react'
import type { Currency } from '../../data/types'
import s from './Backdrop.module.css'

/* место, размер, задержка, снос вбок */
const FLAMES = [
  [6, 26, 0, 14],
  [17, 16, -3.2, -10],
  [28, 34, -6.1, 12],
  [39, 14, -1.4, -14],
  [52, 22, -4.6, 16],
  [63, 15, -7.3, -8],
  [74, 30, -2.3, 12],
  [84, 18, -5.5, -16],
  [94, 24, -8.1, 8],
] as const

/** Праздничная сцена: лучи из-за колеса и фирменные огоньки. Тиффани для софта, золото для харда */
export function Backdrop({ tone }: { tone: Currency }) {
  return (
    <div className={s.back} aria-hidden>
      {(['soft', 'hard'] as const).map((k) => (
        <div key={k} className={`${s.scene} ${s[k]} ${tone === k ? s.on : ''}`} data-scene={k}>
          <span className={s.rays} />
          <span className={s.edge} />
        </div>
      ))}
      {FLAMES.map(([x, size, delay, sway]) => (
        <i
          key={x}
          className={s.flame}
          style={{ '--x': `${x}%`, '--size': `${size}px`, '--delay': `${delay}s`, '--sway': `${sway}px` } as CSSProperties}
        />
      ))}
    </div>
  )
}
