import { num } from '../data/format'
import { Skeleton } from './Skeleton'
import s from './LeagueRow.module.css'

type Props = {
  place: number
  nick: string
  power: number
  me?: boolean
  /** игрок в зоне вылета */
  threat?: boolean
}

export function LeagueRow({ place, nick, power, me, threat }: Props) {
  return (
    <div className={`${s.row} ${me ? s.me : ''} ${me && threat ? s.threat : ''}`} aria-current={me || undefined}>
      <span className={s.place}>{place}</span>
      <span className={s.nick}>{me ? 'Ты' : nick}</span>
      <span className={s.power}>{num(power)}</span>
    </div>
  )
}

/** Граница зоны: повышение — тиффани, вылет — оранжевый */
export function LeagueLine({ kind }: { kind: 'promote' | 'demote' }) {
  return (
    <div className={`${s.line} ${s[kind]}`}>
      <span className={s.rule} />
      {kind === 'promote' ? 'выше линии — повышение' : 'ниже линии — вылет'}
    </div>
  )
}

export function LeagueRowSkeleton() {
  return (
    <div className={s.row} aria-busy>
      <span className={s.place}>
        <Skeleton w={12} h={13} />
      </span>
      <span className={s.nick}>
        <Skeleton w={96} h={13} />
      </span>
      <Skeleton w={40} h={13} />
    </div>
  )
}
