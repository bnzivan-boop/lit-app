import { num } from '../data/format'
import { CURRENCY_NAME } from '../data/labels'
import type { Currency } from '../data/types'
import s from './Amount.module.css'

export function Coin({ kind, size = 15 }: { kind: Currency; size?: 15 | 18 | 20 }) {
  return (
    <img className={s.coin} src={`/assets/currency/coin-${kind}.png`} alt={CURRENCY_NAME[kind]} width={size} height={size} />
  )
}

type Props = { value: number; kind: Currency; plus?: boolean; coin?: 15 | 18 | 20 }

/** Число и монета: сумма никогда не показывается без монеты. Размер текста — от родителя. */
export function Amount({ value, kind, plus, coin }: Props) {
  return (
    <span className={s.amount}>
      <span className={s.value}>
        {plus && '+'}
        {num(value)}
      </span>
      <Coin kind={kind} size={coin} />
    </span>
  )
}
