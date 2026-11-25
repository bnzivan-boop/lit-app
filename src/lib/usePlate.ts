import { useLayoutEffect, useState, type RefObject } from 'react'

export type Point = [number, number]

/** Многоугольник со скруглёнными углами */
export function rounded(points: Point[], r: number) {
  return (
    points
      .map(([x, y], i) => {
        const [px, py] = points.at(i - 1)!
        const [nx, ny] = points[(i + 1) % points.length]
        const a = Math.hypot(px - x, py - y)
        const b = Math.hypot(nx - x, ny - y)
        const from = `${x + ((px - x) / a) * r} ${y + ((py - y) / a) * r}`
        const to = `${x + ((nx - x) / b) * r} ${y + ((ny - y) / b) * r}`
        return `${i ? 'L' : 'M'}${from}Q${x} ${y} ${to}`
      })
      .join('') + 'Z'
  )
}

/** Наклонная плашка: left и right — насколько опущен верхний край слева и справа */
export function usePlate(ref: RefObject<HTMLElement | null>, left: number, right: number) {
  const [path, setPath] = useState('')
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      const h = el.clientHeight
      setPath(rounded([[0, left], [w, right], [w, h], [0, h]], 26))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, left, right])
  return path ? { clipPath: `path('${path}')` } : undefined
}
