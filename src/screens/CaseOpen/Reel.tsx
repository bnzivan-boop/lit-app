import { useEffect, useRef, useState } from 'react'
import { LootCard } from '../../components/LootCard'
import { LOOT_COLOR } from '../../data/lootColors'
import { rollLoot, type Loot } from '../../data/store'
import { haptic } from '../../lib/motion'
import s from './Reel.module.css'

const CARD = 212
const GAP = 16
const STEP = CARD + GAP
const LENGTH = 40
const STOP = 35
const TIME = 3900

/* Быстрый разгон и очень долгий выкат: последняя секунда идёт на пару карточек */
const EASE = 'cubic-bezier(0.1, 0.66, 0.06, 1)'

/** Рулетка. Карточка у центра разворачивается лицом и растёт. Тап ускоряет */
export function Reel({ loot, onDone }: { loot: Loot; onDone: () => void }) {
  const view = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const light = useRef<HTMLSpanElement>(null)
  const marks = useRef<HTMLDivElement>(null)
  const spin = useRef<Animation | null>(null)
  const done = useRef(onDone)
  const [cards] = useState(() => Array.from({ length: LENGTH }, (_, i) => (i === STOP ? loot : rollLoot())))
  const [jitter] = useState(() => (Math.random() - 0.5) * CARD * 0.66)
  const [landed, setLanded] = useState(false)
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    const mid = view.current!.clientWidth / 2
    const el = strip.current!
    const nodes = [...el.children] as HTMLElement[]
    const at = (index: number, shift = 0) => mid - (index * STEP + CARD / 2 + shift)
    const from = at(1)
    const rest = at(STOP, jitter)
    const a = el.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${rest}px)` }], {
      duration: TIME,
      delay: 160,
      easing: EASE,
      fill: 'both',
    })
    spin.current = a

    let id = 0
    let last = -1
    let changed = 0
    let stopped = false
    const watch = (now: number) => {
      const x = new DOMMatrix(getComputedStyle(el).transform).m41
      const index = Math.floor((mid - x + GAP / 2) / STEP)
      /* объём: чем дальше от центра, тем сильнее карточка отвёрнута */
      for (let i = Math.max(0, index - 2); i <= Math.min(LENGTH - 1, index + 2); i++) {
        const d = Math.max(-1.4, Math.min(1.4, (x + i * STEP + CARD / 2 - mid) / STEP))
        const k = Math.abs(d)
        nodes[i].style.transform = `perspective(900px) rotateY(${-d * 30}deg) scale(${(1.1 - Math.min(1, k) * 0.2).toFixed(3)})`
        nodes[i].style.zIndex = String(10 - Math.round(k * 4))
      }
      if (index !== last) {
        if (last >= 0) {
          for (const m of marks.current?.children ?? [])
            m.animate([{ transform: 'scale(1.35)' }, { transform: 'none' }], { duration: 160, easing: 'ease-out' })
          /* сцена берёт цвет карточки только на медленном ходу: без мельтешения */
          if (now - changed > 340 && light.current) light.current.style.backgroundColor = LOOT_COLOR[cards[index].kind].bg
          if (now - changed > 45) haptic('land')
          changed = now
        }
        last = index
      }
      if (!stopped) id = requestAnimationFrame(watch)
    }
    id = requestAnimationFrame(watch)

    let timer = 0
    let settle: Animation | null = null
    a.onfinish = () => {
      setLanded(true)
      haptic('press')
      if (light.current) light.current.style.backgroundColor = LOOT_COLOR[loot.kind].bg
      /* карточка доезжает до центра, пауза, чтобы осознать выигрыш */
      settle = el.animate([{ transform: `translateX(${rest}px)` }, { transform: `translateX(${at(STOP)}px)` }], {
        duration: 340,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards',
      })
      timer = window.setTimeout(() => {
        stopped = true
        done.current()
      }, 980)
    }
    return () => {
      stopped = true
      a.onfinish = null
      a.cancel()
      settle?.cancel()
      cancelAnimationFrame(id)
      clearTimeout(timer)
    }
  }, [jitter, cards, loot])

  return (
    <div
      ref={view}
      className={`${s.view} ${landed ? s.landed : ''}`}
      onPointerDown={() => spin.current?.updatePlaybackRate(3.5)}
      role="status"
      aria-label="Открываем кейс"
    >
      <span ref={light} className={s.light} aria-hidden />
      <div ref={strip} className={s.strip}>
        {cards.map((c, i) => (
          <div key={i} className={i === STOP ? s.prize : s.card}>
            <LootCard loot={c} size="lg" />
          </div>
        ))}
      </div>
      <div ref={marks} className={s.marks} aria-hidden>
        <i />
        <i />
      </div>
      <span className={s.line} aria-hidden />
      <p className={s.hint}>{landed ? '' : 'Тапни, чтобы ускорить'}</p>
    </div>
  )
}
