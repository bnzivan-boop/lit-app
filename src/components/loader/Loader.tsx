import { useEffect, useRef } from 'react'
import { haptic, reduced } from '../../lib/motion'
import { FLAME, FLAME_OUTLINE, FOCUS, LETTERS, SLAB_BOTTOM, SLAB_TOP, VIEW } from './mark'
import { preload } from './preload'
import s from './Loader.module.css'

type Props = {
  /** пора рисовать приложение: сейчас в огне откроется окно */
  onReveal: () => void
  /** пролёт закончен, лоадер можно убрать */
  onDone: () => void
}

const OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const HIT = 'cubic-bezier(0.7, 0, 0.95, 0.5)'
const BACK = 'cubic-bezier(0.3, 1.7, 0.5, 1)'
/* рамка вокруг огонька внутри знака */
const FLAME_BOX = '79.5 62 33 47.5'
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Удар плит, буквы, огонь, пролёт сквозь огонь в приложение */
export function Loader({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const back = useRef<HTMLDivElement>(null)
  const fill = useRef<SVGSVGElement>(null)
  const calls = useRef({ onReveal, onDone })
  useEffect(() => {
    calls.current = { onReveal, onDone }
  })

  useEffect(() => {
    let alive = true
    let frame = 0
    const el = svg.current!
    const part = (name: string) => [...el.querySelectorAll<SVGElement>(`[data-part="${name}"]`)]
    let progress = 0

    /* большой огонёк наполняется вслед за настоящей загрузкой, край волнуется */
    let level = 0
    let last = performance.now()
    const grow = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      /* не быстрее 0,8 экрана в секунду: наполнение видно и при мгновенной загрузке */
      level += Math.min((progress * 1.06 - level) * 4 * dt, 0.8 * dt)
      const box = fill.current
      /* лоадер уже снят, а кадр ещё пришёл */
      if (!box) return
      const w = box.clientWidth
      const h = box.clientHeight
      let d = ''
      for (let i = 0; i <= 20; i++) {
        const x = (w * i) / 20
        const y = h * (1 - level) + Math.sin(x * 0.022 + now * 0.005) * 12 + Math.sin(x * 0.011 - now * 0.003) * 8
        d += `${i ? 'L' : 'M'}${x} ${y}`
      }
      box.style.clipPath = `path('${d}L${w} ${h + 40}L0 ${h + 40}Z')`
      frame = requestAnimationFrame(grow)
    }

    async function run() {
      const loaded = preload((p) => (progress = p))

      if (reduced()) {
        await loaded
        if (!alive) return
        calls.current.onReveal()
        await root.current!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }).finished
        if (alive) calls.current.onDone()
        return
      }

      frame = requestAnimationFrame(grow)
      const [top] = part('top')
      const [bottom] = part('bottom')
      const letters = part('letter')
      const [flame] = part('flame')

      /* 1. Две плиты влетают по своему наклону и сталкиваются */
      await wait(120)
      if (!alive) return
      const fly = (node: SVGElement, from: string) =>
        node.animate([{ transform: from }, { transform: 'none' }], { duration: 280, easing: HIT, fill: 'both' }).finished
      for (const n of [top, bottom]) n.style.opacity = '1'
      await Promise.all([fly(top, 'translate(-190px, 26.7px)'), fly(bottom, 'translate(190px, -26.7px)')])
      if (!alive) return
      haptic('press')
      shake(stage.current!, 1)
      punch(back.current!, 1.1)
      burst(root.current!, el, [73, 66], 16)

      /* 2. Буквы выбиваются снизу, одна за другой */
      await wait(130)
      if (!alive) return
      letters.forEach((n, i) => {
        n.animate(
          [
            { transform: 'translateY(62px) scaleY(1.5)', opacity: 1 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 360, delay: i * 62, easing: BACK, fill: 'both' },
        )
        setTimeout(() => {
          if (!alive) return
          if (i % 2 === 0) haptic('land')
        }, i * 62 + 60)
      })
      await wait(LETTERS.length * 62 + 130)
      if (!alive) return

      /* 3. Огонь вспыхивает и дальше живёт, пока всё не загрузится */
      haptic('press')
      flame.style.opacity = '1'
      flame.animate(
        [
          { transform: 'scale(0.5, 0.1)' },
          { transform: 'scale(1.3, 1.75) skewX(-7deg)', offset: 0.38 },
          { transform: 'scale(0.95, 0.92) skewX(3deg)', offset: 0.7 },
          { transform: 'none' },
        ],
        { duration: 520, easing: OUT },
      )
      shake(stage.current!, 0.5)
      punch(back.current!, 1.16)
      burst(root.current!, el, [95, 80], 12)
      await wait(520)
      if (!alive) return
      flame.animate(
        [
          { transform: 'none' },
          { transform: 'scale(0.97, 1.07) skewX(-3deg)' },
          { transform: 'scale(1.03, 0.96) skewX(2deg)' },
          { transform: 'scale(0.98, 1.04) skewX(-1deg)' },
          { transform: 'none' },
        ],
        { duration: 620, iterations: Infinity, easing: 'ease-in-out' },
      )
      await Promise.all([loaded, wait(140)])
      if (!alive) return

      /* 4. Замах и пролёт сквозь огонь */
      calls.current.onReveal()
      flame.getAnimations().forEach((a) => a.cancel())
      await stage.current!.animate([{ transform: 'none' }, { transform: 'scale(0.86)' }], {
        duration: 240,
        easing: OUT,
      }).finished
      if (!alive) return
      /* дальше огонь — это окно, белая заливка не нужна */
      flame.style.opacity = '0'
      haptic('press')
      await zoom(root.current!, stage.current!, back.current!, el, () => alive)
      if (!alive) return
      haptic('done')
      calls.current.onDone()
    }
    void run()
    return () => {
      alive = false
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={root} className={s.root} role="status" aria-label="Загрузка">
      <div ref={back} className={s.back} aria-hidden>
        <svg viewBox={FLAME_BOX}>
          <path d={FLAME} />
        </svg>
        <svg ref={fill} className={s.fill} viewBox={FLAME_BOX}>
          <path d={FLAME} />
        </svg>
      </div>
      <div ref={stage} className={s.stage}>
        <svg ref={svg} className={s.mark} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden>
          <clipPath id="lit-top">
            <path d={SLAB_TOP} />
          </clipPath>
          <clipPath id="lit-bottom">
            <path d={SLAB_BOTTOM} />
          </clipPath>
          <path data-part="top" className={s.slab} d={SLAB_TOP} />
          <path data-part="bottom" className={s.slab} d={SLAB_BOTTOM} />
          {[LETTERS.slice(0, 4), LETTERS.slice(4)].map((row, r) => (
            <g key={r} clipPath={r ? 'url(#lit-bottom)' : 'url(#lit-top)'}>
              {row.map((d) => (
                <path key={d.slice(0, 12)} data-part="letter" className={s.letter} d={d} />
              ))}
            </g>
          ))}
          <path data-part="flame" className={s.flame} d={FLAME} />
        </svg>
      </div>
    </div>
  )
}

function shake(node: HTMLElement, power: number) {
  const k = (x: number, y: number, r: number) => ({ transform: `translate(${x * power}px,${y * power}px) rotate(${r * power}deg)` })
  node.animate([k(0, 0, 0), k(-9, 6, -1.6), k(8, -5, 1.3), k(-5, 3, -0.8), k(3, -2, 0.4), k(0, 0, 0)], {
    duration: 260,
    easing: 'linear',
  })
}

function punch(node: HTMLElement, to: number) {
  node.animate([{ transform: 'none' }, { transform: `scale(${to})`, offset: 0.22 }, { transform: 'none' }], {
    duration: 520,
    easing: OUT,
  })
}

/** Осколки плит: чёрные, в наклоне знака */
function burst(root: HTMLElement, svg: SVGSVGElement, at: [number, number], count: number) {
  const box = svg.getBoundingClientRect()
  const base = root.getBoundingClientRect()
  const x = box.left - base.left + (at[0] / VIEW.w) * box.width
  const y = box.top - base.top + (at[1] / VIEW.h) * box.height
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.4
    const far = 130 + (i % 4) * 46
    const size = 6 + (i % 3) * 6
    const shard = document.createElement('i')
    shard.className = s.shard
    shard.style.cssText = `left:${x}px;top:${y}px;width:${size * 1.7}px;height:${size}px`
    root.append(shard)
    shard
      .animate(
        [
          { transform: `translate(-50%,-50%) translate(${Math.cos(a) * 60}px,${Math.sin(a) * 44}px) rotate(-8deg) skewX(-14deg)`, opacity: 1 },
          { transform: `translate(-50%,-50%) translate(${Math.cos(a) * far}px,${Math.sin(a) * far}px) rotate(${i % 2 ? 80 : -110}deg) skewX(-14deg) scale(.2)`, opacity: 1 },
        ],
        { duration: 460 + (i % 3) * 90, easing: OUT, fill: 'forwards' },
      )
      .finished.then(() => shard.remove())
  }
}

/** Огонь становится окном: контур растёт, знак растёт вместе с ним, приложение видно внутри */
function zoom(root: HTMLElement, stage: HTMLElement, back: HTMLElement, svg: SVGSVGElement, alive: () => boolean) {
  const base = root.getBoundingClientRect()
  const box = svg.getBoundingClientRect()
  const unit = box.width / VIEW.w
  const fx = box.left - base.left + FOCUS[0] * unit
  const fy = box.top - base.top + FOCUS[1] * unit
  const cx = base.width / 2
  const cy = base.height / 2
  /* центр масштабирования сцены — точка внутри огня */
  const st = stage.getBoundingClientRect()
  stage.style.transformOrigin = `${fx - (st.left - base.left)}px ${fy - (st.top - base.top)}px`
  const START = 0.86
  const MAX = 64
  const TIME = 720
  return new Promise<void>((done) => {
    const begin = performance.now()
    const step = (now: number) => {
      if (!alive()) return done()
      const t = Math.min(1, Math.max(0, (now - begin) / TIME))
      const e = t * t * (3 - 2 * t)
      const k = START * Math.exp(Math.log(MAX) * e)
      const px = fx + (cx - fx) * e
      const py = fy + (cy - fy) * e
      const turn = 0.16 * Math.sin(e * Math.PI) * -1
      stage.style.transform = `translate(${px - fx}px,${py - fy}px) scale(${k}) rotate(${turn}rad)`
      const cos = Math.cos(turn) * unit * k
      const sin = Math.sin(turn) * unit * k
      /* дальний план летит медленнее: появляется глубина */
      back.style.transform = `scale(${Math.exp(Math.log(5) * e)}) rotate(${-turn}rad)`
      let d = `M0 0H${base.width}V${base.height}H0Z`
      FLAME_OUTLINE.forEach(([x, y], i) => {
        const dx = x - FOCUS[0]
        const dy = y - FOCUS[1]
        d += `${i ? 'L' : 'M'}${(px + dx * cos - dy * sin).toFixed(1)} ${(py + dx * sin + dy * cos).toFixed(1)}`
      })
      root.style.clipPath = `path(evenodd, '${d}Z')`
      if (t < 1) requestAnimationFrame(step)
      else done()
    }
    requestAnimationFrame(step)
  })
}
