import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { TopBar } from '../../components/TopBar'
import { duration, num } from '../../data/format'
import { BOX_CASE, GAMES, type Game } from '../../data/games'
import { useStore } from '../../data/store'
import { useOpen } from '../../lib/useOrigin'
import { BoxBar } from './BoxBar'
import { Feature, Panel } from './Panel'
import s from './Games.module.css'

/* раскладка комикса: одиночные кадры и пары */
const ROWS = [['energy-jet'], ['energy-mix', 'energy-ninja'], ['energy-rush'], ['energy-hunt', 'energy-cosmo']]

/** Игры: новинка, mystery box дня и все игры косыми кадрами */
export function Games() {
  const go = useNavigate()
  const openOver = useOpen()
  const { balance, best, tasks, gameBox, minutesToMidnight } = useStore()
  const feature = GAMES.find((g) => g.isNew) ?? GAMES[0]
  const taskOf = (g: Game) => tasks.find((t) => t.game === g.id && !t.done)
  const note = (g: Game) => (best[g.id] > 0 ? `рекорд ${num(best[g.id])}` : 'ещё не играл')
  const open = (g: Game) => go(`/games/${g.id}`)
  const byId = (id: string) => GAMES.find((g) => g.id === id)!
  return (
    <main className={s.main}>
      <TopBar nick="Игры" balance={balance} after={300} />
      <span className={s.balance}>
        <Amount value={balance.soft} kind="soft" coin={18} />
        <Amount value={balance.hard} kind="hard" coin={18} />
      </span>
      <Feature game={feature} note={note(feature)} task={taskOf(feature)?.hint} onOpen={() => open(feature)} onPlay={() => go(`/games/${feature.id}/play`)} />

      <BoxBar {...gameBox} next={duration(minutesToMidnight)} onOpen={() => openOver(`/case/${BOX_CASE}`)} />

      <h2 className={s.title}>Все игры</h2>
      <div className={s.comic}>
        {ROWS.map((ids, i) => {
          /* общая линия скоса между рядами: вверх-вниз по очереди */
          const line = (n: number): [number, number] => (n < 0 || n >= ROWS.length - 1 ? [0, 0] : n % 2 ? [18, 0] : [0, 18])
          const top = line(i - 1)
          const low = line(i)
          const bottom: [number, number] = i >= ROWS.length - 1 ? [0, 0] : [18 - low[0], 18 - low[1]]
          const mid = (e: [number, number]) => (e[0] + e[1]) / 2
          return (
            <div key={ids[0]} className={s.row} data-pair={ids.length > 1 || undefined}>
              {ids.map((id, n) => {
                const pair = ids.length > 1
                const left = n === 0
                return (
                  <Panel
                    key={id}
                    game={byId(id)}
                    note={note(byId(id))}
                    task={Boolean(taskOf(byId(id)))}
                    shape={{
                      top: pair ? (left ? [top[0], mid(top)] : [mid(top), top[1]]) : top,
                      bottom: pair ? (left ? [bottom[0], mid(bottom)] : [mid(bottom), bottom[1]]) : bottom,
                      side: pair ? (left ? 'left' : 'right') : undefined,
                    }}
                    onClick={() => open(byId(id))}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </main>
  )
}
