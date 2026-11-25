import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'

/* prev — состояние экрана, с которого ушли: цепочка возвратов не теряется */
type State = { from?: string; prev?: State; restore?: boolean } | null

/** Открыть экран поверх раздела: он запомнит, куда вернуться */
export function useOpen(from?: string) {
  const go = useNavigate()
  const { pathname, state } = useLocation()
  return (to: string) => go(to, { state: { from: from ?? pathname, prev: state as State } })
}

/** Откуда открыт экран */
export const useFrom = () => (useLocation().state as State)?.from

/** Вернуться туда, откуда открыли. Без истории — в свой раздел */
export function useOrigin(fallback = '/') {
  const go = useNavigate()
  const state = useLocation().state as State
  return () => go(state?.from ?? fallback, { replace: true, state: { ...state?.prev, restore: true } })
}

/** Новый экран открывается сверху, возврат — на том же месте прокрутки */
export function useScroll() {
  const { pathname, state } = useLocation()
  const seen = useRef(new Map<string, number>())
  const path = useRef(pathname)
  const restore = (state as State)?.restore
  useLayoutEffect(() => {
    path.current = pathname
    scrollTo(0, restore ? (seen.current.get(pathname) ?? 0) : 0)
  }, [pathname, restore])
  useLayoutEffect(() => {
    const save = () => void seen.current.set(path.current, scrollY)
    addEventListener('scroll', save, { passive: true })
    return () => removeEventListener('scroll', save)
  }, [])
}
