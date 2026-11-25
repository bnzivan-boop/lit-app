import { useRef, useState } from 'react'
import { Amount } from '../../components/Amount'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/TopBar'
import { weekdayOf } from '../../data/format'
import { LEAGUE_NAME } from '../../data/labels'
import { CATEGORIES, isOpen, LEAGUES, PRODUCTS } from '../../data/shop'
import { useStore } from '../../data/store'
import { useOpen } from '../../lib/useOrigin'
import { usePanel } from '../../lib/usePanel'
import { BalanceSheet } from './BalanceSheet'
import { CartButton } from './CartButton'
import { DropTimer } from './DropTimer'
import { LeagueMark } from './LeagueMark'
import { ProductCard } from './ProductCard'
import s from './Shop.module.css'

/** Магазин: дроп недели, путь по лигам, товары полками по лигам */
export function Shop() {
  const open = useOpen()
  const { balance, user, cartCount, drop, remindDrop, toggleRemind } = useStore()
  const [category, setCategory] = useState('all')
  const [info, setInfo] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const clip = usePanel(frame, { bottom: [0, 30], r: 0.1 })
  const list = PRODUCTS.filter((p) => category === 'all' || p.category === category)
  const at = LEAGUES.indexOf(user.league)
  /* своя лига первой, потом ниже, потом закрытые по порядку */
  const order = [...LEAGUES.slice(0, at + 1).reverse(), ...LEAGUES.slice(at + 1)]
  const shelves = order.map((l) => ({ league: l, items: list.filter((p) => p.minLeague === l) })).filter((x) => x.items.length > 0)

  function jump(league: string) {
    document.getElementById(`shelf-${league}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  const cart = <CartButton count={cartCount} onClick={() => open('/cart')} plain />
  return (
    <main className={s.main}>
      <TopBar nick="Магазин" balance={balance} after={250} extra={cart} />
      <header className={s.hero}>
        <div ref={frame} className={s.frame} style={clip} aria-hidden>
          <span className={s.flame} />
        </div>
        <div className={s.top}>
          <button type="button" className={`press ${s.balance}`} onClick={() => setInfo(true)} aria-label="Что такое софт и хард">
            <Amount value={balance.soft} kind="soft" coin={18} />
            <Amount value={balance.hard} kind="hard" coin={18} />
          </button>
          <CartButton count={cartCount} onClick={() => open('/cart')} />
        </div>
        <img className={s.prize} src={drop.image} alt="" />
        <div className={s.drop}>
          <h1>{drop.phase === 'live' ? 'Дроп идёт' : drop.phase === 'over' ? 'Дроп разобрали' : `Дроп ${weekdayOf(drop.startsAt)}`}</h1>
          <p>
            {drop.phase === 'live' ? `Осталось ${drop.left} из ${drop.quantity}. ` : ''}
            {drop.title} за <Amount value={drop.price} kind="hard" coin={15} />
            {drop.phase === 'wait' && `. Всего ${drop.quantity} штук, кто успел, тот забрал`}
          </p>
          {drop.phase === 'wait' && (
            <div className={s.timer}>
              <DropTimer msLeft={drop.msLeft} />
            </div>
          )}
          <div className={s.dropActions}>
            <button type="button" className={`press ${s.bell}`} onClick={() => open('/drop')}>
              {drop.phase === 'live' ? 'Забрать' : drop.phase === 'over' ? 'Что дальше' : 'Как получить'}
              <Icon name="chevron" size={18} />
            </button>
            {drop.phase === 'wait' && (
              <button type="button" className={`press ${s.round}`} aria-pressed={remindDrop} aria-label={remindDrop ? 'Напоминание включено' : 'Напомнить'} onClick={toggleRemind}>
                <Icon name={remindDrop ? 'check' : 'bell'} size={22} />
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className={s.rail} aria-label="Лиги">
        {LEAGUES.map((l, i) => (
          <button key={l} type="button" className="press" data-state={i === at ? 'me' : i < at ? 'open' : 'lock'} onClick={() => jump(l)}>
            <LeagueMark league={l} locked={i > at} size={i === at ? 60 : 46} />
            <span>{LEAGUE_NAME[l]}</span>
          </button>
        ))}
      </nav>

      <div className={s.chips} role="radiogroup" aria-label="Раздел">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={c.id === category} className={`press ${s.chip}`} onClick={() => setCategory(c.id)}>
            {c.title}
          </button>
        ))}
      </div>

      {shelves.map(({ league, items }) => {
        const closed = !isOpen(items[0], user.league)
        return (
          <section key={league} id={`shelf-${league}`} className={s.shelf} data-closed={closed || undefined}>
            <header>
              <LeagueMark league={league} locked={closed} size={40} />
              <div>
                <h2>{LEAGUE_NAME[league]}</h2>
                <p>{league === user.league ? 'твоя лига' : closed ? 'откроется, когда поднимешься' : 'открыто'}</p>
              </div>
            </header>
            <div className={s.grid}>
              {items.map((p) => (
                <ProductCard key={p.id} product={p} hard={balance.hard} closed={closed} onClick={() => open(`/shop/${p.id}`)} />
              ))}
            </div>
          </section>
        )
      })}

      {info && <BalanceSheet balance={balance} onClose={() => setInfo(false)} />}
    </main>
  )
}
