import { num } from '../data/format'
import { LEAGUE_NAME } from '../data/labels'
import type { League } from '../data/types'
import { Amount } from './Amount'
import { Skeleton } from './Skeleton'
import s from './Header.module.css'

type Props = {
  nick: string
  avatar: string
  /** нет, если уровень уже показан крупно на экране */
  level?: number
  league: League
  balance: { soft: number; hard: number }
  onProfile?: () => void
  pressed?: boolean
}

export function Header({ nick, avatar, level, league, balance, onProfile, pressed }: Props) {
  return (
    <header className={s.header}>
      <button
        type="button"
        className={`press ${s.profile}`}
        onClick={onProfile}
        data-pressed={pressed || undefined}
        aria-label={`Профиль: ${nick}, ${level ? `${level} уровень, ` : ''}${LEAGUE_NAME[league]}`}
      >
        <span className={s.avatar}>
          <img src={avatar} alt="" />
        </span>
        <span className={s.text}>
          <span className={s.nick}>{nick}</span>
          <span className={s.meta}>
            {level && `${num(level)} уровень · `}
            {LEAGUE_NAME[league]}
          </span>
        </span>
      </button>
      <div className={s.balance}>
        <Amount value={balance.soft} kind="soft" coin={18} />
        <span className={s.divider} />
        <Amount value={balance.hard} kind="hard" coin={18} />
      </div>
    </header>
  )
}

export function HeaderSkeleton() {
  return (
    <header className={s.header} aria-busy>
      <div className={s.profile}>
        <Skeleton w="var(--avatar)" h="var(--avatar)" r="50%" />
        <span className={s.text}>
          <Skeleton w={88} h={13} />
          <Skeleton w={112} h={11} />
        </span>
      </div>
      <Skeleton w={136} h={36} r="var(--r-chip)" />
    </header>
  )
}
