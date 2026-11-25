import s from './ProgressBar.module.css'

type Props = {
  value: number
  max: number
  label: string
  size?: 'sm' | 'lg'
  tone?: 'accent' | 'warn'
  /** на surface-2 трек светлее, иначе его не видно */
  onSurface2?: boolean
}

export function ProgressBar({ value, max, label, size = 'sm', tone = 'accent', onSurface2 }: Props) {
  const part = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  return (
    <span
      className={`${s.track} ${s[size]} ${s[tone]} ${onSurface2 ? s.onSurface2 : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span className={s.fill} style={{ transform: `translateX(${(part - 1) * 100}%)` }} />
    </span>
  )
}

/** next — сегмент сегодняшнего дня, idle — впереди */
type SegmentState = 'done' | 'next' | 'idle' | 'warn'

export function SegmentBar({ segments, label }: { segments: SegmentState[]; label: string }) {
  return (
    <span className={s.segments} role="img" aria-label={label}>
      {segments.map((state, i) => (
        <span key={i} className={s[state]} />
      ))}
    </span>
  )
}
