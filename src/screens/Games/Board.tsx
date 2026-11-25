import { type CSSProperties } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/TopBar'
import { num, plural } from '../../data/format'
import { board, findGame, gameScene } from '../../data/games'
import { useStore } from '../../data/store'
import { Podium } from './Podium'
import s from './Board.module.css'

const MOVE: Record<string, string> = { '1': 'поднялся', '-1': 'опустился', '0': 'на месте' }

/** Рейтинг игры: тройка, десятка и место игрока внизу */
export function Board() {
  const go = useNavigate()
  const { id } = useParams()
  const { best, user, balance } = useStore()
  const game = findGame(id)
  if (!game) return <Navigate to="/games" replace />
  const { rows, me, gap, gapPlace } = board(game, best[game.id] ?? 0, user.nick)
  return (
    <main className={s.page} style={{ '--game': game.color } as CSSProperties}>
      <TopBar nick="Рейтинг" balance={balance} onBack={() => go(`/games/${game.id}`)} after={150} />
      <div className={s.back} aria-hidden>
        <img src={gameScene(game.id)} alt="" />
      </div>
      <header className={s.head}>
        <button type="button" className={`press ${s.close}`} aria-label="Назад" onClick={() => go(`/games/${game.id}`)}>
          <Icon name="chevron" size={24} />
        </button>
        <span>обновляется раз в минуту</span>
      </header>
      <h1 className={s.title}>Рейтинг</h1>
      <p className={s.game}>{game.title}</p>
      <div className={s.podium}>
        <Podium rows={rows} />
      </div>
      <ol className={s.list} start={4}>
        {rows.slice(3).map((r) => (
          <li key={r.nick} className={s.row} data-me={r.me || undefined}>
            <span className={s.place}>
              {r.place}
              <i data-move={r.move} role="img" aria-label={MOVE[r.move]}>
                {r.move !== 0 && <Icon name="chevron" size={14} />}
              </i>
            </span>
            <span className={s.avatar} style={{ '--hue': (r.nick.charCodeAt(0) * 47) % 360 } as CSSProperties}>
              {r.me ? <img src={user.avatar} alt="" /> : r.nick[0].toUpperCase()}
            </span>
            <span className={s.nick}>{r.me ? 'Ты' : r.nick}</span>
            <b>{num(r.score)}</b>
          </li>
        ))}
      </ol>
      {game.me.before > 0 && <p className={s.before}>Твой рекорд до запуска рейтинга — {num(game.me.before)}. Он сохранён, но в таблице не участвует.</p>}

      <footer className={s.me}>
        {me.place > 0 ? (
          <>
            <b className={s.mePlace}>{me.place}</b>
            <span>
              <strong>{num(me.score)} {plural(me.score, ['очко', 'очка', 'очков'])}</strong>
              {gap > 0 ? `ещё ${num(gap)} до ${gapPlace === rows.length ? 'десятки' : `${gapPlace} места`}` : 'ты первый'}
            </span>
          </>
        ) : (
          <span>
            <strong>Тебя ещё нет в рейтинге</strong>
            хватит одного забега
          </span>
        )}
        <button type="button" className={`press ${s.play}`} onClick={() => go(`/games/${game.id}/play`)}>
          Играть
        </button>
      </footer>
    </main>
  )
}
