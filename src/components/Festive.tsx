import type { CSSProperties } from 'react'

/* огни гирлянды в расфокусе: место (% от блока), размер, цвет, задержка */
const BOKEH = [
  [18, 30, 34, 'gold', 0],
  [74, 22, 26, 'red', -0.8],
  [86, 54, 40, 'gold', -1.6],
  [10, 62, 22, 'red', -2.2],
  [58, 10, 18, 'white', -0.4],
  [36, 14, 14, 'gold', -1.2],
  [92, 30, 16, 'white', -2.6],
  [26, 80, 28, 'gold', -1.9],
  [70, 78, 20, 'red', -0.2],
  [48, 90, 16, 'white', -1.4],
] as const

/* звёздочки-блики: место, размер, задержка */
const STARS = [
  [24, 18, 22, 0],
  [80, 40, 16, -1.1],
  [14, 48, 12, -2],
  [66, 8, 14, -0.6],
  [90, 70, 18, -1.6],
] as const

/** Праздничное сияние за головой героя вместо огня: тёплый свет, огни гирлянды в расфокусе, мерцающие звёзды */
export function Festive({ className }: { className: string }) {
  return (
    <span className={`${className} ny-festive`} aria-hidden>
      <span className="ny-festive-glow" />
      {BOKEH.map(([x, y, size, tone, delay], i) => (
        <i key={i} className="ny-bokeh" data-tone={tone} style={{ '--x': `${x}%`, '--y': `${y}%`, '--s': `${size}px`, '--d': `${delay}s` } as CSSProperties} />
      ))}
      {STARS.map(([x, y, size, delay], i) => (
        <svg key={i} className="ny-star" viewBox="0 0 24 24" style={{ '--x': `${x}%`, '--y': `${y}%`, '--s': `${size}px`, '--d': `${delay}s` } as CSSProperties}>
          <path d="M12 0c.8 6.6 5.4 11.2 12 12-6.6.8-11.2 5.4-12 12-.8-6.6-5.4-11.2-12-12C6.6 11.2 11.2 6.6 12 0Z" />
        </svg>
      ))}
    </span>
  )
}
