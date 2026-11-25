import { useRef, useState, type CSSProperties } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { Rewards } from '../../components/Rewards'
import { TopBar } from '../../components/TopBar'
import { num } from '../../data/format'
import { board, findGame, gameHero, gameScene, type Control } from '../../data/games'
import { useStore } from '../../data/store'
import { usePanel } from '../../lib/usePanel'
import { Podium } from './Podium'
import { TiltSheet } from './TiltSheet'
import s from './GamePage.module.css'

/** Страница игры: цель, управление, правила, рейтинг и одна кнопка «Играть» */
export function GamePage() {
  const go = useNavigate()
  const { id } = useParams()
  const { best, tasks, user, balance, gameBox } = useStore()
  const game = findGame(id)
  const frame = useRef<HTMLDivElement>(null)
  const clip = usePanel(frame, { bottom: [26, 0], r: 0.1 })
  if (!game) return <Navigate to="/games" replace />
  const record = best[game.id] ?? 0
  const task = tasks.find((t) => t.game === game.id && t.status !== 'claimed')
  const { rows, me } = board(game, record, user.nick)

  return (
    <main className={s.page} style={{ '--game': game.color } as CSSProperties} data-game={game.id}>
      <TopBar nick={game.title} balance={balance} onBack={() => go('/games')} after={320} />
      <div className={s.top}>
        <div ref={frame} className={s.frame} style={clip}>
          <img className={s.scene} src={gameScene(game.id)} alt="" />
          <span className={s.shade} />
        </div>
        <img className={s.hero} src={gameHero(game.id)} alt="" />
        <button type="button" className={`press ${s.back}`} aria-label="К играм" onClick={() => go('/games')}>
          <Icon name="chevron" size={24} />
        </button>
        <h1>{game.title}</h1>
        <div className={s.stats}>
          <div>
            <b>{record > 0 ? num(record) : '0'}</b>
            <span>твой рекорд</span>
          </div>
          <div>
            <b>{me.place > 0 ? num(me.place) : '—'}</b>
            <span>{me.place > 0 ? 'место в рейтинге' : 'пока вне рейтинга'}</span>
          </div>
        </div>
      </div>

      <section className={s.leaders}>
        <button type="button" className={`press ${s.boardHead}`} onClick={() => go(`/games/${game.id}/top`)}>
          <h2>Рейтинг лучших</h2>
          <span>
            весь <Icon name="chevron" size={20} />
          </span>
        </button>
        <div className={s.podium}>
          <Podium rows={rows} />
        </div>
      </section>

      <section className={s.goal}>
        <img src="/assets/cases/chest.webp" alt="" data-off={gameBox.taken || undefined} />
        <h2>{num(game.goal)} очков</h2>
        <p>{gameBox.taken ? 'сегодняшний mystery box уже твой' : 'за один забег, и mystery box твой'}</p>
      </section>

      {task && (
        <section className={s.task}>
          <div>
            <span className={s.tag}>Задание дня</span>
            <Rewards reward={task.reward} />
          </div>
          <LiquidBar
            value={task.progress}
            max={task.goal}
            label={task.title}
            left={task.status === 'ready' ? 'Готово' : num(task.progress)}
            right={`из ${num(task.goal)}`}
          />
        </section>
      )}

      {game.controls && <Controls list={game.controls} />}

      <section className={s.how}>
        <h2>Как играть</h2>
        <p>{game.about}</p>
        <ol>
          {game.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p className={s.note}>{game.note}</p>
      </section>

      <footer className={s.bar}>
        <Button onClick={() => go(`/games/${game.id}/play`)}>
          <Icon name="play" size={18} /> Играть
        </Button>
      </footer>
    </main>
  )
}

function Controls({ list }: { list: Control[] }) {
  const [on, setOn] = useState(list[0].id)
  const [tilt, setTilt] = useState(false)
  const at = list.findIndex((c) => c.id === on)
  return (
    <section className={s.section}>
      <h2>Управление</h2>
      <div className={s.switch} role="radiogroup" aria-label="Управление" style={{ '--at': at, '--n': list.length } as CSSProperties}>
        {list.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={c.id === on} onClick={() => setOn(c.id)}>
            {c.title}
          </button>
        ))}
      </div>
      <div className={s.hint}>
        <span>{list[at].hint}</span>
        {on === 'tilt' && (
          <button type="button" className="press" onClick={() => setTilt(true)}>
            Настроить
          </button>
        )}
      </div>
      {tilt && <TiltSheet onClose={() => setTilt(false)} />}
    </section>
  )
}
