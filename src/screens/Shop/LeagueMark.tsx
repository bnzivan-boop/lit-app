import type { CSSProperties } from 'react'
import { Icon } from '../../components/Icon'
import type { League } from '../../data/types'
import s from './LeagueMark.module.css'

const METAL: Record<League, [string, string]> = {
  bronze: ['#e3a37e', '#7c4527'],
  silver: ['#eef4f6', '#7b8a90'],
  gold: ['#ffd66b', '#b9740c'],
  platinum: ['#b9f2ff', '#3f8ea6'],
  diamond: ['#c6a4ff', '#6a3fd8'],
}

/** Медаль лиги: фирменный огонь в металле */
export function LeagueMark({ league, locked, size = 46 }: { league: League; locked?: boolean; size?: number }) {
  const [light, deep] = METAL[league]
  return (
    <span className={s.mark} data-locked={locked || undefined} style={{ '--l': light, '--d': deep, '--s': `${size}px` } as CSSProperties} aria-hidden>
      <i />
      {locked && (
        <b>
          <Icon name="lock" size={13} />
        </b>
      )}
    </span>
  )
}
