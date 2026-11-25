import { num } from '../../data/format'
import { WHEEL } from '../../data/store'
import { SECTORS } from './geometry'
import s from './Disc.module.css'

const R = 300
const OUTER = 296
const INNER = 204
const GAP = 2
const ROUND = 7

const at = (r: number, a: number) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`

/* Сектор с параллельными зазорами; скругление даёт обводка того же цвета */
function slice(size: number) {
  const half = (Math.PI / 180) * (size / 2)
  const ro = OUTER - ROUND
  const ri = INNER + ROUND
  const ao = half - Math.asin((GAP + ROUND) / ro)
  const ai = half - Math.asin((GAP + ROUND) / ri)
  return `M${at(ri, -ai)}L${at(ro, -ao)}A${ro} ${ro} 0 0 1 ${at(ro, ao)}L${at(ri, ai)}A${ri} ${ri} 0 0 0 ${at(ri, -ai)}Z`
}

/** Рисунок кольца: всё тёмное, горит только сектор lit. Вращает его родитель */
export function Disc({ lit, landed }: { lit: number; landed: boolean }) {
  return (
    <svg className={s.disc} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} aria-hidden>
      {WHEEL.map((p, i) => {
        const hard = p.kind === 'hard'
        const coin = hard ? 28 : 36
        return (
          <g
            key={p.id}
            transform={`rotate(${SECTORS[i].center})`}
            className={`${s.sector} ${s[p.kind]} ${lit === i ? s.lit : ''} ${landed && lit !== i ? s.lose : ''}`}
          >
            <path d={slice(SECTORS[i].size)} className={s.face} strokeWidth={ROUND * 2} strokeLinejoin="round" />
            <text y={hard ? -222 : -221} className={`${s.amount} ${hard && p.amount > 999 ? s.long : ''}`}>
              {hard ? '' : '+'}
              {num(p.amount)}
            </text>
            <image href={`/assets/currency/coin-${p.kind}.png`} x={-coin / 2} y={hard ? -283 : -288} width={coin} height={coin} />
          </g>
        )
      })}
    </svg>
  )
}
