import type { CSSProperties } from 'react'
import { isNewYear } from '../lib/theme'

/* место по ширине, размер, задержка, длительность, снос */
const FLAKES = Array.from({ length: 34 }, (_, i) => [(i * 37 + 11) % 100, 3 + ((i * 7) % 5) * 1.6, -((i * 1.37) % 12), 9 + ((i * 3) % 7), ((i * 13) % 40) - 20])

/** Падающий снег. fixed — над всем приложением, сквозь него можно нажимать. Только в новогодней теме; стили в newyear.css */
export function Snowfall({ fixed }: { fixed?: boolean }) {
  if (!isNewYear()) return null
  return (
    <span className={`ny-snowfall ${fixed ? 'ny-snowfall-fixed' : ''}`} aria-hidden>
      {FLAKES.map(([x, size, delay, time, sway], i) => (
        <i
          key={i}
          style={{ '--x': `${x}%`, '--s': `${size}px`, '--d': `${delay}s`, '--t': `${time}s`, '--w': `${sway}px` } as CSSProperties}
          data-far={size < 6 || undefined}
        />
      ))}
    </span>
  )
}
