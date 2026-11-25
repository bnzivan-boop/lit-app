import { num } from '../data/format'
import { RARITY_NAME } from '../data/labels'
import { lootVars } from '../data/lootColors'
import type { Loot } from '../data/store'
import type { Rarity } from '../data/types'
import { LootArt } from './LootArt'
import s from './LootCard.module.css'

/* редкость огоньками: от одного до четырёх */
const FLAMES: Record<Rarity, number> = { common: 1, rare: 2, epic: 3, legend: 4 }

type Props = {
  loot: Loot
  /** sm — в составе, lg — в рулетке, slot — в слот-машине, тянется на всю ячейку */
  size?: 'sm' | 'lg' | 'slot'
  /** сколько раз выпало */
  count?: number
}

/** Карточка приза: сцена его цвета на всю площадь, внизу тёмная скошенная плашка */
export function LootCard({ loot, size = 'sm', count = 1 }: Props) {
  const lg = size === 'lg'
  return (
    <div className={`${s.card} ${s[size]} ${s[loot.rarity]}`} style={lootVars(loot.kind)}>
      <span className={s.scene}>
        <span className={s.flame} aria-hidden />
        <span className={s.plate}>
          {size === 'slot' ? (
            <span className={s.short}>{loot.amount ? `+${num(loot.amount)}` : ''}</span>
          ) : lg && loot.amount ? (
            <span className={s.amount}>
              +{num(loot.amount)}
              <small>{loot.kind === 'soft' ? 'софт' : 'хард'}</small>
            </span>
          ) : (
            <span className={s.title}>{loot.title}</span>
          )}
          {lg && (
            <span className={s.rarity}>
              <span className={s.gems} aria-hidden>
                {Array.from({ length: FLAMES[loot.rarity] }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
              {RARITY_NAME[loot.rarity]}
            </span>
          )}
        </span>
      </span>
      <span className={s.edge} aria-hidden />
      <span className={s.art}>
        <LootArt loot={loot} />
      </span>
      {lg && (loot.rarity === 'legend' || loot.rarity === 'epic') && (
        <span className={s.gloss} aria-hidden>
          <span className={s.shine} />
        </span>
      )}
      {count > 1 && <span className={s.count}>×{count}</span>}
    </div>
  )
}
