import { Icon } from '../../components/Icon'
import s from './CartButton.module.css'

/** Корзина со счётчиком. plain — без подложки, для компактной шапки */
export function CartButton({ count, onClick, plain }: { count: number; onClick: () => void; plain?: boolean }) {
  return (
    <button type="button" className={`press ${s.cart}`} data-plain={plain || undefined} onClick={onClick} aria-label={`Корзина, товаров: ${count}`}>
      <Icon name="cart" size={24} />
      {count > 0 && <i key={count}>{count}</i>}
    </button>
  )
}
