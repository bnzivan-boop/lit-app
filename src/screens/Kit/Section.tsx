import type { ReactNode } from 'react'
import s from './Kit.module.css'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={s.section}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}
