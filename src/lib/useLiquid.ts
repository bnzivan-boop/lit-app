import { useEffect, useRef, type RefObject } from 'react'
import { reduced } from './motion'

/**
 * Живая граница заливки: срезает слой по волне.
 * x — заливка слева направо (шкала опыта), y — снизу вверх (заряд).
 * Уровень мягко догоняет цель, поэтому прерывается в любой момент.
 */
export function useLiquid(ref: RefObject<HTMLElement | null>, part: number, axis: 'x' | 'y', onEdge?: (px: number) => void) {
  const target = useRef(part)
  const edge = useRef(onEdge)
  useEffect(() => {
    target.current = part
    edge.current = onEdge
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const still = reduced()
    let shown = still ? target.current : 0
    let id = 0
    let visible = true
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      shown = still ? target.current : shown + (target.current - shown) * (1 - Math.exp(-dt * 4.5))
      const w = el.clientWidth
      const h = el.clientHeight
      const long = axis === 'x' ? w : h
      const cross = axis === 'x' ? h : w
      const level = shown * long
      /* у пустого и полного края волны нет */
      const room = Math.min(level, long - level)
      const amp = Math.max(0, Math.min(5, room * 0.5))
      const t = still ? 0 : now / 1000
      let d = ''
      for (let i = 0; i <= 16; i++) {
        const c = (cross * i) / 16
        const wave = Math.sin(c * 0.085 + t * 2.4) * amp + Math.sin(c * 0.037 - t * 1.6) * amp * 0.6
        const p = level + wave
        d += `${i ? 'L' : 'M'}${axis === 'x' ? `${p} ${c}` : `${c} ${h - p}`}`
      }
      d += axis === 'x' ? `L-9 ${h}L-9 0Z` : `L${w} ${h + 9}L0 ${h + 9}Z`
      el.style.clipPath = `path('${d}')`
      edge.current?.(level)
      id = visible ? requestAnimationFrame(draw) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = performance.now()
      if (visible && !id) id = requestAnimationFrame(draw)
    })
    /* следим за родителем: сам слой обрезан и может считаться невидимым */
    io.observe(el.parentElement ?? el)
    return () => {
      visible = false
      cancelAnimationFrame(id)
      io.disconnect()
    }
  }, [ref, axis])
}
