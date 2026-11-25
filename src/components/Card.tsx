import type { ReactNode } from 'react'
import { Skeleton } from './Skeleton'
import s from './Card.module.css'

type Props = { title?: string; aside?: ReactNode; /** «1 из 3» справа от заголовка */ count?: string; loading?: boolean; children: ReactNode }

export function Card({ title, aside, count, loading, children }: Props) {
  return (
    <section className={s.card} aria-busy={loading || undefined}>
      {title && (
        <header className={s.head}>
          <h2>{title}</h2>
          {loading ? (
            <Skeleton w={56} h={12} />
          ) : count ? (
            <span className={s.count}>{count}</span>
          ) : (
            aside && <span className={s.aside}>{aside}</span>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
