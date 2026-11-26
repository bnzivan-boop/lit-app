import { useEffect, useRef, type Ref } from 'react'
import { num, plural } from '../data/format'
import type { ReceiptResult } from '../data/store'
import { haptic, reduced } from '../lib/motion'
import { Amount, Coin } from './Amount'
import s from './ReceiptTicket.module.css'

type Props = { receipt: ReceiptResult; totalRef?: Ref<HTMLSpanElement>; onPrinted?: () => void; still?: boolean }

/** Фирменный чек: вылезает из щели толчками, строка за строкой */
export function ReceiptTicket({ receipt, totalRef, onPrinted, still }: Props) {
  const paper = useRef<HTMLDivElement>(null)
  const printed = useRef(onPrinted)
  useEffect(() => {
    printed.current = onPrinted
  })

  useEffect(() => {
    const el = paper.current!
    if (still || reduced()) {
      printed.current?.()
      return
    }
    /* останавливаемся на нижнем краю каждой строки */
    const h = el.offsetHeight
    const stops = [...el.querySelectorAll<HTMLElement>('[data-row]')].map((n) => n.offsetTop + n.offsetHeight + 14)
    const edges = [...stops.slice(0, -1), h]
    const STEP = 210
    const PAUSE = 130
    const total = edges.length * (STEP + PAUSE)
    const frames: Keyframe[] = [{ transform: `translateY(${-h}px)`, offset: 0, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }]
    edges.forEach((edge, i) => {
      const y = `translateY(${edge - h}px)`
      frames.push({ transform: y, offset: (i * (STEP + PAUSE) + STEP) / total, easing: 'linear' })
      frames.push({ transform: y, offset: ((i + 1) * (STEP + PAUSE)) / total, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' })
    })
    const a = el.animate(frames, { duration: total, fill: 'backwards' })
    const ticks = edges.map((_, i) => setTimeout(() => haptic('land'), i * (STEP + PAUSE)))
    a.onfinish = () => {
      haptic('done')
      printed.current?.()
    }
    return () => {
      a.onfinish = null
      a.cancel()
      ticks.forEach(clearTimeout)
    }
  }, [still])

  return (
    <div className={s.printer}>
      <span className={s.slot} aria-hidden />
      <div className={s.window}>
        <div ref={paper} className={s.paper}>
          <header data-row className={s.head}>
            <h1>Чек принят</h1>
            <p>{receipt.shop}</p>
          </header>
          <div data-row className={s.cbHead}>
            <b>Кэшбек за товары LIT</b>
            {receipt.cashback > 1 && <span className={s.cbMult}>×{receipt.cashback}</span>}
          </div>
          {receipt.items.map((i) => (
            <div key={i.title} data-row className={s.row}>
              <span className={s.thumb}>
                <img src={i.image} alt="" className={i.image.includes('can') ? s.can : ''} />
              </span>
              <span className={s.title}>
                {i.title}
                {i.qty > 1 && (
                  <small>
                    {i.qty} × {num(i.hard)}
                  </small>
                )}
              </span>
              <span className={s.sum}>
                <Amount value={i.hard * i.qty} kind="hard" plus coin={20} />
              </span>
            </div>
          ))}
          {receipt.moved > 0 && (
            <div data-row className={`${s.row} ${s.task}`}>
              <span className={s.title}>
                {receipt.moved} {plural(receipt.moved, ['задание продвинулось', 'задания продвинулись', 'заданий продвинулись'])}
                <small className={s.taskNote}>награды — сверху, в «Заданиях»</small>
              </span>
              {receipt.ready > 0 && <span className={s.ready}>{receipt.ready} {plural(receipt.ready, ['готово', 'готовы', 'готовы'])}</span>}
            </div>
          )}
          <div data-row className={s.total}>
            <span ref={totalRef} className={s.big}>
              +{num(receipt.hard)}
              <Coin kind="hard" />
            </span>
            <span className={s.xp}>
              +{num(receipt.xp)} XP
              {receipt.doubled && <small>с бустом ×2</small>}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
