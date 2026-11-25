import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { LootCard } from '../../components/LootCard'
import { lootVars } from '../../data/lootColors'
import { rollLoot, type Loot } from '../../data/store'
import { haptic } from '../../lib/motion'
import s from './Slots.module.css'

const GAP = 8
const EASE = 'cubic-bezier(0.1, 0.66, 0.06, 1)'

/* высота ячейки: чем больше колонок, тем мельче */
const CELL: Record<number, number> = { 2: 200, 3: 156, 4: 124, 5: 104, 10: 86 }

/** Слот-машина: колонки крутятся вертикально и останавливаются по очереди. ×10 — два ряда по пять */
export function Slots({ loots, onDone }: { loots: Loot[]; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const spins = useRef<Animation[]>([])
  const done = useRef(onDone)
  const [stopped, setStopped] = useState<boolean[]>(() => loots.map(() => false))
  const [columns] = useState(() =>
    loots.map((loot, i) => {
      const stop = 22 + i * 2
      return { stop, cells: Array.from({ length: stop + 3 }, (_, k) => (k === stop ? loot : rollLoot())) }
    }),
  )
  useEffect(() => {
    done.current = onDone
  })

  const rows = loots.length > 5 ? 2 : 1
  const cell = CELL[loots.length] ?? 92

  useEffect(() => {
    const strips = [...root.current!.querySelectorAll<HTMLElement>('[data-strip]')]
    const step = cell + GAP
    const list = strips.map((el, i) => {
      const { stop } = columns[i]
      const mid = el.parentElement!.clientHeight / 2
      const at = (k: number) => mid - (k * step + cell / 2)
      const a = el.animate([{ transform: `translateY(${at(1)}px)` }, { transform: `translateY(${at(stop)}px)` }], {
        duration: 2300 + i * (loots.length > 5 ? 220 : 380),
        delay: 120,
        easing: EASE,
        fill: 'both',
      })
      a.onfinish = () => {
        haptic('press')
        setStopped((prev) => prev.map((v, k) => v || k === i))
      }
      return a
    })
    spins.current = list
    let timer = 0
    void Promise.all(list.map((a) => a.finished))
      .then(() => {
        timer = window.setTimeout(() => done.current(), 750)
      })
      .catch(() => {})
    return () => {
      clearTimeout(timer)
      list.forEach((a) => {
        a.onfinish = null
        a.cancel()
      })
    }
  }, [columns, cell, loots.length])

  return (
    <div
      ref={root}
      className={s.view}
      style={{ '--cell': `${cell}px`, '--gap': `${GAP}px`, '--cols': loots.length / rows } as CSSProperties}
      onPointerDown={() => spins.current.forEach((a) => a.updatePlaybackRate(3.5))}
      role="status"
      aria-label={`Открываем ${loots.length}`}
    >
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className={`${s.row} ${rows === 2 ? s.low : ''}`}>
          <span className={s.mark} aria-hidden />
          {columns.slice(r * 5, rows === 2 ? r * 5 + 5 : undefined).map((col, k) => {
            const i = r * 5 + k
            return (
              <div key={i} className={`${s.column} ${stopped[i] ? s.stopped : ''}`} style={lootVars(loots[i].kind)}>
                <div data-strip className={s.strip}>
                  {col.cells.map((c, n) => (
                    <div key={n} className={n === col.stop ? s.prize : s.cell}>
                      <LootCard loot={c} size="slot" />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <p className={s.hint}>{stopped.every(Boolean) ? '' : 'Тапни, чтобы ускорить'}</p>
    </div>
  )
}
