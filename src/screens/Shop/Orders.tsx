import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { num } from '../../data/format'
import { deliveryPlace, findProduct, thumb } from '../../data/shop'
import { useStore } from '../../data/store'
import { useOrigin } from '../../lib/useOrigin'
import { CdekBadge } from './CdekBadge'
import { Screen } from '../../components/Screen'
import s from './Orders.module.css'

const date = (t: number) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }).format(t)
const path = (mode: 'point' | 'door') => ['Принят', 'Собираем', 'Едет', mode === 'point' ? 'Можно забрать' : 'У тебя']

/** Мои заказы: что заказано, куда и где сейчас */
export function Orders() {
  const go = useNavigate()
  const back = useOrigin()
  const { orders } = useStore()
  if (orders.length === 0)
    return (
      <Screen title="Мои заказы" onBack={back} footer={<Button onClick={() => go('/shop')}>В магазин</Button>}>
        <p className={s.empty}>Заказов пока нет. Первый приз ждёт в магазине.</p>
      </Screen>
    )
  return (
    <Screen title="Мои заказы" onBack={back}>
      {orders.map((o) => (
        <article key={o.number} className={s.order}>
          <header>
            <h2>LIT-{o.number}</h2>
            <span>{date(o.at)}</span>
          </header>
          <div className={s.goods}>
            {o.lines.map((l) => (
              <figure key={l.id + l.size}>
                <img src={thumb(l.id)} alt="" />
                <figcaption>
                  <b>{findProduct(l.id)?.title}</b>
                  {[l.size && `размер ${l.size}`, l.qty > 1 && `${l.qty} шт.`].filter(Boolean).join(', ')}
                </figcaption>
              </figure>
            ))}
          </div>
          {o.delivery ? (
            <>
              <ol className={s.path}>
                {path(o.delivery.mode).map((p, i) => (
                  <li key={p} data-on={i === 0 || undefined}>
                    {p}
                  </li>
                ))}
              </ol>
              <p className={s.where}>
                <CdekBadge /> {deliveryPlace(o.delivery)}
                <br />
                {o.delivery.mode === 'point' ? 'Будет в пункте' : 'Привезём'} до {date(o.at + o.delivery.tariff.max * 864e5)}. Трек-номер появится, когда отправим.
              </p>
            </>
          ) : (
            <p className={s.code}>Код появится здесь, как только заказ обработают</p>
          )}
          {o.delivery && o.lines.some((l) => findProduct(l.id)?.digital) && <p className={s.code}>Коды появятся здесь раньше посылки</p>}
          <footer>
            <Amount value={o.hard} kind="hard" coin={20} />
            <span>и {num(o.rub)} ₽</span>
          </footer>
        </article>
      ))}
    </Screen>
  )
}
