import { useSearchParams } from 'react-router'
import { Components } from './Components'
import { scenarioFrom, SCENARIOS, StoreProvider, type ScenarioId } from '../../data/store'
import { IosChromeView } from '../../components/IosChrome'
import { Home, HomeSkeleton } from '../Home/Home'
import { Tokens } from './Tokens'
import s from './Kit.module.css'

const TABS = [
  ['home', 'Главная'],
  ['components', 'Компоненты'],
  ['tokens', 'Токены'],
] as const

export function Kit() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'home'
  return (
    <main className={s.page}>
      <header className={s.header}>
        <img src="/assets/brand/logo-flame-white.png" alt="LIT Energy" width={32} height={48} />
        <h1>Витрина</h1>
      </header>
      <nav className={s.tabs} aria-label="Разделы витрины">
        {TABS.map(([id, name]) => (
          <button
            key={id}
            type="button"
            className={`press ${s.tab}`}
            aria-pressed={tab === id}
            onClick={() => setParams({ tab: id }, { replace: true })}
          >
            {name}
          </button>
        ))}
      </nav>
      {tab === 'home' && <HomeStates />}
      {tab === 'components' && <Components />}
      {tab === 'tokens' && <Tokens />}
    </main>
  )
}

const STATE_NAME: Record<ScenarioId, string> = {
  morning: 'Утро',
  day: 'День',
  evening: 'Вечер',
  eveningFreeze: 'Вечер, заморозка',
  done: 'Всё сделано',
}

/** Главная во всех состояниях. Прямая ссылка: /?state=morning */
function HomeStates() {
  const [params, setParams] = useSearchParams()
  const state = params.get('state')
  const loading = state === 'loading'
  const id = scenarioFrom(state)
  const pick = (next: string) => setParams({ tab: 'home', state: next }, { replace: true })
  return (
    <>
      <nav className={s.states} aria-label="Состояние главной">
        {SCENARIOS.map((x) => (
          <button key={x} type="button" className={`press ${s.tab}`} aria-pressed={!loading && x === id} onClick={() => pick(x)}>
            {STATE_NAME[x]}
          </button>
        ))}
        <button type="button" className={`press ${s.tab}`} aria-pressed={loading} onClick={() => pick('loading')}>
          Загрузка
        </button>
      </nav>
      <div className={s.frame}>
        <IosChromeView inline />
        {loading ? (
          <HomeSkeleton />
        ) : (
          <StoreProvider key={id} scenario={id}>
            <Home topBar={false} />
          </StoreProvider>
        )}
      </div>
    </>
  )
}
