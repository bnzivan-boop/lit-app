import { num } from '../data/format'
import type { Reward } from '../data/types'
import { Amount } from './Amount'
import s from './Rewards.module.css'

/** Награда чипами: хард, софт, XP */
export function Rewards({ reward, size = 'sm' }: { reward: Reward; size?: 'sm' | 'lg' }) {
  return (
    <span className={`${s.row} ${s[size]}`}>
      {reward.hard && (
        <span className={s.chip}>
          <Amount value={reward.hard} kind="hard" plus coin={size === 'lg' ? 20 : 18} />
        </span>
      )}
      {reward.soft && (
        <span className={s.chip}>
          <Amount value={reward.soft} kind="soft" plus coin={size === 'lg' ? 20 : 18} />
        </span>
      )}
      {reward.xp && <span className={s.chip}>+{num(reward.xp)} XP</span>}
    </span>
  )
}
