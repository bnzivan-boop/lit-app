import { useState, type CSSProperties } from 'react'
import { TopBar } from '../../components/TopBar'
import { num } from '../../data/format'
import { leagueArt, leagueOf, SEASON } from '../../data/season'
import { useStore } from '../../data/store'
import { useOrigin } from '../../lib/useOrigin'
import { Back, metal, Power } from './parts'
import s from './Leaders.module.css'

const HEADS = ['/assets/characters/head-visor.webp', '/assets/characters/head-shades.webp', '/assets/characters/hero-head-blue-fire.png']
const hue = (nick: string) => ({ '--hue': (nick.charCodeAt(0) * 47) % 360 }) as CSSProperties

/** Вся таблица сезона: своя сотня или все игроки */
export function Leaders() {
  const back = useOrigin('/season')
  const { balance, user } = useStore()
  const [tab, setTab] = useState<'group' | 'all'>('group')
  const board = SEASON.board[tab]
  const { league } = leagueOf(SEASON.power)
  const top = board.rows.filter((r) => r.place <= 3)
  const rest = board.rows.filter((r) => r.place > 3)
  const me = board.rows.find((r) => r.me)

  return (
    <main className={s.page} style={metal(league.id)}>
      <TopBar nick="Лидерборд" balance={balance} onBack={back} after={120} />
      <header className={s.head}>
        <Back onClick={back} />
        <img className={s.badge} src={leagueArt(league.id)} alt="" />
        <h1>Лидерборд</h1>
        <p>{tab === 'group' ? `Твоя группа: ${num(board.size)} игроков лиги ${league.name}` : `Все игроки сезона: ${num(board.size)}`}</p>
      </header>

      <div className={s.tabs} role="tablist" aria-label="Таблица">
        <button type="button" role="tab" aria-selected={tab === 'group'} className="press" onClick={() => setTab('group')}>
          Моя группа
        </button>
        <button type="button" role="tab" aria-selected={tab === 'all'} className="press" onClick={() => setTab('all')}>
          Общий
        </button>
      </div>

      <ol className={s.podium}>
        {[1, 0, 2].map((i) => {
          const r = top[i]
          if (!r) return null
          return (
            <li key={r.nick} data-place={r.place}>
              <img src={HEADS[r.place - 1]} alt="" />
              <span className={s.place}>{r.place}</span>
              <span className={s.nick}>{r.me ? 'Ты' : r.nick}</span>
              <Power value={r.power} />
            </li>
          )
        })}
      </ol>

      <ol className={s.list}>
        {rest.map((r, i) => (
          <li key={r.nick} data-me={r.me || undefined} data-gap={i > 0 && r.place - rest[i - 1].place > 1 ? true : undefined}>
            <span className={s.rowPlace}>{num(r.place)}</span>
            <span className={s.avatar} style={hue(r.nick)}>
              {r.me ? <img src={user.avatar} alt="" /> : r.nick[0].toUpperCase()}
            </span>
            <span className={s.rowNick}>{r.me ? 'Ты' : r.nick}</span>
            <Power value={r.power} />
          </li>
        ))}
      </ol>
      {tab === 'group' && <p className={s.more}>ещё {num(board.size - board.rows.length)} игроков ниже</p>}

      {me && (
        <footer className={s.me}>
          <b>{num(me.place)}</b>
          <span>
            <strong>Ты</strong>
            {tab === 'group' ? `место в группе из ${num(board.size)}` : `место среди ${num(board.size)}`}
          </span>
          <Power value={me.power} />
        </footer>
      )}
    </main>
  )
}
