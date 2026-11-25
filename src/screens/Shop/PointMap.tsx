import { useMemo, type CSSProperties } from 'react'
import { Icon } from '../../components/Icon'
import type { Point } from '../../data/cdek'
import s from './PointMap.module.css'

type Props = { points: Point[]; picked?: string; seed: number; onPick: (code: string) => void }

/** Схема города: точки стоят по своим координатам, улицы условные.
    Заглушка до ключа Яндекс Карт: у настоящей карты будут те же props */
export function PointMap({ points, picked, seed, onPick }: Props) {
  const box = useMemo(() => {
    const lat = points.map((p) => p.lat)
    const lng = points.map((p) => p.lng)
    return { s: Math.min(...lat), n: Math.max(...lat), w: Math.min(...lng), e: Math.max(...lng) }
  }, [points])
  const x = (p: Point) => 10 + (box.e > box.w ? ((p.lng - box.w) / (box.e - box.w)) * 80 : 40)
  const y = (p: Point) => 18 + (box.n > box.s ? ((box.n - p.lat) / (box.n - box.s)) * 64 : 32)
  const tilt = (seed % 7) * 3 - 9

  return (
    <div className={s.map}>
      <svg viewBox="0 0 360 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g transform={`rotate(${tilt} 180 125)`}>
          <path className={s.water} d="M-60 210C40 170 90 232 170 198S300 128 430 158v140H-60z" />
          <path className={s.park} d="M228 18h92v66l-60 22-46-30z" />
          <path className={s.street} d="M-60 40h480M-60 92h480M-60 146h480M20-60v380M84-60v380M152-60v380M216-60v380M286-60v380M344-60v380" />
          <path className={s.avenue} d="M-60 118C60 96 150 150 260 112S380 60 430 70M118-60c14 110-30 190 6 380" />
        </g>
      </svg>
      {points.map((p) => (
        <button
          key={p.code}
          type="button"
          className={s.pin}
          data-kind={p.type}
          aria-pressed={p.code === picked}
          aria-label={p.address}
          style={{ left: `${x(p)}%`, top: `${y(p)}%` } as CSSProperties}
          onClick={() => onPick(p.code)}
        >
          <span>
            <Icon name={p.type === 'PVZ' ? 'pin' : 'box'} size={18} />
          </span>
        </button>
      ))}
    </div>
  )
}
