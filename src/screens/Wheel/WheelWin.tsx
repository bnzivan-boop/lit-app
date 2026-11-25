import { useEffect, useRef, useState } from 'react'
import { Amount, Coin } from '../../components/Amount'
import { num } from '../../data/format'
import { lootVars } from '../../data/lootColors'
import type { WheelPrize } from '../../data/store'
import { flyCoins, haptic, reduced } from '../../lib/motion'
import { sparks } from '../../lib/sparks'
import s from './WheelWin.module.css'

type Props = {
  prize: WheelPrize
  image: string
  balance: { soft: number; hard: number }
  held: number
  onHeld: (left: number) => void
  onClose: () => void
}

/** Выигрыш колеса: экран в цвете валюты, чем больше сумма, тем больше огоньков */
export function WheelWin({ prize, image, balance, held, onHeld, onClose }: Props) {
  const root = useRef<HTMLElement>(null)
  const art = useRef<HTMLImageElement>(null)
  const pills = useRef<HTMLSpanElement>(null)
  const [taking, setTaking] = useState(false)
  const leave = useRef(0)
  useEffect(() => () => clearTimeout(leave.current), [])
  useEffect(() => sparks(root.current!, art.current!, 6 + prize.tier * 8), [prize])

  function take() {
    if (taking) return
    haptic('press')
    setTaking(true)
    const coin = pills.current?.querySelector<HTMLElement>(`img[src*="${prize.kind}"]`)
    if (reduced() || !coin || !art.current || !root.current) {
      onHeld(0)
      leave.current = window.setTimeout(onClose, 260)
      return
    }
    const total = held
    const count = Math.min(18, Math.max(5, total))
    let landed = 0
    flyCoins(
      root.current,
      art.current.getBoundingClientRect(),
      coin.getBoundingClientRect(),
      count,
      () => {
        landed++
        onHeld(total - Math.round((total * landed) / count))
        coin.animate([{ transform: 'scale(1.4)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' })
        if (landed % 3 === 0) haptic('land')
        if (landed === count) {
          haptic('done')
          leave.current = window.setTimeout(onClose, 420)
        }
      },
      prize.kind,
    )
  }

  const rest = (kind: 'soft' | 'hard') => balance[kind] - (prize.kind === kind ? held : 0)

  return (
    <main ref={root} className={s.screen} style={lootVars(prize.kind)}>
      <span className={s.glow} aria-hidden />
      <span className={s.flame} aria-hidden />
      <header className={s.top}>
        <span ref={pills} className={s.balance}>
          <Amount value={rest('soft')} kind="soft" coin={20} />
          <Amount value={rest('hard')} kind="hard" coin={20} />
        </span>
      </header>
      <div className={s.center}>
        <div className={s.stage}>
          <img ref={art} className={s.art} src={image} alt="" />
        </div>
        <h1 className={s.amount}>
          +{num(prize.amount)}
          <span className={s.coin}>
            <Coin kind={prize.kind} />
          </span>
        </h1>
        <p className={s.note}>Приходи завтра, колесо снова твоё</p>
      </div>
      <footer className={s.actions}>
        <button type="button" className={`press ${s.take}`} onClick={take}>
          Забрать
        </button>
      </footer>
    </main>
  )
}
