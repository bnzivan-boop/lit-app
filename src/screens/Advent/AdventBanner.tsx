import { useEffect, useState } from 'react'
import { plural } from '../../data/format'
import { useStore } from '../../data/store'
import s from './AdventBanner.module.css'

const DAY = 86_400_000
const MSK = 3 * 3_600_000
const pad = (n: number) => String(n).padStart(2, '0')

/** Время до полуночи по Москве, тикает раз в секунду */
export function useToMidnight(now: number) {
  const [start] = useState(() => Date.now())
  const [tick, setTick] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ms = DAY - ((now + tick - start + MSK) % DAY)
  const sec = Math.floor(ms / 1000)
  return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor((sec % 3600) / 60))}:${pad(sec % 60)}`
}

/** Узкий баннер адвент-календаря на главной: «доступно N подарков · Собрать» или отсчёт до нового */
export function AdventBanner({ onOpen }: { onOpen: () => void }) {
  const { advent, now } = useStore()
  const left = useToMidnight(now)
  const n = advent.available
  return (
    <button type="button" className={`press ${s.banner}`} onClick={onOpen} aria-label={`${advent.title}: ${n ? `доступно ${n}` : `до нового подарка ${left}`}`}>
      <img className={s.gift} src="/assets/advent/gift.webp" alt="" />
      <span className={s.text}>
        <b>{advent.title}</b>
        <span>{n ? `Доступно ${n} ${plural(n, ['подарок', 'подарка', 'подарков'])}` : 'До нового подарка'}</span>
      </span>
      {n ? <span className={s.take}>Собрать</span> : <span className={s.timer}>{left}</span>}
    </button>
  )
}
