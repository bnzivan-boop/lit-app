import { useRef, type ReactNode, type Ref } from 'react'
import { days as daysText, duration, num } from '../data/format'
import { useLiquid } from '../lib/useLiquid'
import { Icon } from './Icon'
import { SegmentBar } from './ProgressBar'
import { Skeleton } from './Skeleton'
import s from './Tiles.module.css'

/** Две копии содержимого: светлая на тёмном и тёмная на заливке. Читается при любом уровне. */
function Dual({ over, children }: { over: Ref<HTMLSpanElement>; children: ReactNode }) {
  return (
    <span className={s.clip}>
      <span className={s.under}>{children}</span>
      <span ref={over} className={s.over} aria-hidden>
        {children}
      </span>
    </span>
  )
}

type ChargeProps = {
  ref?: Ref<HTMLButtonElement>
  current: number
  max: number
  minutesToFull: number
  /** сбор заряда — главное действие экрана */
  main?: boolean
  onCollect?: () => void
  disabled?: boolean
  pressed?: boolean
}

/** Заряд: жидкость поднимается до накопленного, плитка целиком — кнопка сбора */
export function ChargeTile({ ref, current, max, minutesToFull, main, onCollect, disabled, pressed }: ChargeProps) {
  const over = useRef<HTMLSpanElement>(null)
  const part = current / max
  useLiquid(over, part, 'y')
  const left = duration(minutesToFull)
  return (
    <button
      ref={ref}
      type="button"
      className={`press ${s.tile} ${s.charge}`}
      data-tour="charge"
      onClick={current > 0 ? onCollect : undefined}
      disabled={disabled}
      data-pressed={pressed || undefined}
      aria-label={`Собрать заряд: ${current} из ${max}`}
    >
      <Dual over={over}>
        <span className={s.head}>Заряд</span>
        <span className={s.figure}>
          {num(current)}
          <small>/{num(max)}</small>
        </span>
        {part >= 1 ? (
          <span className={main ? s.pill : s.pillQuiet}>Собрать</span>
        ) : (
          <span className={s.sub}>
            {current > 0 && <b>Собрать</b>}
            {current > 0 ? `полный через ${left}` : `Полный через ${left}`}
          </span>
        )}
      </Dual>
      {current > 0 && <img className={s.coin} src="/assets/currency/coin-soft.png" alt="" width={68} height={68} />}
    </button>
  )
}

const SEGMENTS = 7

type StreakProps = {
  days: number
  milestones: number[]
  freezes: number
  todayDone: boolean
  /** вечер, действия ещё не было */
  threat?: boolean
  minutesLeft?: number
  onSave?: () => void
  pressed?: boolean
}

export function StreakTile({ days, milestones, freezes, todayDone, threat, minutesLeft = 0, onSave, pressed }: StreakProps) {
  const next = milestones.find((m) => m > days)
  const prev = milestones.filter((m) => m <= days).at(-1) ?? 0
  const filled = next ? Math.floor(((days - prev) / (next - prev)) * SEGMENTS) : SEGMENTS
  const toNext = next ? `${daysText(next - days)} до награды` : 'все награды получены'

  if (threat) {
    const left = duration(minutesLeft)
    return (
      <button
        type="button"
        className={`press ${s.tile} ${s.threat}`}
        data-tour="streak"
        onClick={onSave}
        data-pressed={pressed || undefined}
        aria-label={`Сохранить стрик ${daysText(days)}: ${freezes > 0 ? 'спишется заморозка' : 'сгорит'} через ${left}`}
      >
        <span className={s.flame} />
        <span className={s.head}>
          Стрик
          <span className={s.headSide}>
            <Icon name="clock" size={16} /> {left}
          </span>
        </span>
        <span className={s.figure}>
          {num(days)}
          <span className={s.burn}>
            {freezes > 0 ? (
              <>
                спишется
                <br />
                заморозка
              </>
            ) : (
              <>
                сгорит
                <br />в 23:59
              </>
            )}
          </span>
        </span>
        <span className={s.pill}>Сохранить</span>
      </button>
    )
  }

  return (
    <div className={`${s.tile} ${s.streak}`} data-tour="streak">
      <span className={s.flame} />
      <span className={s.head}>
        Стрик
        {freezes > 0 && (
          <span className={s.headSide} role="img" aria-label={`Заморозок: ${freezes}`}>
            <Icon name="freeze" size={16} /> {freezes}
          </span>
        )}
      </span>
      <span className={s.figure}>
        {num(days)}
        <small>дн</small>
      </span>
      <span className={s.goal}>
        <SegmentBar
          segments={Array.from({ length: SEGMENTS }, (_, i) =>
            i < filled ? 'done' : i === filled && !todayDone ? 'next' : 'idle',
          )}
          label={toNext}
        />
        <span className={s.sub}>{toNext}</span>
      </span>
    </div>
  )
}

export function TileSkeleton() {
  return (
    <div className={`${s.tile} ${s.streak}`} aria-busy>
      <Skeleton w={64} h={14} />
      <span className={s.figure}>
        <Skeleton w={96} h={38} r={10} />
      </span>
      <span className={s.goal}>
        <Skeleton h={6} r={3} />
        <Skeleton w="70%" h={11} />
      </span>
    </div>
  )
}
