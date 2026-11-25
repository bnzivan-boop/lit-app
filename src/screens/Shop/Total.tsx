import { Amount } from '../../components/Amount'
import { num, plural } from '../../data/format'
import { cartCount, cartSum, needsDelivery, ORDER, type CartLine } from '../../data/shop'
import s from './Total.module.css'

/** Сумма заказа: хард за товары, рубли за сервисный сбор и доставку */
export function Total({ lines, delivery }: { lines: CartLine[]; delivery?: number }) {
  const n = cartCount(lines)
  return (
    <section className={s.total}>
      <h2>Сумма</h2>
      <dl>
        <div>
          <dt>
            {n} {plural(n, ['товар', 'товара', 'товаров'])}
          </dt>
          <dd>
            <Amount value={cartSum(lines)} kind="hard" coin={20} />
          </dd>
        </div>
        {needsDelivery(lines) && (
          <div>
            <dt>Доставка СДЭК</dt>
            <dd>{delivery ? `${num(delivery)} ₽` : `от ${num(ORDER.deliveryFrom)} ₽`}</dd>
          </div>
        )}
        <div>
          <dt>Сервисный сбор</dt>
          <dd>{num(ORDER.fee)} ₽</dd>
        </div>
      </dl>
    </section>
  )
}
