import { weekdayOf } from '../data/format'
import type { DropPhase } from '../data/shop'
import { Amount } from './Amount'
import { Icon } from './Icon'
import s from './DropBar.module.css'

type Props = {
  title: string
  image: string
  quantity: number
  price: number
  startsAt: number
  msLeft: number
  phase?: DropPhase
  left?: number
  remind: boolean
  onRemind?: () => void
  onOpen?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Дроп недели: что, за сколько, когда и как получить */
export function DropBar({ title, image, quantity, price, startsAt, msLeft, phase = 'wait', left, remind, onRemind, onOpen }: Props) {
  const min = Math.max(0, Math.floor(msLeft / 60_000))
  const parts = [
    [String(Math.floor(min / 1440)), 'дн'],
    [pad(Math.floor((min % 1440) / 60)), 'ч'],
    [pad(min % 60), 'мин'],
  ]
  return (
    <article className={s.drop} data-phase={phase}>
      <span className={s.scene} aria-hidden>
        <span className={s.flame} />
      </span>
      <img className={s.prize} src={image} alt={title} />
      <div className={s.head}>
        <h3>{phase === 'live' ? 'Дроп идёт' : phase === 'over' ? 'Дроп разобрали' : `Дроп ${weekdayOf(startsAt)}`}</h3>
        <p>
          {title} за <Amount value={price} kind="hard" coin={15} />
          {phase === 'wait' && `. ${quantity} штук, кто успел`}
          {phase === 'live' && `. Осталось ${left} из ${quantity}`}
        </p>
      </div>
      {phase === 'wait' && (
        <div className={s.timer} role="timer" aria-label={parts.map((p) => p.join(' ')).join(' ')}>
          {parts.map(([n, unit]) => (
            <span key={unit}>
              <b>{n}</b>
              {unit}
            </span>
          ))}
        </div>
      )}
      <div className={s.actions}>
        <button type="button" className={`press ${s.bell}`} onClick={onOpen}>
          {phase === 'live' ? 'Забрать' : phase === 'over' ? 'Что дальше' : 'Как получить'}
        </button>
        {phase === 'wait' && (
          <button type="button" className={`press ${s.round}`} aria-pressed={remind} aria-label={remind ? 'Напоминание включено' : 'Напомнить'} onClick={onRemind}>
            <Icon name={remind ? 'check' : 'bell'} size={20} />
          </button>
        )}
      </div>
    </article>
  )
}
