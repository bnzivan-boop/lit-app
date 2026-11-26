import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/TopBar'
import { num } from '../../data/format'
import { leagueArt, leagueOf, seasonArt, SEASON } from '../../data/season'
import { useStore } from '../../data/store'
import { useOrigin } from '../../lib/useOrigin'
import { Back, metal, Power } from './parts'
import s from './About.module.css'

const ends = new Date(SEASON.endsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

const RULES = [
  'Все начинают сезон в Бронзе с нулём силы Титана',
  'Силу дают испытания Титана: ежедневные, еженедельные и одно сезонное. Почти все — в играх',
  'Сложные испытания дают больше силы',
  'Лига растёт от набранной силы и вниз не падает',
  'Сила открывает базовые награды, товары LIT из чеков — дополнительные',
]

/** О сезоне: пять лиг по порогам силы и правила */
export function About() {
  const go = useNavigate()
  const back = useOrigin('/season')
  const { balance } = useStore()
  const power = SEASON.power
  const { league } = leagueOf(power)
  const at = SEASON.leagues.findIndex((l) => l.id === league.id)

  return (
    <main className={s.page}>
      <TopBar nick="О сезоне" balance={balance} onBack={back} after={200} />
      <section className={s.hero}>
        <img src={seasonArt('titan')} alt="" />
        <Back onClick={back} />
      </section>

      <header className={s.head}>
        <h1>Лиги сезона</h1>
        <p>
          Сезон «{SEASON.title}» идёт до {ends}. Набирай силу Титана и поднимайся от Бронзы до Бриллианта
        </p>
        <span className={s.mine}>
          у тебя <Power value={power} />
        </span>
      </header>

      <ol className={s.leagues}>
        {SEASON.leagues.map((l, i) => {
          const state = i < at ? 'past' : i === at ? 'now' : 'next'
          return (
            <li key={l.id} className={s.league} style={metal(l.id)} data-state={state}>
              <img src={leagueArt(l.id)} alt="" />
              <span className={s.text}>
                <span className={s.label}>{state === 'now' ? 'Твоя лига' : state === 'past' ? 'Пройдена' : l.from ? `с ${num(l.from)} силы` : 'старт'}</span>
                <b>{l.name}</b>
                {state === 'next' && <span className={s.left}>ещё {num(l.from - power)}</span>}
              </span>
              {state === 'past' && (
                <i className={s.mark}>
                  <Icon name="check" size={18} />
                </i>
              )}
            </li>
          )
        })}
      </ol>

      <section className={s.section}>
        <h2>Как это работает</h2>
        <ol className={s.rules}>
          {RULES.map((r, i) => (
            <li key={r}>
              <b>{i + 1}</b>
              {r}
            </li>
          ))}
        </ol>
      </section>

      <div className={s.dock}>
        <Button onClick={() => go('/season/rewards')}>Смотреть награды</Button>
      </div>
    </main>
  )
}
