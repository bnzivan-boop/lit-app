import { Amount } from '../../components/Amount'
import { Icon } from '../../components/Icon'
import { thumb, type Product } from '../../data/shop'
import s from './ProductCard.module.css'

type Props = { product: Product; hard: number; closed?: boolean; pressed?: boolean; onClick: () => void }

/** Товар на полке: цена и сколько не хватает. Закрытый лигой — с замком */
export function ProductCard({ product: p, hard, closed, pressed, onClick }: Props) {
  const price = p.price.hard
  const enough = hard >= price
  return (
    <button type="button" className={`press ${s.card}`} data-closed={closed || undefined} data-pressed={pressed || undefined} onClick={onClick}>
      <span className={s.photo}>
        <img src={thumb(p.id)} alt="" loading="lazy" width={175} height={214} />
        {p.left && !closed && <span className={s.left}>осталось {p.left}</span>}
        {closed && (
          <span className={s.lock}>
            <Icon name="lock" size={22} />
          </span>
        )}
      </span>
      <span className={s.name}>{p.title}</span>
      <span className={s.price} data-enough={(enough && !closed) || undefined}>
        <Amount value={price} kind="hard" coin={20} />
      </span>
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
