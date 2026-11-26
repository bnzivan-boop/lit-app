import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { num } from '../data/format'
import type { Reward } from '../data/types'
import { flyCoins, haptic, reduced, tween } from '../lib/motion'
import { lockScroll } from '../lib/scrollLock'
import { sparks } from '../lib/sparks'
import { Amount } from './Amount'
import { Button } from './Button'
import { Fire, type FireState } from './Fire'
import { Glow } from './Glow'
import { Rewards } from './Rewards'
import s from './RewardScreen.module.css'

type Side = { soft: number; hard: number; level: number; xp: number; xpNext: number }

type Props = {
  title: string
  reward: Reward
  before: Side
  after: Side
  image?: string
  /** картинка — фото со своим фоном: растворяем края, чтобы огонь горел вокруг */
  photo?: boolean
  action?: string
  onClose: () => void
}

/** Отбивка: награда собрана. Монеты летят в баланс, шкала опыта растёт */
export function RewardScreen({ title, reward, before, after, image, photo, action = 'К заданиям', onClose }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const art = useRef<HTMLImageElement>(null)
  const chips = useRef<HTMLDivElement>(null)
  const pills = useRef<HTMLSpanElement>(null)
  const fire = useRef<FireState>({ power: 0, burst: 0 })
  const [bal, setBal] = useState({ soft: before.soft, hard: before.hard })
  const [k, setK] = useState(0)
  const up = after.level > before.level

  useEffect(() => {
    const still = reduced()
    const unlock = lockScroll()
    haptic('done')
    const stopFire = tween(900, (x) => (fire.current.power = 0.95 * x))
    const stopBurst = tween(800, (x) => (fire.current.burst = 1 - x))
    const clean = sparks(root.current!, art.current!, 26)
    let stopXp = () => {}
    const t = setTimeout(
      () => {
        stopXp = tween(1100, setK)
        if (still) return setBal({ soft: after.soft, hard: after.hard })
        for (const kind of ['soft', 'hard'] as const) {
          const gain = after[kind] - before[kind]
          const coin = pills.current?.querySelector<HTMLElement>(`img[src*="${kind}"]`)
          if (gain <= 0 || !coin || !chips.current || !root.current) continue
          const count = Math.min(10, gain)
          let landed = 0
          flyCoins(
            root.current,
            chips.current.getBoundingClientRect(),
            coin.getBoundingClientRect(),
            count,
            () => {
              landed++
              setBal((b) => ({ ...b, [kind]: before[kind] + Math.round((gain * landed) / count) }))
              coin.animate([{ transform: 'scale(1.4)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' })
              if (landed % 3 === 0) haptic('land')
            },
            kind,
          )
        }
      },
      still ? 0 : 850,
    )
    return () => {
      unlock()
      clearTimeout(t)
      stopFire()
      stopBurst()
      stopXp()
      clean()
    }
    // награда показывается один раз
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const gained = after.xp - before.xp
  const xp = Math.round(before.xp + gained * k)
  const base = up ? after : before

  return createPortal(
    <div ref={root} className={s.screen} role="dialog" aria-modal aria-label={title}>
      <header className={s.top}>
        <span ref={pills} className={s.balance}>
          <Amount value={bal.soft} kind="soft" coin={20} />
          <Amount value={bal.hard} kind="hard" coin={20} />
        </span>
      </header>
      <div className={s.stage}>
        {image ? <Fire state={fire} className={s.fire} /> : <Glow />}
        <img ref={art} className={s.art} src={image ?? '/assets/rewards/emblem.webp'} alt="" data-item={image ? '' : undefined} data-photo={photo || undefined} />
      </div>
      <h1 className={s.title}>Награда твоя</h1>
      <p className={s.name}>{title}</p>
      <div ref={chips} className={s.chips}>
        <Rewards reward={reward} size="lg" />
      </div>
      <div className={s.xp} style={{ visibility: gained > 0 ? 'visible' : 'hidden' }}>
        <span>{up && k > 0.6 ? `Новый уровень ${after.level}` : `${base.level} уровень`}</span>
        <span>
          {num(xp)} / {num(base.xpNext)} XP
        </span>
        <i>
          <b style={{ transform: `scaleX(${Math.min(1, xp / base.xpNext)})` }} />
        </i>
      </div>
      <footer className={s.actions}>
        <Button onClick={onClose}>{action}</Button>
      </footer>
    </div>,
    document.body,
  )
}
