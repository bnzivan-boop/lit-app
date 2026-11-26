import { useState } from 'react'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { RewardScreen } from '../../components/RewardScreen'
import { TopBar } from '../../components/TopBar'
import { num, plural } from '../../data/format'
import { useStore } from '../../data/store'
import { useOrigin } from '../../lib/useOrigin'
import { Back } from '../Season/parts'
import { useToMidnight } from './AdventBanner'
import s from './Advent.module.css'

const WEEK = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

type Cell = { day: number; month: 'prev' | 'dec' | 'next' }

/** Сетка декабря по неделям с понедельника, края — дни соседних месяцев */
function grid(year: number): Cell[] {
  const shift = (new Date(year, 11, 1).getDay() + 6) % 7
  const prevLast = new Date(year, 11, 0).getDate()
  const cells: Cell[] = Array.from({ length: shift }, (_, i) => ({ day: prevLast - shift + 1 + i, month: 'prev' }))
  for (let d = 1; d <= 31; d++) cells.push({ day: d, month: 'dec' })
  for (let d = 1; cells.length % 7; d++) cells.push({ day: d, month: 'next' })
  return cells
}

/** Адвент-календарь: подарок каждый день 1–24 декабря, возврат пропущенных, главный приз за все 24 */
export function Advent() {
  const back = useOrigin('/')
  const { advent: a, balance, user, now, collectAdvent } = useStore()
  const snap = () => ({ ...balance, level: user.level, xp: user.xp, xpNext: user.xpNext })
  const [won, setWon] = useState<{ day: number; before: ReturnType<typeof snap> } | null>(null)
  const left = useToMidnight(now)
  const taken = a.taken.length

  const collect = (day: number) => {
    setWon({ day, before: snap() })
    collectAdvent(day)
  }

  const stateOf = (c: Cell) => {
    if (c.month !== 'dec') return 'out'
    if (a.taken.includes(c.day)) return 'taken'
    if (c.day > a.gifts) return 'closed'
    if (c.day === a.today) return 'today'
    if (c.day < a.today) return 'missed'
    return 'closed'
  }

  return (
    <main className={s.page}>
      <TopBar nick={a.title} balance={balance} onBack={back} after={220} />
      <header className={s.hero}>
        <Back onClick={back} />
        <img className={s.gift} src="/assets/advent/gift.webp" alt="" />
        <div className={s.heroText}>
          <h1>{a.title}</h1>
          <p>
            <b>{taken}</b> из {a.gifts} собрано
          </p>
        </div>
      </header>

      <section className={s.today}>
        {a.todayReady ? (
          <>
            <span className={s.todayText}>
              <span className={s.todayLabel}>{a.today} декабря · подарок дня</span>
              <span className={s.inside}>
                <Amount value={a.reward.soft} kind="soft" /> <Amount value={a.reward.hard} kind="hard" />
              </span>
            </span>
            <Button size="sm" className={s.take} onClick={() => collect(a.today)}>
              Собрать
            </Button>
          </>
        ) : (
          <>
            <span className={s.todayText}>
              <span className={s.todayLabel}>Подарок дня у тебя</span>
              <span className={s.inside}>новый через</span>
            </span>
            <span className={s.bigTimer}>{left}</span>
          </>
        )}
      </section>

      <div className={s.week} aria-hidden>
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <ol className={s.grid}>
        {grid(a.year).map((c, i) => {
          const st = stateOf(c)
          const canRestore = st === 'missed' && a.restoreLeft > 0
          const label = `${c.day} ${c.month === 'dec' ? 'декабря' : ''}`
          return (
            <li key={i}>
              <button
                type="button"
                className={`press ${s.cell}`}
                data-state={st}
                data-restore={canRestore || undefined}
                disabled={!(st === 'today' || canRestore)}
                aria-label={`${label}: ${{ out: 'другой месяц', taken: 'забрано', closed: 'закрыто', today: 'сегодня, собрать', missed: canRestore ? 'пропущено, можно вернуть' : 'пропущено' }[st]}`}
                onClick={() => collect(c.day)}
              >
                <span className={s.num}>{c.day}</span>
                {st !== 'out' && (
                  <i className={s.mark}>
                    {st === 'taken' && <Icon name="check" size={16} />}
                    {st === 'today' && <Icon name="flame" size={15} />}
                    {st === 'missed' && <Icon name="close" size={13} />}
                    {st === 'closed' && <Icon name="lock" size={12} />}
                  </i>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      <ul className={s.legend}>
        <li data-state="today">
          <i>
            <Icon name="flame" size={13} />
          </i>
          Сегодня
        </li>
        <li data-state="missed">
          <i>
            <Icon name="close" size={11} />
          </i>
          Пропущено
        </li>
        <li data-state="taken">
          <i>
            <Icon name="check" size={13} />
          </i>
          Забрано
        </li>
        <li data-state="closed">
          <i>
            <Icon name="lock" size={11} />
          </i>
          Закрыто
        </li>
      </ul>

      {a.missed.length > 0 && a.restoreLeft > 0 && (
        <p className={s.restore}>
          <Icon name="close" size={14} />
          Можно вернуть {a.restoreLeft} {plural(a.restoreLeft, ['пропущенный день', 'пропущенных дня', 'пропущенных дней'])} — нажми на него в календаре
        </p>
      )}


      <section className={s.prize}>
        <img className={s.prizeArt} src="/assets/advent/gift.webp" alt="" />
        <span className={s.prizeTag}>Главный приз</span>
        <h2>Новогодний розыгрыш</h2>
        <p>Собери все {a.gifts} подарка — и ты в розыгрыше</p>
        <LiquidBar value={taken} max={a.gifts} label="Собрано подарков" left={`${taken} из ${a.gifts}`} right={<span className={s.dim}>ещё {num(a.gifts - taken)}</span>} />
      </section>

      <section className={s.rules}>
        <h2>Правила акции</h2>
        <dl>
          {a.rules.map((r) => (
            <div key={r.when}>
              <dt>{r.when}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {won && (
        <RewardScreen
          title={`Подарок ${won.day} декабря`}
          reward={a.reward}
          image="/assets/advent/gift.webp"
          photo
          before={won.before}
          after={snap()}
          action="К календарю"
          onClose={() => setWon(null)}
        />
      )}
    </main>
  )
}
