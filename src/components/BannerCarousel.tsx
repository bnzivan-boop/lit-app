import { Children, useEffect, useRef, useState, type ReactNode } from 'react'
import s from './BannerCarousel.module.css'

const STEP_MS = 5000
const IDLE_MS = 8000

/** Лента баннеров: следующий выглядывает справа, листается пальцем и сама раз в 5 секунд */
export function BannerCarousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const count = Children.count(children)

  useEffect(() => {
    const el = track.current
    if (!el || count < 2) return
    const slides = () => Array.from(el.children) as HTMLElement[]
    const index = () => {
      const list = slides()
      const x = el.scrollLeft
      let best = 0
      list.forEach((n, i) => {
        if (Math.abs(n.offsetLeft - list[0].offsetLeft - x) < Math.abs(list[best].offsetLeft - list[0].offsetLeft - x)) best = i
      })
      return best
    }
    const onScroll = () => setActive(index())
    el.addEventListener('scroll', onScroll, { passive: true })

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => el.removeEventListener('scroll', onScroll)

    let idleUntil = 0
    let visible = true
    const hold = () => (idleUntil = Date.now() + IDLE_MS)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.6 })
    io.observe(el)
    el.addEventListener('pointerdown', hold)
    el.addEventListener('touchstart', hold, { passive: true })
    el.addEventListener('wheel', hold, { passive: true })
    const timer = setInterval(() => {
      if (!visible || document.hidden || Date.now() < idleUntil) return
      const list = slides()
      const next = (index() + 1) % list.length
      el.scrollTo({ left: list[next].offsetLeft - list[0].offsetLeft, behavior: 'smooth' })
    }, STEP_MS)

    return () => {
      clearInterval(timer)
      io.disconnect()
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('pointerdown', hold)
      el.removeEventListener('touchstart', hold)
      el.removeEventListener('wheel', hold)
    }
  }, [count])

  return (
    <div className={s.root}>
      <div ref={track} className={s.track}>
        {children}
      </div>
      {count > 1 && (
        <div className={s.dots} aria-hidden>
          {Array.from({ length: count }, (_, i) => (
            <i key={i} data-on={i === active || undefined} />
          ))}
        </div>
      )}
    </div>
  )
}
