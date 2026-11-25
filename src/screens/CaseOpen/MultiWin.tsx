import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Amount } from '../../components/Amount'
import { LootCard } from '../../components/LootCard'
import { lootVars } from '../../data/lootColors'
import type { Loot } from '../../data/store'
import type { Rarity } from '../../data/types'
import { flyCoins, haptic, reduced } from '../../lib/motion'
import { plural } from '../../data/format'
import s from './MultiWin.module.css'

const RANK: Record<Rarity, number> = { legend: 3, epic: 2, rare: 1, common: 0 }

type Props = {
  loots: Loot[]
  price: number
  count: number
  balance: number
  held: number
  onHeld: (left: number) => void
  onAgain: () => void
  onClose: () => void
}

/** Итог нескольких прокруток: одинаковые призы сложены, редкие первыми */
export function MultiWin({ loots, price, count, balance, held, onHeld, onAgain, onClose }: Props) {
  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const [taking, setTaking] = useState(false)
  const leave = useRef(0)
  useEffect(() => () => clearTimeout(leave.current), [])

  const groups = [...new Map(loots.map((l) => [l.id, l])).values()]
    .map((loot) => ({ loot, n: loots.filter((l) => l.id === loot.id).length }))
    .sort((a, b) => RANK[b.loot.rarity] - RANK[a.loot.rarity] || (b.loot.amount ?? 0) - (a.loot.amount ?? 0))
  const sum = (kind: Loot['kind']) => loots.reduce((t, l) => t + (l.kind === kind ? (l.amount ?? 0) : 0), 0)
  const soft = sum('soft')
  const hard = sum('hard')
  const canAgain = balance >= price
  const again = Math.min(count, Math.floor(balance / price))

  function take() {
    if (taking) return
    haptic('press')
    setTaking(true)
    const coin = pill.current?.querySelector('img')
    if (held === 0 || reduced() || !coin || !grid.current || !root.current) {
      onHeld(0)
      leave.current = window.setTimeout(onClose, 260)
      return
    }
    const total = held
    const coins = 18
    let landed = 0
    flyCoins(root.current, grid.current.getBoundingClientRect(), coin.getBoundingClientRect(), coins, () => {
      landed++
      onHeld(total - Math.round((total * landed) / coins))
      if (landed % 3 === 0) haptic('land')
      if (landed === coins) leave.current = window.setTimeout(onClose, 420)
    })
  }

  return (
    <main ref={root} className={s.screen} style={lootVars(groups[0].loot.kind)}>
      <span className={s.glow} aria-hidden />
      <span className={s.flame} aria-hidden />
      <header className={s.top}>
        <span ref={pill} className={s.balance}>
          <Amount value={balance - held} kind="soft" coin={20} />
        </span>
      </header>
      <div className={s.center}>
        <h1 className={s.title}>
          {loots.length} {plural(loots.length, ['приз', 'приза', 'призов'])}
        </h1>
        {(soft > 0 || hard > 0) && (
          <p className={s.sums}>
            {soft > 0 && <Amount value={soft} kind="soft" plus coin={20} />}
            {hard > 0 && <Amount value={hard} kind="hard" plus coin={20} />}
          </p>
        )}
        <div ref={grid} className={s.grid} data-few={groups.length <= 2 || undefined} data-many={groups.length > 6 || undefined}>
          {groups.map((g, i) => (
            <div key={g.loot.id} className={s.item} style={{ '--i': i } as CSSProperties}>
              <LootCard loot={g.loot} count={g.n} />
            </div>
          ))}
        </div>
      </div>
      <footer className={s.actions}>
        <button type="button" className={`press ${s.take}`} onClick={take}>
          Забрать всё
        </button>
        <button type="button" className={`press ${s.again}`} onClick={onAgain} disabled={taking || !canAgain}>
          Ещё ×{Math.max(1, again)} за <Amount value={price * Math.max(1, again)} kind="soft" coin={20} />
        </button>
      </footer>
    </main>
  )
}
