import { useEffect, useRef, useState } from 'react'
import { num } from '../data/format'
import { tween } from '../lib/motion'
import { usePlate } from '../lib/usePlate'
import { Skeleton } from './Skeleton'
import s from './Stats.module.css'

type Stat = { id: string; title: string; value: number }

/** Статистика: яркая наклонная плашка, первая цифра — герой. Числа набегают, когда блок виден */
export function Stats({ items }: { items: Stat[] }) {
  const plate = useRef<HTMLDListElement>(null)
  const style = usePlate(plate, 30, 0)
  const [k, setK] = useState(0)

  useEffect(() => {
    const el = plate.current
    if (!el) return
    let stop = () => {}
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        stop = tween(900, setK)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      stop()
    }
  }, [])

  return (
    <dl ref={plate} className={s.plate} style={style}>
      <span className={s.flame} aria-hidden />
      {items.map((i) => (
        <div key={i.id}>
          <dd aria-label={num(i.value)}>{num(Math.round(i.value * k))}</dd>
          <dt>{i.title}</dt>
        </div>
      ))}
    </dl>
  )
}

export const StatsSkeleton = () => <Skeleton h={212} r={26} />
