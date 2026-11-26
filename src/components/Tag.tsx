import type { ReactNode } from 'react'
import s from './Tag.module.css'

/** Наклейка акции */
export function Tag({ children, tone = 'hot', big, className = '' }: { children: ReactNode; tone?: 'hot' | 'white' | 'dark'; big?: boolean; className?: string }) {
  return (
    <span className={`${s.tag} ${className}`} data-tone={tone} data-big={big || undefined}>
      <span>{children}</span>
    </span>
  )
}
