import { useLayoutEffect, useState, type RefObject } from 'react'
import { rounded, type Point } from './usePlate'

/** Скос края: насколько опущены левый и правый концы линии */
export type Edge = [left: number, right: number]
export type PanelShape = { top?: Edge; bottom?: Edge; side?: 'left' | 'right'; r?: number }

/** ширина косого разреза между соседними панелями */
export const CUT = 20

/** Косой кадр комикса. top и bottom — скосы; side — панель левая или правая в паре */
export function usePanel(ref: RefObject<HTMLElement | null>, { top = [0, 0], bottom = [0, 0], side, r = 20 }: PanelShape) {
  const [path, setPath] = useState('')
  const key = JSON.stringify([top, bottom, side, r])
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      const h = el.clientHeight
      const pts: Point[] = [
        [side === 'right' ? CUT : 0, top[0]],
        [w, top[1]],
        [side === 'left' ? w - CUT : w, h - bottom[1]],
        [0, h - bottom[0]],
      ]
      setPath(rounded(pts, r))
    })
    ro.observe(el)
    return () => ro.disconnect()
    // форма сравнивается строкой
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, key])
  return path ? { clipPath: `path('${path}')` } : undefined
}
