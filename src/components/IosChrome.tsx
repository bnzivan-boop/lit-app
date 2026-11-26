import { useEffect, useState } from 'react'
import { isNewYear, toggleNewYear } from '../lib/theme'
import s from './IosChrome.module.css'

/* Верх iPhone и кнопки Telegram для показа. На localhost видны всегда,
   внутри настоящего Telegram и на реальном телефоне их рисует система. ?ios=0 — убрать, ?ios=1 — показать. */

export const inTelegram = () =>
  Boolean((window as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData)

export function chromeWanted() {
  const q = new URLSearchParams(location.search).get('ios')
  if (q) return q === '1'
  if (inTelegram()) return false
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
  return local || window.top !== window.self || matchMedia('(hover: hover) and (pointer: fine)').matches
}

const time = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

export function IosChrome() {
  const [on] = useState(chromeWanted)
  useEffect(() => {
    if (!on) return
    const root = document.documentElement.style
    root.setProperty('--tg-safe-area-inset-top', '54px')
    root.setProperty('--tg-content-safe-area-inset-top', '42px')
    root.setProperty('--tg-safe-area-inset-bottom', '34px')
    return () => {
      for (const p of ['--tg-safe-area-inset-top', '--tg-content-safe-area-inset-top', '--tg-safe-area-inset-bottom'])
        root.removeProperty(p)
    }
  }, [on])
  return on ? <IosChromeView /> : null
}

/** inline — внутри рамки витрины, а не поверх окна */
export function IosChromeView({ inline }: { inline?: boolean }) {
  const [now, setNow] = useState(time)
  useEffect(() => {
    const t = setInterval(() => setNow(time()), 5000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className={`${s.chrome} ${inline ? s.inline : ''}`}>
      <div className={s.status} aria-hidden>
        <span className={s.time}>{now}</span>
        <span className={s.island} />
        <span className={s.icons}>
          <svg width="18" height="12" viewBox="0 0 18 12">
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.500" width="3" height="6.500" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.900" strokeLinecap="round">
            <path d="M1.300 4.200a10.300 10.300 0 0 1 14.400 0M3.900 6.900a6.600 6.600 0 0 1 9.200 0M6.500 9.500a2.900 2.900 0 0 1 4 0" />
          </svg>
          <svg width="27" height="13" viewBox="0 0 27 13">
            <rect x=".5" y=".5" width="23" height="12" rx="4" fill="none" stroke="currentColor" opacity=".4" />
            <rect x="2" y="2" width="20" height="9" rx="2.600" />
            <path d="M25 4.500v4c.9-.3 1.500-1.100 1.500-2s-.6-1.700-1.500-2z" opacity=".5" />
          </svg>
        </span>
      </div>
      <div className={s.telegram}>
        <span aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round">
            <path d="m1.500 1.500 9 9M10.500 1.500l-9 9" />
          </svg>
          Закрыть
        </span>
        {!inline && (
          <button type="button" className={`press ${s.ny}`} data-on={isNewYear() || undefined} aria-pressed={isNewYear()} onClick={toggleNewYear}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2" />
            </svg>
            Новый год
          </button>
        )}
        <span className={s.more} aria-hidden>
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none" stroke="currentColor" strokeWidth="1.900" strokeLinecap="round" strokeLinejoin="round">
            <path d="m1.500 1.800 5.500 5.400 5.500-5.400" />
          </svg>
          <svg width="18" height="4" viewBox="0 0 18 4">
            <circle cx="2" cy="2" r="2" />
            <circle cx="9" cy="2" r="2" />
            <circle cx="16" cy="2" r="2" />
          </svg>
        </span>
      </div>
      {!inline && <span className={s.home} />}
    </div>
  )
}
