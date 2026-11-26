import { useRef } from 'react'
import { usePanel } from '../../lib/usePanel'
import s from './BoxBar.module.css'

type Props = { taken: boolean; free: number; next: string; onOpen: () => void }

/** Mystery box дня: один в сутки за цель в любой игре */
export function BoxBar({ taken, free, next, onOpen }: Props) {
  const plate = useRef<HTMLSpanElement>(null)
  /* верх идёт вдоль низа новинки, низ почти прямой: как кадр комикса */
  const clip = usePanel(plate, { top: [0, 32], bottom: [0, 10] })
  const ready = free > 0
  return (
    <section className={s.bar} data-tour="g-box" data-state={ready ? 'ready' : taken ? 'taken' : 'open'}>
      <span ref={plate} className={s.plate} style={clip}>
        <i />
      </span>
      <img className={s.box} src="/assets/cases/chest.webp" alt="" />
      <div className={s.text}>
        <b>{ready ? 'Mystery box твой' : taken ? 'Mystery box получен' : 'Mystery box дня'}</b>
        {ready ? (
          <button type="button" className={`press ${s.go}`} onClick={onOpen}>
            Открыть
          </button>
        ) : (
          <span>{taken ? `новый через ${next}` : 'выполни цель в любой игре'}</span>
        )}
      </div>
    </section>
  )
}
