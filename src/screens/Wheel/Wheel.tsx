import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Amount } from '../../components/Amount'
import { Icon } from '../../components/Icon'
import { duration } from '../../data/format'
import { rollWheel, useStore, WHEEL, type WheelPrize } from '../../data/store'
import type { Currency } from '../../data/types'
import { haptic, reduced } from '../../lib/motion'
import { sparks } from '../../lib/sparks'
import { Backdrop } from './Backdrop'
import { Disc } from './Disc'
import { mod, SECTORS, under } from './geometry'
import { Rim } from './Rim'
import { WheelWin } from './WheelWin'
import s from './Wheel.module.css'

const TIME = 5200
/* быстрый старт и длинный выкат: последний сектор переваливается еле-еле */
const EASE = 'cubic-bezier(0.14, 0.72, 0.08, 1)'

/* встречаем сундуком софта под указателем */
const START = Math.max(0, WHEEL.findIndex((p) => p.kind === 'soft' && p.tier === 5))

const START_STYLE = { transform: `rotate(${-SECTORS[START].center}deg)` }

const art = (p: WheelPrize) => `/assets/wheel/${p.kind}-${p.tier}.webp`

type Phase = 'ready' | 'spin' | 'landed' | 'win'

/** Колесо фортуны: раз в день, сразу после лоадера. Крутится пальцем или кнопкой.
    ?win=h1000 — задать приз для показа */
export function Wheel({ onLeave }: { onLeave: () => void }) {
  const go = useNavigate()
  const [params] = useSearchParams()
  const { wheel, balance, spinWheel } = useStore()
  const [phase, setPhase] = useState<Phase>('ready')
  const [index, setIndex] = useState(START)
  /* горящий сектор; на скорости не горит ничего */
  const [lit, setLit] = useState(START)
  /* цвет сцены */
  const [tone, setTone] = useState<Currency>(WHEEL[START].kind)
  const [prize, setPrize] = useState<WheelPrize | null>(null)
  /* сколько выигрыша ещё не показано в балансе */
  const [held, setHeld] = useState(0)
  const root = useRef<HTMLElement>(null)
  const disc = useRef<HTMLDivElement>(null)
  const pointer = useRef<HTMLSpanElement>(null)
  const rot = useRef(-SECTORS[START].center)
  const last = useRef({ index: START, swap: 0, buzz: 0, step: 0 })
  const anim = useRef<Animation | null>(null)
  const timer = useRef(0)
  const frame = useRef(0)
  const locked = wheel.spun && phase === 'ready'

  useEffect(
    () => () => {
      anim.current?.cancel()
      clearTimeout(timer.current)
      cancelAnimationFrame(frame.current)
    },
    [],
  )

  function leave() {
    onLeave()
    go('/', { replace: true })
  }

  /* Следим за сектором под указателем: щелчок, приз над колесом, свет сцены */
  function track(now: number, calm = false) {
    const i = under(rot.current)
    const l = last.current
    if (i === l.index) return
    l.index = i
    pointer.current?.animate([{ transform: 'rotate(-20deg)' }, { transform: 'none' }], { duration: 170, easing: 'ease-out' })
    if (now - l.buzz > 45) {
      l.buzz = now
      haptic('land')
    }
    setLit(calm || now - l.step > 120 ? i : -1)
    l.step = now
    /* на скорости картинка меняется не чаще, чем успевает глаз */
    if (calm || now - l.swap > 130) {
      setIndex(i)
      /* фон — только на медленном ходу: без мигания на весь экран */
      if (calm || now - l.swap > 420) setTone(WHEEL[i].kind)
      l.swap = now
    }
  }

  const place = (deg: number) => {
    rot.current = deg
    if (disc.current) disc.current.style.transform = `rotate(${deg}deg)`
  }

  /* Ведём диск анимацией и знаем угол на каждом кадре */
  function roll(to: number, ms: number, easing: string, done: () => void) {
    const from = rot.current
    const el = disc.current!
    anim.current?.cancel()
    cancelAnimationFrame(frame.current)
    const a = el.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }], { duration: ms, easing, fill: 'forwards' })
    anim.current = a
    const step = (now: number) => {
      const k = a.effect?.getComputedTiming().progress ?? 1
      rot.current = from + (to - from) * k
      track(now)
      if (a.playState === 'running') frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    a.onfinish = () => {
      cancelAnimationFrame(frame.current)
      place(to)
      a.cancel()
      done()
    }
  }

  function spin(dir = 1) {
    if (phase !== 'ready' || wheel.spun) return
    const won = WHEEL.find((p) => p.id === params.get('win')) ?? rollWheel()
    const target = WHEEL.indexOf(won)
    setPrize(won)
    setHeld(won.amount)
    spinWheel(won)
    haptic('press')
    if (reduced()) {
      place(-SECTORS[target].center)
      setIndex(target)
      setPhase('win')
      return
    }
    setPhase('spin')
    const shift = (Math.random() - 0.5) * SECTORS[target].size * 0.62
    const rest = -SECTORS[target].center
    const turns = 360 * 4
    const base = rot.current + dir * turns
    /* ближайший угол с нужным сектором дальше по ходу вращения */
    const to = dir > 0 ? base + mod(rest + shift - base, 360) : base - mod(base - rest - shift, 360)
    roll(to, TIME, EASE, () => {
      setPhase('landed')
      setIndex(target)
      setLit(target)
      setTone(won.kind)
      if (root.current && disc.current) sparks(root.current, disc.current, 10 + won.tier * 5)
      haptic('done')
      roll(to - shift, 420, 'cubic-bezier(0.2, 0.8, 0.2, 1)', () => {
        timer.current = window.setTimeout(() => setPhase('win'), 620)
      })
    })
  }

  /* Палец ведёт колесо 1:1, рывок запускает вращение в ту же сторону */
  const drag = useRef({ on: false, moved: 0, angle: 0, time: 0, v: 0 })
  const angleOf = (e: React.PointerEvent) => {
    const b = e.currentTarget.getBoundingClientRect()
    return (Math.atan2(e.clientY - b.top - b.height / 2, e.clientX - b.left - b.width / 2) * 180) / Math.PI
  }
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase === 'spin') return anim.current?.updatePlaybackRate(3)
    if (phase !== 'ready' || wheel.spun) return
    anim.current?.cancel()
    cancelAnimationFrame(frame.current)
    place(rot.current)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* указатель уже отпущен */
    }
    drag.current = { on: true, moved: 0, angle: angleOf(e), time: e.timeStamp, v: 0 }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.on) return
    const a = angleOf(e)
    const delta = mod(a - d.angle + 180, 360) - 180
    const dt = Math.max(1, e.timeStamp - d.time)
    d.v = 0.7 * ((delta / dt) * 1000) + 0.3 * d.v
    d.angle = a
    d.time = e.timeStamp
    d.moved += Math.abs(delta)
    place(rot.current + delta)
    track(e.timeStamp, true)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.on) return
    d.on = false
    const v = e.timeStamp - d.time > 90 ? 0 : d.v
    if (Math.abs(v) > 140) return spin(Math.sign(v))
    /* слабое движение: колесо встаёт на ближайший сектор */
    if (d.moved > 0.5) roll(rot.current + nearest(), 360, 'cubic-bezier(0.2, 0.8, 0.2, 1)', () => {})
  }

  /* сколько довернуть до центра сектора под указателем */
  function nearest() {
    const c = -SECTORS[under(rot.current)].center
    return mod(c - rot.current + 180, 360) - 180
  }

  const shown = WHEEL[index]

  if (phase === 'win' && prize)
    return (
      <WheelWin
        prize={prize}
        image={art(prize)}
        balance={balance}
        held={held}
        onHeld={setHeld}
        onClose={leave}
      />
    )

  return (
    <main ref={root} className={s.screen} data-phase={phase} data-locked={locked || undefined}>
      <Backdrop tone={tone} />
      <header className={s.top}>
        <button type="button" className={`press ${s.close}`} aria-label="Не сейчас" onClick={leave} disabled={phase !== 'ready'}>
          <Icon name="close" size={22} />
        </button>
        <span className={s.balance}>
          <Amount value={balance.soft - (prize?.kind === 'soft' ? held : 0)} kind="soft" coin={18} />
          <Amount value={balance.hard - (prize?.kind === 'hard' ? held : 0)} kind="hard" coin={18} />
        </span>
      </header>

      <div className={s.name}>
        <h1>Колесо фортуны</h1>
        <p>{locked ? `Следующее вращение через ${duration(wheel.minutesToNext)}` : 'Одно бесплатное вращение в день'}</p>
      </div>

      <div className={s.stage}>
        <div
          className={s.wheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="img"
          aria-label={`Под указателем ${shown.amount} ${shown.kind === 'soft' ? 'софт' : 'хард'}`}
        >
          <Rim mode={locked ? 'off' : phase === 'spin' ? 'spin' : phase === 'landed' ? 'win' : 'idle'} />
          <span className={`${s.light} ${tone === 'hard' ? s.gold : ''}`} aria-hidden />
          <div ref={disc} className={s.disc} style={START_STYLE}>
            <Disc lit={lit} landed={phase === 'landed'} />
          </div>
          <div className={s.art} aria-hidden>
            {WHEEL.map((p, i) => (
              <img key={p.id} src={art(p)} alt="" className={i === index ? s.on : ''} />
            ))}
          </div>
          <span ref={pointer} className={s.pointer} aria-hidden />
        </div>
      </div>

      <footer className={s.actions}>
        <button type="button" className={`press ${s.spin}`} onClick={() => spin()} disabled={locked}>
          {locked ? 'Приходи завтра' : 'Крутить'}
        </button>
      </footer>
    </main>
  )
}
