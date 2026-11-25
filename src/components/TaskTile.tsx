import type { ReactNode } from 'react'
import { num } from '../data/format'
import type { Reward } from '../data/types'
import { Amount } from './Amount'
import { GameCover } from './GameCover'
import { Icon } from './Icon'
import { Skeleton } from './Skeleton'
import s from './TaskTile.module.css'

type Props = {
  title: string
  /** коротко, что сделать: «Сыграй 1 раз» */
  hint: string
  /** полное название для скринридера */
  label: string
  reward: Reward
  game?: string
  cover?: string
  receipt?: boolean
  boost?: boolean
  progress?: { value: number; goal: number }
  done?: boolean
  /** выполнено, награду можно собрать */
  ready?: boolean
  /** главное действие экрана */
  main?: boolean
  onClick?: () => void
  pressed?: boolean
  disabled?: boolean
}

/** Задание дня: обложка, награда, короткая цель. Нажатие сразу открывает игру или скан */
export function TaskTile(p: Props) {
  const { title, hint, label, reward, progress, done, ready, main, boost } = p
  const steps = progress && progress.goal > 1 && !done && !ready
  return (
    <button
      type="button"
      className={`press ${s.tile} ${main ? s.main : ''} ${done ? s.done : ''} ${ready ? s.ready : ''}`}
      onClick={p.onClick}
      disabled={p.disabled}
      data-pressed={p.pressed || undefined}
      aria-label={`${label}${done ? ', выполнено' : ready ? ', собрать награду' : ''}`}
    >
      <span className={s.art}>
        <GameCover game={p.game} cover={p.cover} receipt={p.receipt} title="" />
        {boost && !done && !ready && <span className={s.boost}>×2</span>}
        <span className={s.reward}>
          {reward.soft && <Amount value={reward.soft} kind="soft" plus />}
          {reward.hard && <Amount value={reward.hard} kind="hard" plus />}
        </span>
        {(main || done) && !ready && (
          <span className={s.badge}>
            <Icon name={done ? 'check' : p.receipt ? 'scan' : 'play'} size={20} />
          </span>
        )}
      </span>
      {steps && (
        <span className={s.bar}>
          <span style={{ transform: `scaleX(${Math.min(1, progress.value / progress.goal)})` }} />
        </span>
      )}
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        <span className={s.hint}>{ready ? 'Собрать' : steps ? `${num(progress.value)} / ${num(progress.goal)}` : done ? 'Готово' : hint}</span>
      </span>
    </button>
  )
}

export const TaskTrio = ({ children }: { children: ReactNode }) => <div className={s.trio}>{children}</div>

export function TaskTileSkeleton() {
  return (
    <div className={s.tile} aria-busy>
      <Skeleton h={122} r={0} />
      <span className={s.text}>
        <Skeleton w="90%" h={14} />
        <Skeleton w="60%" h={11} />
      </span>
    </div>
  )
}
