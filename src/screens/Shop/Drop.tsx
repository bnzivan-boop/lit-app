import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { weekdayOf } from '../../data/format'
import { LEAGUE_NAME } from '../../data/labels'
import { DROP } from '../../data/shop'
import { useStore } from '../../data/store'
import { haptic } from '../../lib/motion'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { BalanceSheet } from './BalanceSheet'
import { DropTimer } from './DropTimer'
import { LeagueMark } from './LeagueMark'
import { Screen } from '../../components/Screen'
import s from './Drop.module.css'

const when = (t: number) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' }).format(t).replace(' в ', ', ')

/** Дроп: что это, три условия с твоей готовностью и одно действие по фазе */
export function Drop() {
  const go = useNavigate()
  const open = useOpen()
  const back = useOrigin('/shop')
  const { drop, balance, user, remindDrop, toggleRemind, setCart } = useStore()
  const [need, setNeed] = useState(false)
  const missing = Math.max(0, drop.price - balance.hard)
  const { phase } = drop
  const live = phase === 'live'
  const over = phase === 'over'
  const ready = drop.open && missing === 0

  function take() {
    haptic('press')
    setCart({ id: DROP.id, qty: 1 })
    open('/cart')
  }

  let action: ReactNode
  if (over || drop.mine)
    action = <Button onClick={() => go(drop.mine ? '/orders' : '/shop', { replace: true })}>{drop.mine ? 'Мои заказы' : 'К другим призам'}</Button>
  else if (drop.inCart) action = <Button onClick={() => open('/cart')}>Оформить в корзине</Button>
  else if (!drop.open)
    action = (
      <Button variant="secondary" onClick={() => go('/games')}>
        Играть и подниматься
      </Button>
    )
  else if (missing > 0)
    action = (
      <Button onClick={() => setNeed(true)}>
        Добрать ещё <Amount value={missing} kind="hard" coin={20} />
      </Button>
    )
  else if (live)
    action = (
      <Button onClick={take}>
        Забрать за <Amount value={drop.price} kind="hard" coin={20} />
      </Button>
    )
  else
    action = (
      <Button variant={remindDrop ? 'secondary' : 'primary'} onClick={toggleRemind}>
        <Icon name={remindDrop ? 'check' : 'bell'} size={20} />
        {remindDrop ? 'Напомним перед стартом' : 'Напомнить о старте'}
      </Button>
    )

  return (
    <Screen title={`Дроп ${weekdayOf(drop.startsAt)}`} onBack={back} footer={action}>
      <section className={s.hero} data-phase={phase}>
        <span className={s.scene} aria-hidden>
          <i />
        </span>
        <img className={s.prize} src={drop.image} alt="" />
        <div className={s.info}>
          <h2>{drop.title}</h2>
          <p className={s.price}>
            <Amount value={drop.price} kind="hard" coin={20} />
          </p>
          {live ? (
            <p className={s.left}>
              осталось <b>{drop.left}</b> из {drop.quantity}
              <i>
                <u style={{ transform: `scaleX(${drop.left / drop.quantity})` }} />
              </i>
            </p>
          ) : over ? (
            <p className={s.gone}>Разобрали</p>
          ) : (
            <DropTimer msLeft={drop.msLeft} />
          )}
        </div>
      </section>

      <p className={s.lead}>
        {over
          ? `Все ${drop.quantity} штук уже у игроков. Хард остался у тебя, новый дроп будет через неделю.`
          : `Это не розыгрыш. Раз в неделю ${drop.quantity} редких призов продаются за хард: кто успел, тот забрал.`}
      </p>

      {!over && (
        <>
          <h2 className={s.how}>Как получить</h2>
          <ol className={s.steps}>
            <Step
              done={drop.open}
              icon={<LeagueMark league={drop.league} locked={!drop.open} size={48} />}
              title={`Лига «${LEAGUE_NAME[drop.league]}» или выше`}
              text={drop.open ? `у тебя ${LEAGUE_NAME[user.league].toLowerCase()}, подходит` : `у тебя ${LEAGUE_NAME[user.league].toLowerCase()}, поднимайся в играх и заданиях`}
            />
            <Step
              done={missing === 0}
              icon={<img src="/assets/currency/coin-hard.png" alt="" width={48} height={48} />}
              title={
                <>
                  Накопи <Amount value={drop.price} kind="hard" coin={20} />
                </>
              }
              text={
                missing > 0 ? (
                  <>
                    <i className={s.bar}>
                      <u style={{ transform: `scaleX(${balance.hard / drop.price})` }} />
                    </i>
                    <span className={s.row}>
                      есть <Amount value={balance.hard} kind="hard" coin={15} /> нужно ещё <Amount value={missing} kind="hard" coin={15} />
                    </span>
                  </>
                ) : (
                  'харда хватает'
                )
              }
            />
            <Step
              done={live}
              icon={<Icon name="clock" size={30} />}
              title={live ? 'Жми «Забрать»' : 'Зайди к старту'}
              text={live ? 'дроп идёт, одна штука в руки' : `${when(drop.startsAt)} по Москве, одна штука в руки`}
              aside={
                !live && (
                  <button type="button" className={`press ${s.bell}`} aria-pressed={remindDrop} aria-label="Напомнить о старте" onClick={toggleRemind}>
                    <Icon name={remindDrop ? 'check' : 'bell'} size={22} />
                  </button>
                )
              }
            />
          </ol>
          <p className={s.note}>
            {ready ? (live ? 'Всё готово. Хард спишется при оформлении заказа.' : 'Ты готов. В момент старта здесь появится кнопка «Забрать».') : 'Не успеешь — хард останется у тебя до следующего дропа.'}
          </p>
        </>
      )}
      {need && <BalanceSheet balance={balance} need={missing} onClose={() => setNeed(false)} />}
    </Screen>
  )
}

type StepProps = { done: boolean; icon: ReactNode; title: ReactNode; text: ReactNode; aside?: ReactNode }

function Step({ done, icon, title, text, aside }: StepProps) {
  return (
    <li className={s.step} data-done={done || undefined}>
      <span className={s.icon}>
        {icon}
        {done && (
          <i>
            <Icon name="check" size={15} />
          </i>
        )}
      </span>
      <div className={s.text}>
        <b>{title}</b>
        <div>{text}</div>
      </div>
      {aside}
    </li>
  )
}
