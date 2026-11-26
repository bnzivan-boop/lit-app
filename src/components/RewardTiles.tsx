import { useEffect, useRef, useState } from 'react'
import { clock } from '../data/format'
import { Icon } from './Icon'
import s from './RewardTiles.module.css'

/** Буст ×2: фирменный огонь и живой таймер */
export function BoostTile({ msLeft, extended }: { msLeft: number; extended?: boolean }) {
  const [left, setLeft] = useState(msLeft)
  const start = useRef(0)
  useEffect(() => {
    start.current = Date.now()
    const tick = () => setLeft(msLeft - (Date.now() - start.current))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [msLeft])
  return (
    <section className={s.boost}>
      <span className={s.flame} aria-hidden />
      <h2>{extended ? 'Буст продлён' : 'Буст включён'}</h2>
      <span className={s.x}>×2</span>
      <span className={s.sub}>к силе и XP</span>
      <span className={s.time} role="timer">
        {clock(left)}
      </span>
    </section>
  )
}

/** Билет в розыгрыш. Тап ведёт на страницу акции */
export function TicketTile({ count, total, onClick }: { count: number; total: number; onClick?: () => void }) {
  return (
    <button type="button" className={`press ${s.ticket}`} onClick={onClick}>
      <strong>Билет</strong>
      <span className={s.stub} aria-hidden>
        <Icon name="ticket" size={44} />
      </span>
      <span className={s.count}>+{count}</span>
      <span className={s.sub}>{total > count ? `в розыгрыше, всего ${total}` : 'ты в розыгрыше'}</span>
    </button>
  )
}
