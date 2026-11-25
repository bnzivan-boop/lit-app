import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Icon } from '../../components/Icon'
import { num } from '../../data/format'
import { findGame, gameHero, gameScene } from '../../data/games'
import { useStore } from '../../data/store'
import { haptic, reduced } from '../../lib/motion'
import { useFrom, useOrigin } from '../../lib/useOrigin'
import { Result } from './Result'
import s from './Play.module.css'

/** Запуск игры. Сама игра на бэке: здесь отсчёт и заглушка, которая отдаёт очки */
export function Play() {
  const go = useNavigate()
  /* из задания или с главной — туда же и вернёмся */
  const from = useFrom()
  const back = useOrigin()
  const { id } = useParams()
  const { finishGame, run } = useStore()
  const game = findGame(id)
  const [round, setRound] = useState(0)
  const [count, setCount] = useState(3)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (count === 0) return
    const t = setTimeout(
      () => {
        haptic(count > 1 ? 'land' : 'press')
        setCount(count - 1)
      },
      reduced() ? 300 : 760,
    )
    return () => clearTimeout(t)
  }, [count, round])

  if (!game) return <Navigate to="/games" replace />

  function finish(points: number) {
    finishGame(game!.id, points)
    setOver(true)
  }

  function again() {
    setOver(false)
    setScore(0)
    setCount(3)
    setRound((n) => n + 1)
  }

  /* тап по сцене: очки вылетают из-под пальца */
  function tap(e: PointerEvent<HTMLDivElement>) {
    if (count > 0 || over) return
    const points = 20 + Math.floor(Math.random() * 60)
    setScore((n) => n + points)
    haptic('land')
    if (reduced() || !layer.current) return
    const box = layer.current.getBoundingClientRect()
    const el = document.createElement('b')
    el.className = s.pop
    el.textContent = `+${points}`
    el.style.left = `${e.clientX - box.left}px`
    el.style.top = `${e.clientY - box.top}px`
    layer.current.append(el)
    el.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.7)', opacity: 1 },
        { transform: 'translate(-50%,-140%) scale(1.15)', opacity: 0 },
      ],
      { duration: 620, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    ).onfinish = () => el.remove()
  }

  if (over && run) return <Result key={round} game={game} run={run} onAgain={again} />

  return (
    <main className={s.screen} style={{ '--game': game.color } as CSSProperties} data-game={game.id}>
      <img className={s.scene} src={gameScene(game.id)} alt="" />
      <div ref={layer} className={s.stage} onPointerDown={tap}>
        <img className={s.hero} src={gameHero(game.id)} alt="" data-run={count === 0 || undefined} draggable={false} />
      </div>
      <header className={s.head}>
        <button type="button" className={`press ${s.close}`} aria-label="Выйти из игры" onClick={() => (from ? back() : go(`/games/${game.id}`))}>
          <Icon name="close" size={22} />
        </button>
        <span className={s.score}>{num(score)}</span>
        <span className={s.goal}>цель {num(game.goal)}</span>
      </header>
      {count > 0 && (
        <span key={count} className={s.count} aria-live="assertive">
          {count}
        </span>
      )}
      <footer className={s.demo} style={{ visibility: count > 0 ? 'hidden' : 'visible' }}>
        <p>Здесь откроется игра с сервера. Пока тапай по экрану или выбери итог.</p>
        <div>
          <button type="button" className="press" onClick={() => finish(Math.max(score, game.goal + 240))}>
            Победа (демо)
          </button>
          <button type="button" className="press" onClick={() => finish(Math.min(score || Math.round(game.goal * 0.6), game.goal - 10))}>
            Не вышло (демо)
          </button>
          <button type="button" className="press" disabled={score === 0} onClick={() => finish(score)}>
            Закончить
          </button>
        </div>
      </footer>
    </main>
  )
}
