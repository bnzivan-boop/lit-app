import { num } from '../../data/format'
import type { BoardRow } from '../../data/games'
import s from './Podium.module.css'

/* временные головы из макета, пока нет аватаров игроков */
const HEADS = ['/assets/characters/head-shades.webp', '/assets/characters/head-visor.webp', '/assets/characters/hero-head-blue-fire.png']

/** Тройка лучших: второй, первый, третий */
export function Podium({ rows }: { rows: BoardRow[] }) {
  return (
    <ol className={s.podium}>
      {[1, 0, 2].map((i) => {
        const r = rows[i]
        return (
          <li key={r.place} className={s.step} data-place={r.place}>
            <img className={s.head} src={HEADS[i]} alt="" />
            <span className={s.place}>{r.place}</span>
            <span className={s.nick}>{r.me ? 'Ты' : r.nick}</span>
            <b>{num(r.score)}</b>
          </li>
        )
      })}
    </ol>
  )
}
