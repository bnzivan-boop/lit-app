import { useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { Fire, type FireState } from '../../components/Fire'
import { GameCover } from '../../components/GameCover'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { TopBar } from '../../components/TopBar'
import { num, plural } from '../../data/format'
import { findGame, gameCover } from '../../data/games'
import { leagueArt, leagueOf, nextReward, seasonArt, SEASON, type BoardRow, type Challenge } from '../../data/season'
import { useStore } from '../../data/store'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import s from './Season.module.css'

/* временные головы из макета для тройки, пока нет аватаров игроков */
const HEADS = ['/assets/characters/head-visor.webp', '/assets/characters/head-shades.webp', '/assets/characters/hero-head-blue-fire.png']

const KINDS = [
  { id: 'daily', title: 'Ежедневные' },
  { id: 'weekly', title: 'Еженедельные' },
  { id: 'seasonal', title: 'Сезонное' },
] as const
type Kind = (typeof KINDS)[number]['id']

/* дорожка наград сразу показывает следующий бокс */
const toNext = (el: HTMLDivElement | null) => {
  const n = el?.querySelector<HTMLElement>('[data-state="next"]')
  if (el && n) el.scrollLeft = Math.max(0, n.offsetLeft - el.offsetLeft - el.clientWidth / 2 + n.offsetWidth / 2)
}

/* цвет карточки испытания — цвет его игры; «любые игры» — бирюза бренда */
const tone = (c: Challenge) => ({ '--tone': findGame(c.game)?.color ?? '#0b5753' }) as CSSProperties
const hue = (nick: string) => ({ '--hue': (nick.charCodeAt(0) * 47) % 360 }) as CSSProperties

/** Сила Титана с молнией: так сила отличается от монет */
const Power = ({ value, plus }: { value: number; plus?: boolean }) => (
  <span className={s.powerChip}>
    <Icon name="bolt" size={16} />
    {plus ? '+' : ''}
    {num(value)}
  </span>
)

/** Экран сезона: моя лига и сила, следующая награда, испытания трёх видов, лидерборд, награды */
export function Season() {
  const go = useNavigate()
  const open = useOpen()
  const back = useOrigin('/games')
  const { balance, user } = useStore()
  const fire = useRef<FireState>({ power: 0.85, burst: 0 })
  const [kind, setKind] = useState<Kind>('daily')
  const [tab, setTab] = useState<'group' | 'all'>('group')
  const power = SEASON.power
  const { league, next } = leagueOf(power)
  const reward = nextReward(power)
  const target = [...SEASON.challenges.daily, ...SEASON.challenges.weekly].find((c) => c.progress < c.goal)
  const play = () => go(target?.game ? `/games/${target.game}/play` : '/games')
  const { base, extra, items } = SEASON.rewards
  const nextExtra = extra.find((x) => x.items > items)
  const prevExtra = [...extra].reverse().find((x) => x.items <= items)?.items ?? 0

  const avatar = (r: BoardRow) => (
    <span className={s.avatar} style={hue(r.nick)}>
      {r.me ? <img src={user.avatar} alt="" /> : r.nick[0].toUpperCase()}
    </span>
  )

  return (
    <main className={s.page}>
      <TopBar nick="Сезон" balance={balance} onBack={back} after={260} />
      <section className={s.hero}>
        <img className={s.photo} src={seasonArt('titan')} alt="" />
        <button type="button" className={`press ${s.round} ${s.back}`} aria-label="Назад" onClick={back}>
          <Icon name="chevron" size={24} />
        </button>
        <button type="button" className={`press ${s.round} ${s.info}`} aria-label="О сезоне" onClick={() => go('/season/about')}>
          <Icon name="info" size={22} />
        </button>
      </section>

      {/* лига: значок, сила, лестница лиг, жидкая шкала как в профиле */}
      <section className={s.league} data-league={league.id}>
        <span className={s.badgeBox}>
          <img className={s.badge} src={leagueArt(league.id)} alt="" />
          <span className={s.shine} style={{ '--art': `url(${leagueArt(league.id)})` } as CSSProperties} aria-hidden />
        </span>
        <div className={s.leagueText}>
          <span className={s.leagueName}>{league.name}</span>
          <b className={s.powerBig}>{num(power)}</b>
          <span className={s.caption}>сила Титана</span>
        </div>
        <div className={s.liquid}>
          {next ? (
            <LiquidBar value={power - league.from} max={next.from - league.from} label={`До лиги ${next.name}`} left={num(power)} right={<span className={s.dim}>до {next.of} {num(next.from - power)}</span>} />
          ) : (
            <LiquidBar value={1} max={1} label="Высшая лига" left={num(power)} right="высшая лига" />
          )}
        </div>
      </section>

      {/* следующая награда: наклейка на рамке, крупный бокс */}
      {reward && (
        <button type="button" className={`press ${s.next}`} onClick={() => go('/season/rewards')}>
          <span className={s.nextTag}>Следующая награда</span>
          <span className={s.nextScene} aria-hidden>
            <span className={s.nextGlow} />
            <Fire state={fire} className={s.fire} />
            <img className={s.nextBox} src={seasonArt(reward.box)} alt="" />
          </span>
          <span className={s.nextText}>
            <span className={s.nextLabel}>осталось</span>
            <b>
              <Icon name="bolt" size={30} />
              {num(reward.power - power)}
            </b>
            <span className={s.nextSub}>бокс откроется на {num(reward.power)} силы</span>
          </span>
          <span className={s.nextLiquid}>
            <LiquidBar value={power - reward.from} max={reward.power - reward.from} label="До следующей награды" left={num(power)} right={`из ${num(reward.power)}`} />
          </span>
        </button>
      )}

      <section className={s.section}>
        <h2>Испытания Титана</h2>
        <div className={s.tabs} role="tablist" aria-label="Вид испытаний">
          {KINDS.map((k) => (
            <button key={k.id} type="button" role="tab" aria-selected={kind === k.id} className="press" onClick={() => setKind(k.id)}>
              {k.title}
            </button>
          ))}
        </div>
        {kind === 'seasonal' ? (
          <Seasonal c={SEASON.challenges.seasonal} />
        ) : (
          <div className={s.list}>
            {SEASON.challenges[kind].map((c) => (
              <Row key={c.id} c={c} onClick={() => go(c.game ? `/games/${c.game}` : '/games')} />
            ))}
          </div>
        )}
        {kind === 'daily' && <p className={s.note}>Невыполненные испытания переходят на следующий день</p>}
      </section>

      <section className={s.section}>
        <div className={s.head}>
          <h2>Лидерборд</h2>
          <button type="button" className={`press ${s.more}`} onClick={() => go('/season/board')}>
            Вся таблица
            <Icon name="chevron" size={16} />
          </button>
        </div>
        <div className={s.tabs} role="tablist" aria-label="Таблица">
          <button type="button" role="tab" aria-selected={tab === 'group'} className="press" onClick={() => setTab('group')}>
            Моя группа
          </button>
          <button type="button" role="tab" aria-selected={tab === 'all'} className="press" onClick={() => setTab('all')}>
            Общий
          </button>
        </div>
        {tab === 'group' ? (
          <>
            <p className={s.note}>Твоя группа: {num(SEASON.board.group.size)} игроков. Листай вправо</p>
            <ol className={s.strip}>
              {SEASON.board.group.rows.map((r) => (
                <li key={r.nick} className={s.player} data-place={r.place <= 3 ? r.place : undefined} data-me={r.me || undefined}>
                  {r.place <= 3 && !r.me ? <img className={s.head3} src={HEADS[r.place - 1]} alt="" /> : avatar(r)}
                  <span className={s.playerPlace}>{r.place}</span>
                  <span className={s.playerNick}>{r.me ? 'Ты' : r.nick}</span>
                  <Power value={r.power} />
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <p className={s.note}>Все игроки сезона: {num(SEASON.board.all.size)}</p>
            <ol className={s.table}>
              {SEASON.board.all.rows.map((r, i, list) => (
                <li key={r.nick} data-me={r.me || undefined} data-gap={i > 0 && r.place - list[i - 1].place > 1 ? true : undefined}>
                  <span className={s.tablePlace} data-top={r.place <= 3 ? r.place : undefined}>
                    {num(r.place)}
                  </span>
                  {avatar(r)}
                  <span className={s.tableNick}>{r.me ? 'Ты' : r.nick}</span>
                  <Power value={r.power} />
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <section className={s.section}>
        <div className={s.head}>
          <h2>Награды сезона</h2>
          <button type="button" className={`press ${s.more}`} onClick={() => go('/season/rewards')}>
            Все
            <Icon name="chevron" size={16} />
          </button>
        </div>

        <div className={s.path}>
          <span className={s.pathHead}>
            <b>Базовые</b>
            <span>открываются силой Титана за испытания</span>
          </span>
          <div className={s.boxes} ref={toNext}>
            {base.map((r) => {
              const state = r.power <= power ? 'open' : r.power === reward?.power ? 'next' : 'lock'
              return (
                <span key={r.power} className={s.boxItem} data-state={state}>
                  <span className={s.boxArt}>
                    <img src={seasonArt(r.box)} alt="" />
                    {state !== 'next' && <i>{state === 'open' ? <Icon name="check" size={16} /> : <Icon name="lock" size={14} />}</i>}
                  </span>
                  <Power value={r.power} />
                </span>
              )
            })}
          </div>
        </div>

        {/* дополнительные: зачем участвовать — сразу сверху */}
        <div className={`${s.path} ${s.extra}`}>
          <img className={s.can} src="/assets/products/can-lemonade.webp" alt="" />
          <span className={s.extraHead}>
            <span className={s.extraTag}>Боксы за чеки</span>
            <b>Ещё {extra.length} боксов сверху</b>
            <span>Сканируй чеки: каждый товар LIT — шаг к боксу</span>
          </span>
          {nextExtra && (
            <span className={s.extraLiquid}>
              <LiquidBar
                value={items - prevExtra}
                max={nextExtra.items - prevExtra}
                label="До дополнительного бокса"
                left={`${num(items)} ${plural(items, ['товар', 'товара', 'товаров'])}`}
                right={`ещё ${num(nextExtra.items - items)} до бокса`}
              />
            </span>
          )}
          <div className={s.boxes} ref={toNext}>
            {extra.map((r) => {
              const state = r.items <= items ? 'open' : r === nextExtra ? 'next' : 'lock'
              return (
                <span key={r.items} className={s.boxItem} data-state={state}>
                  <span className={s.boxArt}>
                    <img src={seasonArt(r.box)} alt="" />
                    {state !== 'next' && <i>{state === 'open' ? <Icon name="check" size={16} /> : <Icon name="lock" size={14} />}</i>}
                  </span>
                  <span className={s.items}>{num(r.items)} шт.</span>
                </span>
              )
            })}
          </div>
          <Button variant="secondary" className={s.scan} onClick={() => open('/scan')}>
            <Icon name="scan" size={18} /> Сканировать чек
          </Button>
        </div>
      </section>

      <div className={s.dock}>
        <Button onClick={play}>
          <Icon name="play" size={18} /> Играть
        </Button>
      </div>
    </main>
  )
}

/** Прогресс: до пяти шагов — сегменты, больше — шкала */
function Steps({ c }: { c: Challenge }) {
  if (c.goal <= 5)
    return (
      <span className={s.segments} aria-label={`${c.progress} из ${c.goal}`}>
        {Array.from({ length: c.goal }, (_, i) => (
          <i key={i} data-on={i < c.progress || undefined} />
        ))}
        <b>
          {c.progress}/{c.goal}
        </b>
      </span>
    )
  return (
    <span className={s.rowBar}>
      <span className={s.bar}>
        <i style={{ '--share': Math.max(0.04, Math.min(1, c.progress / c.goal)) } as CSSProperties} />
      </span>
      <b>
        {num(c.progress)}/{num(c.goal)}
      </b>
    </span>
  )
}

function Row({ c, onClick }: { c: Challenge; onClick: () => void }) {
  const done = c.progress >= c.goal
  return (
    <button type="button" className={`press ${s.row}`} style={tone(c)} data-done={done || undefined} onClick={onClick}>
      <span className={s.art}>
        <GameCover game={c.game} cover={gameCover(c.game)} title="" />
        {c.hard && <span className={s.hard}>Сложное</span>}
      </span>
      <span className={s.rowText}>
        <span className={s.rowTitle}>{c.title}</span>
        <span className={s.rowSub}>{c.text}</span>
        <Steps c={c} />
      </span>
      <span className={s.gain}>
        <b>+{num(c.power)}</b>
        <span>
          <Icon name="bolt" size={14} /> силы
        </span>
      </span>
    </button>
  )
}

function Seasonal({ c }: { c: Challenge }) {
  return (
    <article className={s.seasonal}>
      <span className={s.seasonalScene} aria-hidden>
        <span className={s.nextGlow} />
        {c.box && <img className={s.nextBox} src={seasonArt(c.box)} alt="" />}
      </span>
      <span className={s.seasonalText}>
        <span className={s.extraTag}>Одно на весь сезон</span>
        <h3>{c.title}</h3>
        <p>{c.text}</p>
      </span>
      <Steps c={c} />
      <span className={s.seasonalGain}>
        <Power value={c.power} plus /> и бокс
      </span>
    </article>
  )
}
