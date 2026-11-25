import { useRef, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { haptic, reduced } from '../lib/motion'
import { enter } from './access'
import s from './Gate.module.css'

/** Экран входа: один код на всех, вводится один раз на устройстве */
export function Gate({ onOpen }: { onOpen: () => void }) {
  const field = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!code.trim() || busy) return
    setBusy(true)
    const ok = await enter(code)
    if (ok) {
      haptic('done')
      return onOpen()
    }
    setBusy(false)
    setError(true)
    haptic('land')
    field.current?.focus()
    if (!reduced())
      field.current?.animate([{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-4px)' }, { transform: 'none' }], { duration: 340 })
  }

  return (
    <main className={s.screen}>
      <span className={s.flame} aria-hidden />
      <img className={s.logo} src="/assets/brand/play-lit.svg" alt="PLAY LIT" width={148} height={127} />
      <form className={s.form} onSubmit={submit} noValidate>
        <h1>Введи код</h1>
        <p>Это закрытый показ. Код тебе прислали вместе со ссылкой.</p>
        <input
          ref={field}
          aria-label="Код"
          placeholder="Код"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          value={code}
          aria-invalid={error}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
        />
        <b role={error ? 'alert' : undefined}>{error ? 'Код не подошёл. Проверь раскладку и регистр.' : ''}</b>
        <Button type="submit" loading={busy} disabled={!code.trim()}>
          Войти
        </Button>
      </form>
    </main>
  )
}
