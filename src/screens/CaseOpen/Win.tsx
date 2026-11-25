import { useEffect, useRef, useState } from 'react'
import { Amount } from '../../components/Amount'
import { LootArt } from '../../components/LootArt'
import { num } from '../../data/format'
import { RARITY_NAME } from '../../data/labels'
import { lootVars } from '../../data/lootColors'
import type { Loot } from '../../data/store'
import type { Rarity } from '../../data/types'
import { flyCoins, haptic, reduced } from '../../lib/motion'
import { sparks } from '../../lib/sparks'
import s from './Win.module.css'

const SPARKS: Record<Rarity, number> = { common: 10, rare: 18, epic: 28, legend: 44 }

/* что произойдёт с призом */
const NOTE: Record<Loot['kind'], string> = {
  soft: 'Софт уже твой',
  hard: 'Хард для магазина призов',
  boost: 'К силе Титана и XP',
  frame: 'Рамка для аватара',
  headphones: 'Ищи в «Моих заказах»',
  hoodie: 'Ищи в «Моих заказах»',
}

type Props = {
  loot: Loot
  price: number
  count?: number
  balance: number
  held: number
  onHeld: (left: number) => void
  onAgain: () => void
  onClose: () => void
}

/** Экран выигрыша: цвет фона говорит, что за приз, редкость — на плашке и в числе огоньков */
export function Win({ loot, price, balance, held, onHeld, onAgain, onClose }: Props) {
  const root = useRef<HTMLElement>(null)
  const art = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const [taking, setTaking] = useState(false)
  const leave = useRef(0)
  useEffect(() => () => clearTimeout(leave.current), [])

  /* Фирменные огоньки разлетаются от приза: чем реже, тем их больше */
  useEffect(() => sparks(root.current!, art.current!, SPARKS[loot.rarity]), [loot])

  function take() {
    if (taking) return
    haptic('press')
    setTaking(true)
    const coin = pill.current?.querySelector('img')
    if (held === 0 || reduced() || !coin || !art.current || !root.current) {
      onHeld(0)
      leave.current = window.setTimeout(onClose, 260)
      return
    }
    const total = held
    const count = 14
    let landed = 0
    flyCoins(root.current, art.current.getBoundingClientRect(), coin.getBoundingClientRect(), count, () => {
      landed++
      onHeld(total - Math.round((total * landed) / count))
      if (landed % 3 === 0) haptic('land')
      if (landed === count) leave.current = window.setTimeout(onClose, 420)
    })
  }

  return (
    <main ref={root} className={`${s.screen} ${s[loot.rarity]} ${taking ? s.taking : ''}`} style={lootVars(loot.kind)}>
      <span className={s.glow} aria-hidden />
      <span className={s.flame} aria-hidden />
      <header className={s.top}>
        <span ref={pill} className={s.balance}>
          <Amount value={balance - held} kind="soft" coin={20} />
        </span>
      </header>
      <div className={s.center}>
        <p className={s.rarity}>{RARITY_NAME[loot.rarity]}</p>
        <div ref={art} className={s.art}>
          <LootArt loot={loot} />
        </div>
        <h1 className={s.title}>{loot.amount ? `+${num(loot.amount)}` : loot.title}</h1>
        <p className={s.note}>{NOTE[loot.kind]}</p>
      </div>
      <footer className={s.actions}>
        <button type="button" className={`press ${s.take}`} onClick={take}>
          Забрать
        </button>
        <button type="button" className={`press ${s.again}`} onClick={onAgain} disabled={taking || balance < price}>
          Открыть ещё <Amount value={price} kind="soft" coin={20} />
        </button>
      </footer>
    </main>
  )
}
