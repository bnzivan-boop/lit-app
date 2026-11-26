import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { type FireState } from '../../components/Fire'
import { Glow } from '../../components/Glow'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { Rewards } from '../../components/Rewards'
import { duration, num, plural } from '../../data/format'
import { BOX_CASE, type Game } from '../../data/games'
import { useStore, type RunResult } from '../../data/store'
import { haptic, tween } from '../../lib/motion'
import { useFrom, useOpen, useOrigin } from '../../lib/useOrigin'
import { sparks } from '../../lib/sparks'
import s from './Result.module.css'

type Props = { game: Game; run: RunResult; onAgain: () => void }

/** Итог забега: победа с огнём и mystery box или «не вышло» с тем, сколько не хватило */
export function Result({ game, run, onAgain }: Props) {
  const go = useNavigate()
  /* после бокса остаёмся в этой игре */
  const openOver = useOpen(`/games/${game.id}`)
  const from = useFrom()
  const leave = useOrigin('/games')
  const label = from === '/tasks' ? 'К заданиям' : from === '/' ? 'На главную' : 'К играм'
  const { minutesToMidnight, tasks } = useStore()
  const root = useRef<HTMLElement>(null)
  const art = useRef<HTMLImageElement>(null)
  const fire = useRef<FireState>({ power: 0, burst: 0 })
  const [k, setK] = useState(0)
  const { win } = run
  const task = tasks.find((t) => t.id === run.taskReady)
  const missing = game.goal - run.score

  useEffect(() => {
    if (win) haptic('done')
    const stop = [tween(1200, setK)]
    if (win) {
      stop.push(tween(900, (x) => (fire.current.power = 0.95 * x)))
      stop.push(tween(800, (x) => (fire.current.burst = 1 - x)))
      stop.push(sparks(root.current!, art.current!, 26))
    }
    return () => stop.forEach((f) => f())
  }, [win])

  const points = plural(run.score, ['очко', 'очка', 'очков'])
  return (
    <main ref={root} className={s.screen} data-win={win || undefined}>
      <div className={s.stage}>
        {win && <Glow />}
        <img ref={art} className={s.art} src={win ? '/assets/rewards/emblem.webp' : '/assets/rewards/sad.webp'} alt="" />
      </div>
      <h1 className={s.title}>{win ? 'Классное прохождение' : 'Не вышло'}</h1>
      <p className={s.score}>
        <b>{num(Math.round(run.score * k))}</b> {points}
      </p>
      <div className={s.chips}>
        {run.soft > 0 && <Rewards reward={{ soft: run.soft, xp: run.xp }} size="lg" />}
      </div>
      <p className={s.news}>
        {run.record && <span>новый рекорд</span>}
        {run.place > 0 && run.place !== run.placeBefore && <span>{num(run.place)} место в рейтинге</span>}
      </p>

      {run.box === 'won' ? (
        <section className={s.box}>
          <img src="/assets/cases/chest.webp" alt="" />
          <div>
            <b>Mystery box твой</b>
            <span>открытие бесплатное</span>
          </div>
        </section>
      ) : win ? (
        <p className={s.next}>Новый mystery box через {duration(minutesToMidnight)}</p>
      ) : (
        <section className={s.miss}>
          <LiquidBar value={run.score} max={game.goal} label="До цели" left={num(run.score)} right={`из ${num(game.goal)}`} />
          <p>
            {run.box === 'taken'
              ? `до цели не хватило ${num(missing)}`
              : `до mystery box не хватило ${num(missing)}`}
          </p>
        </section>
      )}

      {task && (
        <button type="button" className={`press ${s.task}`} onClick={() => go(`/tasks?open=${task.id}`)}>
          <Icon name="check" size={20} />
          <span>Задание дня выполнено</span>
          <b>Собрать</b>
        </button>
      )}

      <footer className={s.actions}>
        {run.box === 'won' ? (
          <>
            <Button onClick={() => openOver(`/case/${BOX_CASE}`)}>Открыть mystery box</Button>
            <div>
              <Button variant="secondary" onClick={onAgain}>
                Играть дальше
              </Button>
              <Button variant="secondary" onClick={leave}>
                {label}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button onClick={onAgain}>{win ? 'Играть дальше' : 'Играть ещё'}</Button>
            <Button variant="secondary" onClick={leave}>
              {label}
            </Button>
          </>
        )}
      </footer>
    </main>
  )
}
