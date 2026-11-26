import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { num } from '../../data/format'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { LEAGUE_NAME } from '../../data/labels'
import { DROP, findProduct, isOpen, maxQty, photo, saleOf } from '../../data/shop'
import { useStore } from '../../data/store'
import { haptic, reduced } from '../../lib/motion'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { usePanel } from '../../lib/usePanel'
import { BalanceSheet } from './BalanceSheet'
import { CartButton } from './CartButton'
import { LeagueMark } from './LeagueMark'
import { SizeSheet } from './SizeSheet'
import { Stepper } from './Stepper'
import s from './Product.module.css'

/** Карточка товара: большое фото, размер, цена и одна кнопка по состоянию */
export function Product() {
  const { id } = useParams()
  const go = useNavigate()
  const open = useOpen()
  const back = useOrigin('/shop')
  const { balance, cart, cartCount, setCart, user, now } = useStore()
  const p = findProduct(id)
  const [size, setSize] = useState<string>()
  const [chart, setChart] = useState(false)
  const [need, setNeed] = useState(false)
  const [hint, setHint] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const sizes = useRef<HTMLDivElement>(null)
  const clip = usePanel(frame, { bottom: [34, 0], r: 0.1 })
  if (!p) return <Navigate to="/shop" replace />
  if (p.id === DROP.id) return <Navigate to="/drop" replace />

  const sale = saleOf(p, now)
  const price = sale?.price ?? p.price.hard
  const closed = !isOpen(p, user.league)
  const missing = price - balance.hard
  const line = cart.find((l) => l.id === p.id && l.size === size)
  const qty = line?.qty ?? 0

  function add() {
    if (p!.sizes && !size) {
      setHint(true)
      sizes.current?.scrollIntoView({ block: 'center' })
      haptic('land')
      if (!reduced())
        sizes.current?.animate([{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 320 })
      return
    }
    haptic('press')
    setCart({ id: p!.id, size, qty: 1 })
  }

  return (
    <main className={s.page}>
      <div className={s.photo} data-sized={(p.sizes && !closed) || undefined}>
        <div ref={frame} className={s.frame} style={clip}>
          <img src={photo(p.id)} alt={p.title} />
        </div>
        <button type="button" className={`press ${s.back}`} aria-label="Назад" onClick={back}>
          <Icon name="chevron" size={24} />
        </button>
        <span className={s.cart}>
          <CartButton count={cartCount} onClick={() => open('/cart')} />
        </span>
      </div>

      <div className={s.tags}>
        <span className={s.league}>
          <LeagueMark league={p.minLeague} locked={closed} size={30} />
          {closed ? `откроется в лиге «${LEAGUE_NAME[p.minLeague]}»` : LEAGUE_NAME[p.minLeague]}
        </span>
        {p.left && <span className={s.left}>осталось {p.left}</span>}
      </div>
      <h1 className={s.title}>{p.title}</h1>
      {sale && (
        <div className={s.sale}>
          <span className={s.salePct}>−{sale.percent}%</span>
          <span className={s.saleText}>
            <b>{sale.title}</b>
            <span>
              до {new Date(sale.endsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · потом <Amount value={sale.base} kind="hard" coin={15} />
            </span>
          </span>
          <span className={s.salePrice}>
            <Amount value={sale.price} kind="hard" coin={20} />
            <s>{num(sale.base)}</s>
          </span>
        </div>
      )}
      <p className={s.about}>{p.about}</p>
      <p className={s.how}>{p.digital ? 'Придёт кодом в «Мои заказы», доставка не нужна' : 'Доставим по адресу, срок увидишь при оформлении'}</p>

      {p.sizes && !closed && (
        <section className={s.sizes}>
          <header>
            <h2 data-hint={hint || undefined}>{hint ? 'Выбери размер' : 'Размер'}</h2>
            <button type="button" className={`press ${s.chart}`} onClick={() => setChart(true)}>
              Размерная сетка
              <Icon name="chevron" size={18} />
            </button>
          </header>
          <div ref={sizes} role="radiogroup" aria-label="Размер">
            {p.sizes.map((x) => (
              <button key={x} type="button" role="radio" aria-checked={x === size} className="press" onClick={() => (setSize(x), setHint(false))}>
                {x}
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className={s.bar}>
        {closed ? (
          <>
            <p className={s.note}>Поднимись до лиги «{LEAGUE_NAME[p.minLeague]}», и товар откроется</p>
            <Button variant="secondary" onClick={() => go('/games')}>
              Играть и подниматься
            </Button>
          </>
        ) : qty > 0 ? (
          <div className={s.added}>
            <Stepper value={qty} max={maxQty(p)} big onChange={(n) => setCart({ id: p.id, size, qty: n })} />
            <Button onClick={() => open('/cart')}>
              В корзину <Amount value={price * qty} kind="hard" coin={20} />
            </Button>
          </div>
        ) : missing > 0 ? (
          <>
            <div className={s.need}>
              <span>
                <Amount value={price} kind="hard" coin={20} />
              </span>
              <i>
                <b style={{ transform: `scaleX(${balance.hard / price})` }} />
              </i>
            </div>
            <Button onClick={() => setNeed(true)}>
              Добрать ещё <Amount value={missing} kind="hard" coin={20} />
            </Button>
          </>
        ) : (
          <Button onClick={add}>
            Добавить за <Amount value={price} kind="hard" coin={20} />
          </Button>
        )}
      </footer>

      {chart && p.chart && <SizeSheet chart={p.chart} onClose={() => setChart(false)} />}
      {need && <BalanceSheet balance={balance} need={missing} onClose={() => setNeed(false)} />}
    </main>
  )
}
