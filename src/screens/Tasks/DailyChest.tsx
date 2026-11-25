import { Coin } from '../../components/Amount'
import { Icon } from '../../components/Icon'
import { num, plural } from '../../data/format'
import type { QuestStatus } from '../../data/store'
import type { Reward } from '../../data/types'
import s from './DailyChest.module.css'

type Props = {
  status: QuestStatus
  reward: Reward
  /** какие из трёх заданий дня выполнены */
  lit: boolean[]
  /** «ещё 9 ч» до нового сундука */
  next: string
  onOpen: () => void
}

/* от гнёзд на верхнем крае к крышке сундука, сетка 360×300 */
const WIRES = ['M56.7 0 V34 C56.7 84 96 92 128 112', 'M180 0 V92', 'M303.3 0 V34 C303.3 84 264 92 232 112']

/** Сундук дня: каждое задание зажигает своё гнездо и пускает огонь в сундук */
export function DailyChest({ status, reward, lit, next, onOpen }: Props) {
  const n = lit.filter(Boolean).length
  const todo = lit.length - n
  const ready = status === 'ready'
  const claimed = status === 'claimed'

  if (claimed)
    return (
      <div className={s.closed}>
        <img src="/assets/cases/chest.webp" alt="" />
        <span>
          <b>Сундук открыт</b>
          новый через {next.replace(/^ещё\s/, '')}
        </span>
        <i>
          <Icon name="check" size={22} />
        </i>
      </div>
    )

  return (
    <section className={s.chest} data-ready={ready || undefined} style={{ '--k': n / lit.length } as React.CSSProperties} aria-label={`Сундук дня: ${n} из ${lit.length}`}>
      <span className={s.scene} aria-hidden>
        <i className={s.light} />
        <i className={s.flame} />
        <i className={s.floor} />
        <svg viewBox="0 0 360 300" preserveAspectRatio="none" className={s.wires}>
          {WIRES.map((d, i) => (
            <g key={d} data-on={lit[i] || undefined}>
              <path d={d} className={s.wire} />
              {lit[i] && <path d={d} className={s.pulse} pathLength={100} />}
            </g>
          ))}
        </svg>
      </span>
      {lit.map((on, i) => (
        <span key={i} className={s.socket} data-on={on || undefined} style={{ '--i': i } as React.CSSProperties} aria-hidden>
          <i />
        </span>
      ))}
      <span className={s.art} aria-hidden>
        <img src="/assets/cases/chest.webp" alt="" />
        {n > 0 && (
          <span className={s.embers}>
            {Array.from({ length: n * 4 }, (_, i) => (
              <i key={i} style={{ '--x': `${6 + ((i * 37) % 88)}%`, '--d': `${-(i * 0.43)}s`, '--sway': `${((i % 5) - 2) * 9}px`, '--s': `${9 + (i % 3) * 4}px` } as React.CSSProperties} />
            ))}
          </span>
        )}
      </span>
      <h3 className={s.title}>Сундук дня</h3>
      <p className={s.goal}>{ready ? 'все три задания выполнены' : `осталось ${num(todo)} ${plural(todo, ['задание', 'задания', 'заданий'])}`}</p>
      <dl className={s.loot}>
        {reward.soft && (
          <div>
            <Coin kind="soft" size={20} />
            <b>{num(reward.soft)}</b>
          </div>
        )}
        {reward.hard && (
          <div>
            <Coin kind="hard" size={20} />
            <b>{num(reward.hard)}</b>
          </div>
        )}
        {reward.xp && (
          <div>
            <b>{num(reward.xp)} XP</b>
          </div>
        )}
      </dl>
      {ready && (
        <button type="button" className={`press ${s.open}`} onClick={onOpen}>
          Открыть сундук
        </button>
      )}
    </section>
  )
}
