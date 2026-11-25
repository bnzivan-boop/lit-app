import { useCallback, useEffect, useState } from 'react'

type State<T> = { data?: T; error: boolean; loading: boolean }

/** Загрузка с повтором. key меняется — грузим заново, старый ответ отбрасываем */
export function useLoad<T>(load: (() => Promise<T>) | null, key: string) {
  const [state, setState] = useState<State<T>>({ error: false, loading: Boolean(load) })
  const [tries, setTries] = useState(0)
  useEffect(() => {
    if (!load) return
    let alive = true
    setState({ error: false, loading: true })
    load().then(
      (data) => alive && setState({ data, error: false, loading: false }),
      () => alive && setState({ error: true, loading: false }),
    )
    return () => {
      alive = false
    }
    // load пересоздаётся каждый раз, следим за ключом
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tries])
  return { ...state, retry: useCallback(() => setTries((n) => n + 1), []) }
}
