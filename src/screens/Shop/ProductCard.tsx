import { Amount } from '../../components/Amount'
import { Icon } from '../../components/Icon'
import { num, plural } from '../../data/format'
import { saleOf, thumb, type Product } from '../../data/shop'
import s from './ProductCard.module.css'

type Props = { product: Product; hard: number; now: number; closed?: boolean; pressed?: boolean; onClick: () => void }

/** Товар на полке: цена и сколько не хватает. Закрытый лигой — с замком */
export function ProductCard({ product: p, hard, now, closed, pressed, onClick }: Props) {
  const sale = saleOf(p, now)
  const price = sale?.price ?? p.price.hard
  const enough = hard >= price
  return (
    <button type="button" className={`press ${s.card}`} data-closed={closed || undefined} data-pressed={pressed || undefined} onClick={onClick}>
      <span className={s.photo}>
        <img src={thumb(p.id)} alt="" loading="lazy" width={175} height={214} />
        {p.left && !closed && <span className={s.left}>осталось {p.left}</span>}
        {sale && <span className={s.sale}>−{sale.percent}%</span>}
        {closed && (
          <span className={s.lock}>
            <Icon name="lock" size={22} />
          </span>
        )}
      </span>
      <span className={s.name}>{p.title}</span>
      <span className={s.price} data-enough={(enough && !closed) || undefined}>
        <Amount value={price} kind="hard" coin={20} />
        {sale && <s className={s.was}>{num(sale.base)}</s>}
      </span>
      {sale && <span className={s.until}>{leftOf(sale.msLeft)}</span>}
      {!enough && !closed && (
        <span className={s.need}>
          <i>
            <b style={{ transform: `scaleX(${hard / price})` }} />
          </i>
          <span>
            ещё <Amount value={price - hard} kind="hard" coin={15} />
          </span>
        </span>
      )}
    </button>
  )
}

/** «ещё 2 дня» / «до конца дня» — сколько продлится скидка */
export function leftOf(ms: number) {
  const days = Math.floor(ms / 86_400_000)
  if (days >= 1) return `скидка ещё ${days} ${plural(days, ['день', 'дня', 'дней'])}`
  const h = Math.max(1, Math.ceil(ms / 3_600_000))
  return `скидка ещё ${h} ${plural(h, ['час', 'часа', 'часов'])}`
}
