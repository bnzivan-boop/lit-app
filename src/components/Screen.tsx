import type { ReactNode } from 'react'
import { Icon } from './Icon'
import s from './Screen.module.css'

type Props = { title: string; onBack: () => void; children: ReactNode; footer?: ReactNode }

/** Экран заказа: назад, крупный заголовок, содержимое и закреплённое действие */
export function Screen({ title, onBack, children, footer }: Props) {
  return (
    <main className={s.screen}>
      <header className={s.head}>
        <button type="button" className={`press ${s.back}`} aria-label="Назад" onClick={onBack}>
          <Icon name="chevron" size={24} />
        </button>
        <h1 data-long={title.split(' ').some((w) => w.length > 14) || undefined}>{title}</h1>
      </header>
      {children}
      {footer && <footer className={s.foot}>{footer}</footer>}
    </main>
  )
}
