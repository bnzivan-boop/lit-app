import { useRef, type CSSProperties } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { gameHero, gameScene, type Game } from '../../data/games'
import { usePanel, type PanelShape } from '../../lib/usePanel'
import s from './Panel.module.css'

const vars = (g: Game) => ({ '--game': g.color }) as CSSProperties

type Props = { game: Game; note: string; task?: boolean; shape?: PanelShape; pressed?: boolean; onClick: () => void }

/** Кадр игры: сцена в косой рамке, герой вылезает наружу */
export function Panel({ game, note, task, shape = {}, pressed, onClick }: Props) {
  const frame = useRef<HTMLSpanElement>(null)
  const clip = usePanel(frame, shape)
  return (
    <button type="button" className={`press ${s.panel}`} data-game={game.id} data-side={shape.side} style={vars(game)} data-pressed={pressed || undefined} onClick={onClick}>
      <span ref={frame} className={s.frame} style={clip}>
        <img className={s.scene} src={gameScene(game.id)} alt="" loading="lazy" />
        <span className={s.shade} />
      </span>
      <img className={s.hero} src={gameHero(game.id)} alt="" loading="lazy" />
      <span className={s.text}>
        {task && <span className={s.task}>Задание дня</span>}
        <span className={s.name}>{game.title}</span>
        <span className={s.note}>
          <i>
            <Icon name="play" size={13} />
          </i>
          {note}
        </span>
      </span>
    </button>
  )
}

type FeatureProps = { game: Game; note: string; task?: string; onOpen: () => void; onPlay: () => void }

/** Новинка: сцена во весь верх экрана */
export function Feature({ game, note, task, onOpen, onPlay }: FeatureProps) {
  const frame = useRef<HTMLSpanElement>(null)
  const clip = usePanel(frame, { bottom: [34, 0], r: 0.1 })
  return (
    <section className={s.feature} data-game={game.id} style={vars(game)}>
      <span ref={frame} className={s.frame} style={clip}>
        <img className={s.scene} src={gameScene(game.id)} alt="" />
        <span className={s.shade} />
      </span>
      <img className={s.hero} src={gameHero(game.id)} alt="" />
      <button type="button" className={s.cover} aria-label={`${game.title}: описание и рейтинг`} onClick={onOpen} />
      <span className={s.sticker}>Новинка</span>
      <div className={s.big}>
        <h1>{game.title}</h1>
        <p>{task ? `Задание дня: ${task.toLowerCase()}` : game.about}</p>
        <div className={s.actions}>
          <Button className={s.play} onClick={onPlay}>
            <Icon name="play" size={18} /> Играть
          </Button>
          <button type="button" className={`press ${s.more}`} onClick={onOpen}>
            {note}
            <Icon name="chevron" size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
