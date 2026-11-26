import { useState } from 'react'
import { num } from '../../data/format'
import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Sheet } from '../../components/Sheet'
import { cartSum, DROP, findProduct, maxQty, ORDER, priceOf, saleOf, thumb, type CartLine } from '../../data/shop'
import { useStore } from '../../data/store'
import { haptic } from '../../lib/motion'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { BalanceSheet } from './BalanceSheet'
import { Screen } from '../../components/Screen'
import { Stepper } from './Stepper'
import { Total } from './Total'
import s from './Cart.module.css'

export function Cart() {
  const go = useNavigate()
  const open = useOpen()
  const back = useOrigin('/shop')
  const { cart, balance, setCart, now } = useStore()
  const [remove, setRemove] = useState<CartLine | null>(null)
  const [note, setNote] = useState(true)
  const [need, setNeed] = useState(false)
  const missing = cartSum(cart, now) - balance.hard

  if (cart.length === 0)
    return (
      <Screen title="Корзина" onBack={back} footer={<Button onClick={() => go('/shop')}>В магазин</Button>}>
        <div className={s.empty}>
          <img src="/assets/wheel/hard-4.webp" alt="" />
          <h2>Пока пусто</h2>
          <p>Выбери приз, он появится здесь.</p>
        </div>
      </Screen>
    )

  return (
    <Screen
      title="Корзина"
      onBack={back}
      footer={
        missing > 0 ? (
          <Button onClick={() => setNeed(true)}>
            Не хватает <Amount value={missing} kind="hard" coin={20} />
          </Button>
        ) : (
          <Button onClick={() => open('/checkout')}>Оформить заказ</Button>
        )
      }
    >
      <ul className={s.list}>
        {cart.map((l) => {
          const p = findProduct(l.id)!
          return (
            <li key={l.id + l.size} className={s.item}>
              <button type="button" className={`press ${s.photo}`} aria-label={p.title} onClick={() => open(p.id === DROP.id ? '/drop' : `/shop/${p.id}`)}>
                <img src={thumb(p.id)} alt="" />
              </button>
              <div className={s.info}>
                <div className={s.head}>
                  <b>{p.title}</b>
                  <button type="button" className={`press ${s.remove}`} aria-label={`Удалить: ${p.title}`} onClick={() => setRemove(l)}>
                    <Icon name="trash" size={20} />
                  </button>
                </div>
                <span>{l.size ? `размер ${l.size}` : p.digital ? 'придёт кодом' : 'с доставкой'}</span>
                <div className={s.row}>
                  <span className={s.price}>
                    {saleOf(p, now) && <s className={s.was}>{num(p.price.hard * l.qty)}</s>}
                    <Amount value={priceOf(p, now) * l.qty} kind="hard" coin={20} />
                  </span>
                  <Stepper value={l.qty} max={maxQty(p)} onChange={(n) => (n > 0 ? setCart({ ...l, qty: n }) : setRemove(l))} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {note && (
        <aside className={s.note}>
          <p>
            <b>Сервисный сбор {ORDER.fee} ₽</b>
            Это комиссия платёжного агрегатора за проведение заказа. Один раз, сколько бы товаров ни было.
          </p>
          <button type="button" className="press" aria-label="Скрыть" onClick={() => setNote(false)}>
            <Icon name="close" size={20} />
          </button>
        </aside>
      )}
      <Total now={now} lines={cart} />

      {remove && (
        <Sheet label="Удалить товар" onClose={() => setRemove(null)}>
          <h2 className={s.ask}>Удалить товар?</h2>
          <p className={s.askText}>{findProduct(remove.id)?.title} пропадёт из корзины.</p>
          <div className={s.askRow}>
            <Button onClick={() => setRemove(null)}>Оставить</Button>
            <Button
              variant="secondary"
              onClick={() => {
                haptic('press')
                setCart({ ...remove, qty: 0 })
                setRemove(null)
              }}
            >
              Удалить
            </Button>
          </div>
        </Sheet>
      )}
      {need && <BalanceSheet balance={balance} need={missing} onClose={() => setNeed(false)} />}
    </Screen>
  )
}
