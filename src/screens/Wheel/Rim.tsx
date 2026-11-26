import type { CSSProperties } from 'react'
import s from './Rim.module.css'

const R = 200
const LIGHTS = 36

/** Обод колеса: тёмный, объёмный, по нему бегут огни */
export function Rim({ mode }: { mode: 'idle' | 'spin' | 'win' | 'off' }) {
  return (
    <svg className={`${s.rim} ${s[mode]}`} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} aria-hidden>
      <circle r={R - 1} className={s.plate} />
      <circle r={R - 2} className={s.hi} />
      <circle r={R - 21} className={s.lo} />
      {Array.from({ length: LIGHTS }, (_, i) => (
        <circle
          key={i}
          r="3"
          cy={-(R - 11)}
          transform={`rotate(${(i * 360) / LIGHTS})`}
          className={s.light}
          style={{ animationDelay: `${((i % 6) / 6) * -0.9}s`, '--i': i } as CSSProperties}
          data-c={i % 3}
        />
      ))}
    </svg>
  )
}
