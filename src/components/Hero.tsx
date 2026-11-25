import { useRef, type Ref, type RefObject } from 'react'
import { Coin } from './Amount'
import { num } from '../data/format'
import { CURRENCY_NAME } from '../data/labels'
import type { Currency } from '../data/types'
import { Skeleton } from './Skeleton'
import { Fire, type FireState } from './Fire'
import { useLiquid } from '../lib/useLiquid'
import { usePlate } from '../lib/usePlate'
import { IconButton } from './Button'
import { Icon } from './Icon'
import s from './Hero.module.css'

type Props = {
  nick: string
  id: string
  level: number
  xp: number
  xpNext: number
  balance: { soft: number; hard: number }
  /** остаток буста: «23 ч 59 мин» */
  boost?: string
  fire: RefObject<FireState>
  head?: Ref<HTMLImageElement>
  /** монета софта: сюда прилетают собранные монеты */
  softCoin?: Ref<HTMLSpanElement>
  onProfile?: () => void
  onMenu?: () => void
  onCopyId?: () => void
}

/** Герой главной: ник, наклонная плашка, голова выходит за край, капсула уровня, жидкая шкала опыта */
export function Hero({ nick, id, level, xp, xpNext, balance, boost, fire, head, softCoin, onProfile, onMenu, onCopyId }: Props) {
  const plate = useRef<HTMLDivElement>(null)
  /* верхний край опускается вправо */
  const shape = usePlate(plate, 0, 44)

  return (
    <section className={s.hero}>
      <span className={s.backdrop} aria-hidden>
        <img className={s.logo} src="/assets/brand/logo-flame-white.png" alt="" />
      </span>
      <button type="button" className={`press ${s.who}`} aria-label={`Профиль: ${nick}`} onClick={onProfile}>
        <span className={s.nick}>{nick}</span>
      </button>
      <button type="button" className={`press ${s.id}`} onClick={onCopyId} aria-label={`Скопировать ID ${id}`}>
        ID {id.slice(0, 8)}…{id.slice(-4)}
        <Icon name="copy" size={16} />
      </button>
      <div ref={plate} className={s.plate} style={shape} />
      <Fire state={fire} className={s.fire} />
      <img ref={head} className={s.head} src="/assets/characters/hero-head-blue-fire.png" alt="" />
      <div className={s.level}>
        <span>{level}</span>
        LVL
      </div>
      <IconButton icon="menu" label="Меню" onClick={onMenu} className={s.menu} />
      <div className={s.money}>
        <Money kind="soft" value={balance.soft} coin={softCoin} />
        <Money kind="hard" value={balance.hard} />
      </div>
      <Xp xp={xp} next={xpNext} level={level} boost={boost} />
    </section>
  )
}

function Money({ kind, value, coin }: { kind: Currency; value: number; coin?: Ref<HTMLSpanElement> }) {
  return (
    <div className={s.coin}>
      <span ref={coin} className={s.coinIcon}>
        <Coin kind={kind} />
      </span>
      <span className={`${s.coinText} ${value >= 100_000 ? s.coinLong : ''}`}>
        <small>{CURRENCY_NAME[kind]}</small>
        {num(value)}
      </span>
    </div>
  )
}

function Xp({ xp, next, level, boost }: { xp: number; next: number; level: number; boost?: string }) {
  const fill = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLSpanElement>(null)
  useLiquid(fill, xp / next, 'x', (px) => {
    if (glow.current) glow.current.style.transform = `translateX(${px}px)`
  })
  const text = (
    <>
      <b>{num(xp)} XP</b>
      {boost ? (
        <span className={s.boost}>
          <b>×2</b> {boost}
        </span>
      ) : (
        <span>
          ещё {num(next - xp)} до {level + 1} уровня
        </span>
      )}
    </>
  )
  return (
    <div className={s.xp} role="progressbar" aria-label="Опыт" aria-valuemin={0} aria-valuemax={next} aria-valuenow={xp}>
      <span ref={glow} className={s.glow} />
      <div className={s.xpText}>{text}</div>
      <div ref={fill} className={`${s.xpText} ${s.xpFill}`} aria-hidden>
        {text}
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <section className={s.hero} aria-busy>
      <div className={s.who}>
        <Skeleton w={176} h={30} r={8} />
        <Skeleton w={84} h={12} />
      </div>
      <div className={`${s.plate} ${s.plateEmpty}`} />
      <div className={s.money}>
        <Skeleton w={132} h={42} r={21} />
        <Skeleton w={132} h={42} r={21} />
      </div>
      <div className={s.xp}>
        <Skeleton h={52} r={26} />
      </div>
    </section>
  )
}
