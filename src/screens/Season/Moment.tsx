import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Button } from '../../components/Button'
import { GameCover } from '../../components/GameCover'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { num } from '../../data/format'
import { gameCover } from '../../data/games'
import { leagueArt, leagueOf, nextReward, seasonArt, SEASON, type LeagueId } from '../../data/season'
import { haptic } from '../../lib/motion'
import { sparks } from '../../lib/sparks'
import { metal, Power, PowerIcon } from './parts'
import s from './Moment.module.css'

type Kind = 'passed' | 'up' | 'end'

/** когда значок приземляется после вращения, мс */
const LAND = 1360

/** Большие моменты сезона: испытание пройдено, новая лига, сезон завершён */
export function Moment({ kind }: { kind: Kind }) {
  const go = useNavigate()
  const { id } = useParams()
  const root = useRef<HTMLElement>(null)
  const art = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (kind === 'passed') {
      haptic('done')
      return root.current && art.current ? sparks(root.current, art.current, 24) : undefined
    }
    /* значок крутится и приземляется: щелчки во время вращения, удар и искры на приземлении */
    const timers = [300, 720, 1080].map((ms) => setTimeout(() => haptic('press'), ms))
    let clean = () => {}
    let again = () => {}
    timers.push(
      setTimeout(() => {
        haptic('land')
        if (root.current && art.current) clean = sparks(root.current, art.current, 30)
      }, LAND),
      setTimeout(() => {
        haptic('done')
        if (root.current && art.current) again = sparks(root.current, art.current, 18)
      }, LAND + 900),
    )
    return () => {
      timers.forEach(clearTimeout)
      clean()
      again()
    }
  }, [kind])

  const all = [...SEASON.challenges.daily, ...SEASON.challenges.weekly, SEASON.challenges.seasonal]

  if (kind === 'passed') {
    const c = all.find((x) => x.id === id) ?? all[0]
    const power = SEASON.power + c.power
    const reward = nextReward(power)
    return (
      <main ref={root} className={`${s.page} ${s.arena}`}>
        <img className={s.arenaBg} src={seasonArt('arena')} alt="" />
        <h1>Испытание пройдено</h1>
        <div ref={art} className={`${s.art} ${s.arenaArt}`}>
          <b className={s.gain}>
            +{num(c.power)}
            <PowerIcon size={92} />
          </b>
          <span className={s.gainLabel}>силы Титана</span>
        </div>
        <div className={s.card}>
          <span className={s.cover}>
            <GameCover game={c.game} cover={gameCover(c.game)} title="" />
          </span>
          <span className={s.cardText}>
            <b>{c.title}</b>
            <span>{c.text}</span>
          </span>
        </div>
        {reward && (
          <div className={s.next}>
            <LiquidBar value={power - reward.from} max={reward.power - reward.from} label="До следующей награды" left={num(power)} right={<span className={s.dim}>из {num(reward.power)}</span>} />
            <img src={seasonArt(reward.box)} alt="" />
          </div>
        )}
        <div className={s.actions}>
          <Button onClick={() => go(c.game ? `/games/${c.game}/play` : '/games')}>Играть ещё</Button>
          <button type="button" className={`press ${s.link}`} onClick={() => go('/season')}>
            К испытаниям
          </button>
        </div>
      </main>
    )
  }

  if (kind === 'up') {
    /* пример: игрок дошёл до следующей лиги */
    const { next, league } = leagueOf(SEASON.power)
    const to = next ?? league
    const after = leagueOf(to.from).next
    return (
      <main ref={root} className={s.page} style={metal(to.id)} data-metal>
        <span className={`${s.kicker} ${s.late}`}>Новая лига</span>
        <h1 className={`${s.metalTitle} ${s.late}`}>{to.name}</h1>
        <Trophy id={to.id} art={art} />
        <dl className={`${s.stats} ${s.later}`}>
          <div>
            <dt>Сила</dt>
            <dd>
              <Power value={to.from} />
            </dd>
          </div>
          <div>
            <dt>Место</dt>
            <dd>6</dd>
          </div>
          <div>
            <dt>Дальше</dt>
            <dd>
              {after && <img className={s.mini} src={leagueArt(after.id)} alt="" />}
              {after ? after.name : 'Вершина'}
            </dd>
          </div>
        </dl>
        <p className={`${s.note} ${s.later}`}>
          <Icon name="check" size={16} /> Сила сохраняется, лига вниз не падает
        </p>
        <div className={`${s.actions} ${s.later}`}>
          <Button onClick={() => go('/season')}>Продолжить сезон</Button>
        </div>
      </main>
    )
  }

  const { league } = leagueOf(SEASON.power)
  const me = SEASON.board.group.rows.find((r) => r.me)
  const meAll = SEASON.board.all.rows.find((r) => r.me)
  return (
    <main ref={root} className={s.page} style={metal(league.id)} data-metal>
      <span className={`${s.kicker} ${s.late}`}>Сезон «{SEASON.title}»</span>
      <h1 className={s.late}>Сезон завершён</h1>
      <Trophy id={league.id} art={art} />
      <span className={`${s.final} ${s.late}`}>Твоя лига: {league.name}</span>
      <dl className={`${s.stats} ${s.later}`}>
        <div>
          <dt>Сила</dt>
          <dd>
            <Power value={SEASON.power} />
          </dd>
        </div>
        <div>
          <dt>В группе</dt>
          <dd>{me ? num(me.place) : '—'}</dd>
        </div>
        <div>
          <dt>Общий</dt>
          <dd>{meAll ? num(meAll.place) : '—'}</dd>
        </div>
      </dl>
      <div className={`${s.actions} ${s.later}`}>
        <Button onClick={() => go('/season/board')}>Посмотреть итоги</Button>
        <button type="button" className={`press ${s.link}`} onClick={() => go('/games')}>
          В мини-игры
        </button>
      </div>
    </main>
  )
}

/** Значок лиги: влетает с вращением, вспышка на приземлении, за ним лучи и ореол, по металлу бегает блик */
function Trophy({ id, art }: { id: LeagueId; art: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={art} className={s.art}>
      <span className={s.beam} />
      <span className={s.floor} />
      <span className={s.halo} />
      <span className={s.embers} aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <i key={i} style={{ '--x': `${(i * 37) % 100}%`, '--d': `${(i * 0.43) % 3.2}s`, '--s': `${4 + (i % 4) * 2}px` } as CSSProperties} />
        ))}
      </span>
      <span className={s.flash} />
      <span className={s.spin}>
        <img className={s.badge} src={leagueArt(id)} alt="" />
        <span className={s.shine} style={{ '--art': `url(${leagueArt(id)})` } as CSSProperties} aria-hidden />
      </span>
    </div>
  )
}
