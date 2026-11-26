import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { RewardScreen } from '../../components/RewardScreen'
import { Sheet } from '../../components/Sheet'
import { TopBar } from '../../components/TopBar'
import { num } from '../../data/format'
import { useStore } from '../../data/store'
import { useOrigin } from '../../lib/useOrigin'
import { Back } from '../Season/parts'
import s from './Levels.module.css'

const WAYS = [
  { title: 'В играх', text: 'XP за очки в каждом забеге', to: '/games', icon: 'games' },
  { title: 'В заданиях', text: 'Дневные, недельные и от партнёров', to: '/tasks', icon: 'tasks' },
  { title: 'За чеки', text: 'XP за каждый чек и буст ×2 на сутки', to: '/promo', icon: 'scan' },
] as const

/** Награды за уровень: каждый новый уровень даёт награду, её собирают здесь */
export function Levels() {
  const go = useNavigate()
  const back = useOrigin('/')
  const { levels, user, balance, claimLevel } = useStore()
  const snap = () => ({ ...balance, level: user.level, xp: user.xp, xpNext: user.xpNext })
  const [won, setWon] = useState<{ level: number; before: ReturnType<typeof snap> } | null>(null)
  const [ways, setWays] = useState(false)
  const list = useRef<HTMLOListElement>(null)

  /* сразу показываем первую несобранную награду или текущий уровень */
  useEffect(() => {
    list.current?.querySelector('[data-state="ready"], [data-now]')?.scrollIntoView({ block: 'center' })
  }, [])

  const collect = (level: number) => {
    setWon({ level, before: snap() })
    claimLevel(level)
  }
  const reward = won && levels.list.find((r) => r.level === won.level)

  return (
    <main className={s.page}>
      <TopBar nick="Награды за уровень" balance={balance} onBack={back} after={240} />
      <header className={s.hero}>
        <Back onClick={back} />
        <span className={s.flame} aria-hidden />
        <span className={s.kicker}>Твой уровень</span>
        <h1>Уровень {user.level}</h1>
        <p>до следующего {num(user.xpNext - user.xp)} XP</p>
        <div className={s.bar}>
          <LiquidBar value={user.xp - levels.from} max={user.xpNext - levels.from} label="Опыт" left={`${num(user.xp)} XP`} right={<span className={s.dim}>{num(user.xpNext)} XP</span>} />
        </div>
        <button type="button" className={`press ${s.ways}`} onClick={() => setWays(true)}>
          Где заработать XP
          <Icon name="chevron" size={16} />
        </button>
      </header>

      {levels.ready > 0 && (
        <p className={s.ready}>
          <b>{levels.ready}</b> {levels.ready === 1 ? 'награда ждёт' : 'награды ждут'} — собери
        </p>
      )}

      <ol ref={list} className={s.list}>
        {levels.list.map((r) => {
          const now = r.level === user.level
          return (
            <li key={r.level} className={s.item} data-state={r.state} data-now={now || undefined}>
              <span className={s.node} aria-hidden>
                {r.state === 'taken' ? <Icon name="check" size={16} /> : r.state === 'locked' ? <Icon name="lock" size={13} /> : <Icon name="box" size={16} />}
              </span>
              <div className={s.card}>
                <div className={s.cardText}>
                  <span className={s.level}>
                    Уровень {r.level}
                    {now && <span className={s.now}>ты здесь</span>}
                  </span>
                  <span className={s.from}>от {num(r.from)} XP</span>
                  <span className={s.reward}>
                    {r.hard ? <Amount value={r.hard} kind="hard" plus coin={20} /> : null}
                    {r.soft ? <Amount value={r.soft} kind="soft" plus coin={20} /> : null}
                  </span>
                </div>
                {r.state === 'ready' && (
                  <button type="button" className={`press ${s.take}`} onClick={() => collect(r.level)}>
                    Собрать
                  </button>
                )}
                {r.state === 'taken' && <span className={s.done}>Собрано</span>}
              </div>
            </li>
          )
        })}
      </ol>

      {ways && (
        <Sheet label="Где заработать XP" onClose={() => setWays(false)}>
          <div className={s.sheet}>
            <h2>Где заработать XP</h2>
            <ul>
              {WAYS.map((w) => (
                <li key={w.to}>
                  <button type="button" className="press" onClick={() => go(w.to)}>
                    <span className={s.wayIcon}>
                      <Icon name={w.icon} size={22} />
                    </span>
                    <span className={s.wayText}>
                      <b>{w.title}</b>
                      {w.text}
                    </span>
                    <Icon name="chevron" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Sheet>
      )}

      {won && reward && (
        <RewardScreen
          title={`Награда за ${won.level} уровень`}
          reward={{ soft: reward.soft, hard: reward.hard }}
          before={won.before}
          after={snap()}
          action="К наградам"
          onClose={() => setWon(null)}
        />
      )}
    </main>
  )
}
