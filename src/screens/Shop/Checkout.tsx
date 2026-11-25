import { useRef } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { num } from '../../data/format'
import { cartSum, deliveryPlace, findProduct, needsDelivery, thumb } from '../../data/shop'
import { useStore } from '../../data/store'
import { haptic } from '../../lib/motion'
import { useOrigin } from '../../lib/useOrigin'
import { DeliveryForm } from './DeliveryForm'
import { PaymentForm, RecipientForm } from './Forms'
import { Screen } from '../../components/Screen'
import { Total } from './Total'
import s from './Checkout.module.css'

const date = (t: number) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }).format(t)

/** Оформление: два шага для кодов, три — если есть что везти. ?step= открывает форму */
export function Checkout() {
  const go = useNavigate()
  const back = useOrigin('/cart')
  const { state } = useLocation()
  const [params, setParams] = useSearchParams()
  const placed = useRef(false)
  const { cart, checkout, saveCheckout, placeOrder, balance, now, profile } = useStore()
  const { recipient: r, delivery: d, payment } = checkout
  if (cart.length === 0) return placed.current ? null : <Navigate to="/cart" replace />

  const physical = needsDelivery(cart)
  const hard = cartSum(cart)
  const step = params.get('step')
  const show = (id?: string) => setParams(id ? { step: id } : {}, { replace: true, state })
  const save = (data: Parameters<typeof saveCheckout>[0]) => {
    saveCheckout(data)
    haptic('done')
    show()
    scrollTo(0, 0)
  }

  if (step === 'recipient') return <RecipientForm value={r} phone={profile.phone} onBack={() => show()} onSave={(recipient) => save({ recipient })} />
  if (step === 'delivery' && physical) return <DeliveryForm value={d} onBack={() => show()} onSave={(delivery) => save({ delivery })} />
  if (step === 'payment') return <PaymentForm value={payment} onBack={() => show()} onSave={(p) => save({ payment: p })} />

  const steps = [
    { id: 'recipient', title: 'Получатель', done: Boolean(r), text: r ? [[r.surname, r.name, r.patronymic].filter(Boolean).join(' '), r.phone] : ['кому отдать и как связаться'] },
    ...(physical
      ? [
          {
            id: 'delivery',
            title: 'Доставка',
            done: Boolean(d),
            text: d
              ? [deliveryPlace(d), `${d.mode === 'door' ? 'курьер' : d.point?.type === 'POSTAMAT' ? 'постамат' : 'пункт'} СДЭК, до ${date(now + d.tariff.max * 864e5)}, ${num(d.tariff.price)} ₽`]
              : ['СДЭК: пункт, постамат или курьер'],
          },
        ]
      : []),
    { id: 'payment', title: 'Оплата', done: Boolean(payment), text: [payment ?? physical ? 'сервисный сбор и доставка' : 'только сервисный сбор'] },
  ]
  const next = steps.find((x) => !x.done)
  const ready = !next && hard <= balance.hard

  function submit() {
    if (next) return show(next.id)
    haptic('done')
    placed.current = true
    placeOrder()
    go('/order/done', { replace: true })
  }

  return (
    <Screen
      title="Оформление"
      onBack={back}
      footer={
        <Button onClick={submit} disabled={!next && !ready}>
          {next ? `Заполнить: ${next.title.toLowerCase()}` : (
            <>
              Оформить за <Amount value={hard} kind="hard" coin={20} />
            </>
          )}
        </Button>
      }
    >
      <ol className={s.steps}>
        {steps.map((x, i) => (
          <li key={x.id}>
            <button type="button" className={`press ${s.step}`} data-done={x.done || undefined} onClick={() => show(x.id)}>
              <span className={s.num}>{x.done ? <Icon name="check" size={22} /> : i + 1}</span>
              <span className={s.text}>
                <b>{x.title}</b>
                {x.text.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
              <Icon name="chevron" size={20} />
            </button>
          </li>
        ))}
      </ol>

      <section className={s.order}>
        <h2>Твой заказ</h2>
        <div className={s.goods}>
          {cart.map((l) => (
            <figure key={l.id + l.size}>
              <span>
                <img src={thumb(l.id)} alt="" />
                {l.qty > 1 && <i>×{l.qty}</i>}
              </span>
              <figcaption>
                {findProduct(l.id)?.title}
                {l.size ? `, ${l.size}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <Total lines={cart} delivery={d?.tariff.price} />
    </Screen>
  )
}
