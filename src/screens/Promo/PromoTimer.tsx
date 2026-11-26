import { useEffect, useState } from 'react'
import { plural } from '../../data/format'
import s from './PromoTimer.module.css'

/** Живой отсчёт до конца акции */
export function PromoTimer({ msLeft }: { msLeft: number }) {
  const [end] = useState(() => Date.now() + msLeft)
  const [ms, setMs] = useState(msLeft)
  useEffect(() => {
    const t = setInterval(() => setMs(Math.max(0, end - Date.now())), 1000)
    return () => clearInterval(t)
  }, [end])
  const sec = Math.floor(ms / 1000)
  const d = Math.floor(sec / 86400)
  const parts: [number, string][] = [
    [d, plural(d, ['день', 'дня', 'дней'])],
    [Math.floor((sec % 86400) / 3600), 'ч'],
    [Math.floor((sec % 3600) / 60), 'мин'],
    [sec % 60, 'сек'],
  ]
  return (
    <div className={s.timer} role="timer" aria-label={`До конца ${parts.slice(0, 3).map((p) => p.join(' ')).join(' ')}`}>
      {parts.map(([n, unit], i) => (
        <span key={i}>
          <b>{i ? String(n).padStart(2, '0') : n}</b>
          {unit}
        </span>
      ))}
    </div>
  )
}
