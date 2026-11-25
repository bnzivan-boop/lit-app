import s from './DropTimer.module.css'

/** Дни, часы и минуты до старта тёмными ячейками */
export function DropTimer({ msLeft }: { msLeft: number }) {
  const min = Math.max(0, Math.floor(msLeft / 60_000))
  const parts = [
    [String(Math.floor(min / 1440)), 'дн'],
    [String(Math.floor((min % 1440) / 60)).padStart(2, '0'), 'ч'],
    [String(min % 60).padStart(2, '0'), 'мин'],
  ]
  return (
    <div className={s.timer} role="timer" aria-label={`До старта ${parts.map((p) => p.join(' ')).join(' ')}`}>
      {parts.map(([n, unit]) => (
        <span key={unit}>
          <b>{n}</b>
          {unit}
        </span>
      ))}
    </div>
  )
}
