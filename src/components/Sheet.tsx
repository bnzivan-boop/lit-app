import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { lockScroll } from '../lib/scrollLock'
import s from './Sheet.module.css'

type Props = { label: string; onClose: () => void; children: ReactNode }

/* Пружина шторки iOS: без перелёта при открытии, скорость пальца передаётся при отпускании */
const SPRING = { type: 'spring', bounce: 0, duration: 0.38 } as const
const project = (v: number) => (v / 1000) * (0.998 / (1 - 0.998)) * 0.12

/** Шторка снизу. Тянется за ручку и шапку, закрывается смахиванием, тапом по фону и Esc */
export function Sheet({ label, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const y = useMotionValue(reduce ? 0 : 1200)
  const opacity = useTransform(y, (v) => 1 - Math.min(1, Math.max(0, v / (panel.current?.offsetHeight ?? 700))))
  const closing = useRef(false)

  const close = (velocity = 0) => {
    if (closing.current) return
    closing.current = true
    if (reduce) return onClose()
    animate(y, (panel.current?.offsetHeight ?? 800) + 40, { ...SPRING, duration: 0.3, velocity }).then(onClose)
  }
  const closeRef = useRef(close)
  closeRef.current = close

  useEffect(() => {
    if (!reduce) {
      y.set(panel.current?.offsetHeight ?? 800)
      animate(y, 0, SPRING)
    }
    const before = document.activeElement as HTMLElement | null
    panel.current?.focus({ preventScroll: true })
    const unlock = lockScroll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    addEventListener('keydown', onKey)
    return () => {
      unlock()
      removeEventListener('keydown', onKey)
      before?.focus({ preventScroll: true })
    }
  }, [reduce, y])

  /* Перетаскивание 1:1 за шапку; вверх — с сопротивлением */
  const drag = useRef({ on: false, start: 0, from: 0, last: 0, time: 0, v: 0 })
  const onPointerDown = (e: React.PointerEvent) => {
    if (drag.current.on) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* указатель уже отпущен */
    }
    y.stop()
    drag.current = { on: true, start: e.clientY, from: y.get(), last: e.clientY, time: e.timeStamp, v: 0 }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.on) return
    const dt = Math.max(1, e.timeStamp - d.time)
    d.v = 0.6 * ((e.clientY - d.last) / dt) * 1000 + 0.4 * d.v
    d.last = e.clientY
    d.time = e.timeStamp
    const raw = d.from + e.clientY - d.start
    y.set(raw < 0 ? (raw * 0.55 * 300) / (300 + 0.55 * -raw) : raw)
  }
  const onPointerUp = () => {
    if (!drag.current.on) return
    drag.current.on = false
    const { v } = drag.current
    const h = panel.current?.offsetHeight ?? 700
    if (y.get() + project(v) > h * 0.4) close(v)
    else animate(y, 0, { ...SPRING, velocity: v })
  }

  return createPortal(
    <div className={s.root}>
      <motion.div className={s.scrim} style={{ opacity }} onClick={() => close()} />
      <motion.div ref={panel} className={s.panel} style={{ y }} role="dialog" aria-modal aria-label={label} tabIndex={-1}>
        <div
          className={s.grip}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className={s.grabber} />
        </div>
        <div className={s.body}>{children}</div>
      </motion.div>
    </div>,
    document.body,
  )
}
