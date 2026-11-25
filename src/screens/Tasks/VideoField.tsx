import { useId, useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { linkError, networkOf, NETWORKS } from '../../data/video'
import { haptic } from '../../lib/motion'
import s from './VideoField.module.css'

type Props = { open: boolean; initial?: string; onOpen: () => void; onSubmit: (link: string) => void }

/** Поле под ссылку на ролик. Закрыто — кнопка, открыто — выпадает над ней */
export function VideoField({ open, initial = '', onOpen, onSubmit }: Props) {
  const id = useId()
  const [link, setLink] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const network = networkOf(link)

  function change(v: string) {
    setLink(v)
    setError(null)
  }

  /* буфер бывает закрыт (Telegram, http): тогда просто ставим курсор в поле */
  async function paste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) return change(text.trim())
    } catch {
      /* ниже */
    }
    document.getElementById(id)?.focus()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!open) return onOpen()
    const problem = linkError(link)
    if (problem) {
      setError(problem)
      haptic('land')
      return document.getElementById(id)?.focus()
    }
    haptic('done')
    onSubmit(link.trim())
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <div className={s.drop} data-open={open || undefined} inert={!open}>
        <div className={s.inner}>
          <label className={s.label} htmlFor={id}>
            Ссылка на ролик
          </label>
          <div className={s.field} data-error={error ? '' : undefined}>
            <Icon name="link" size={20} />
            <input
              id={id}
              type="url"
              inputMode="url"
              enterKeyHint="send"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="vk.com/clip…"
              value={link}
              onChange={(e) => change(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-hint`}
            />
            {link ? (
              <button type="button" className={`press ${s.clear}`} onClick={() => change('')} aria-label="Очистить">
                <Icon name="close" size={18} />
              </button>
            ) : (
              <button type="button" className={`press ${s.paste}`} onClick={paste}>
                Вставить
              </button>
            )}
          </div>
          <div id={`${id}-hint`} className={s.hint} role={error ? 'alert' : undefined}>
            {error ? (
              <span className={s.error}>{error}</span>
            ) : (
              NETWORKS.map((n) => (
                <span key={n.title} className={s.net} data-on={n.title === network || undefined}>
                  {n.title === network && <Icon name="check" size={14} />}
                  {n.title}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
      <Button type="submit" disabled={open && !link.trim()}>
        {open ? 'Отправить на проверку' : 'Прикрепить видео'}
      </Button>
    </form>
  )
}
