import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '../../components/Button'
import { CaseCard, CaseCardSkeleton, CaseCarousel } from '../../components/CaseCard'
import { DropBar } from '../../components/DropBar'
import type { FireState } from '../../components/Fire'
import { Hero, HeroSkeleton } from '../../components/Hero'
import { SegmentBar } from '../../components/ProgressBar'
import { PromoBanner } from '../../components/PromoBanner'
import { Skeleton } from '../../components/Skeleton'
import { MenuSheet } from '../../components/MenuSheet'
import { Stats, StatsSkeleton } from '../../components/Stats'
import { DeleteSheet } from '../Account/DeleteSheet'
import { TaskTile, TaskTileSkeleton, TaskTrio } from '../../components/TaskTile'
import { Toast } from '../../components/Toast'
import { TopBar } from '../../components/TopBar'
import { ChargeTile, StreakTile, TileSkeleton } from '../../components/Tiles'
import { duration } from '../../data/format'
import { gameCover, useStore, type Store } from '../../data/store'
import { copyText } from '../../lib/copy'
import { flyCoins, haptic, reduced, tween } from '../../lib/motion'
import { useOpen } from '../../lib/useOrigin'
import s from './Home.module.css'

const MENU_PATH: Record<string, string> = { orders: '/orders', track: '/orders', friend: '/friends' }

const COINS = 16
/* огонь горит всегда, заряд его усиливает */
const firePower = (part: number) => 0.45 + 0.45 * part

export function Home({ topBar = true }: { topBar?: boolean }) {
  const store = useStore()
  const go = useNavigate()
  const open = useOpen()
  const { user, balance, charge, streak, action, banners } = store
  const { fire, head, tile, softCoin, layer, soft, collect } = useCollect(store)
  /* из раздела меню возвращаемся в открытое меню */
  const [params, setParams] = useSearchParams()
  const [menu, setMenuOn] = useState(params.has('menu'))
  const [leaving, setLeaving] = useState(false)
  const setMenu = (on: boolean) => {
    setMenuOn(on)
    if (!on && params.has('menu')) {
      params.delete('menu')
      setParams(params, { replace: true, state: { restore: true } })
    }
  }
  const openFromMenu = useOpen('/?menu=1')
  const [toast, setToast] = useState('')
  const clearToast = useCallback(() => setToast(''), [])
  const copyId = async () => {
    const ok = await copyText(user.id)
    if (ok) haptic('land')
    setToast(ok ? 'ID скопирован' : 'Не получилось скопировать')
  }
  const play = (game: string) => open(`/games/${game}/play`)

  return (
    <main className={s.main}>
      {topBar && <TopBar nick={user.nick} balance={{ ...balance, soft }} onMenu={() => setMenu(true)} />}
      <Hero
        {...user}
        boost={store.boost.msLeft > 0 ? duration(store.boost.msLeft / 60_000) : undefined}
        balance={{ ...balance, soft }}
        fire={fire}
        head={head}
        softCoin={softCoin}
        onProfile={() => go('/profile')}
        onMenu={() => setMenu(true)}
        onCopyId={copyId}
      />

      <div className={s.tiles}>
        <ChargeTile ref={tile} {...charge} main={action.kind === 'charge'} onCollect={collect} />
        <StreakTile {...streak} onSave={() => action.kind === 'streak' && play(action.game)} />
      </div>

      {banners.map((b) => (
        <PromoBanner key={b.image} {...b} onClick={() => go('/tasks')} />
      ))}

      <DailyTasks store={store} onPlay={play} onScan={() => open('/scan')} />

      <section className={s.section}>
        <h2>Кейсы</h2>
        <CaseCarousel>
          {store.cases.map((c) => (
            <CaseCard
              key={c.id}
              title={c.title}
              rarity={c.rarity}
              price={c.price.soft}
              image={c.image}
              balance={balance.soft}
              onOpen={() => open(`/case/${c.id}`)}
            />
          ))}
        </CaseCarousel>
        <DropBar {...store.drop} remind={store.remindDrop} onRemind={store.toggleRemind} onOpen={() => open('/drop')} />
      </section>

      <section className={s.section}>
        <h2>Твоя статистика</h2>
        <Stats items={store.stats} />
      </section>

      {menu && (
        <MenuSheet
          user={user}
          items={store.menu}
          onCopyId={copyId}
          onClose={() => setMenu(false)}
          badges={{ wheel: store.wheel.spun ? '' : 'Крутить', friend: store.referral.ready > 0 ? `Собрать ${store.referral.ready}` : '' }}
          onSelect={(id) => {
            if (id === 'delete') return setLeaving(true)
            if (id === 'profile' || id === 'wheel') return go(`/${id}`)
            openFromMenu(MENU_PATH[id] ?? `/${id}`)
          }}
        />
      )}
      {leaving && <DeleteSheet onClose={() => setLeaving(false)} />}
      {toast && <Toast text={toast} ok={toast === 'ID скопирован'} onDone={clearToast} />}
      <div ref={layer} className={s.layer} aria-hidden />
    </main>
  )
}

/** Сбор заряда: вспышка огня, полёт монет, баланс растёт с каждой прилетевшей */
function useCollect({ charge, balance, collect: commit }: Store) {
  const fire = useRef<FireState>({ power: 0, burst: 0 })
  const head = useRef<HTMLImageElement>(null)
  const tile = useRef<HTMLButtonElement>(null)
  const softCoin = useRef<HTMLSpanElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  /* сколько ещё летит: настоящий баланс уже обновлён, на экране он догоняет */
  const [inFlight, setInFlight] = useState(0)
  const part = charge.current / charge.max
  const firstPart = useRef(part)

  useEffect(() => tween(1000, (k) => (fire.current.power = firePower(firstPart.current) * k)), [])

  function collect() {
    if (inFlight > 0 || charge.current === 0) return
    const amount = charge.current
    const from = fire.current.power
    haptic('press')
    commit()
    if (reduced() || !tile.current || !softCoin.current || !layer.current) {
      fire.current.power = firePower(0)
      haptic('done')
      return
    }
    setInFlight(amount)
    tween(700, (k) => (fire.current.burst = 1 - k))
    tween(1400, (k) => (fire.current.power = from + (firePower(0) - from) * k))
    head.current?.animate([{ transform: 'none' }, { transform: 'scale(1.06)', offset: 0.2 }, { transform: 'none' }], {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    })
    const coin = softCoin.current
    let landed = 0
    flyCoins(layer.current, tile.current.getBoundingClientRect(), coin.getBoundingClientRect(), COINS, () => {
      landed++
      setInFlight(amount - Math.round((amount * landed) / COINS))
      coin.animate([{ transform: 'scale(1.35)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' })
      if (landed % 3 === 0) haptic('land')
      if (landed === COINS) haptic('done')
    })
  }

  return { fire, head, tile, softCoin, layer, soft: balance.soft - inFlight, collect }
}

type TasksProps = { store: Store; onPlay: (game: string) => void; onScan: () => void }

function DailyTasks({ store, onPlay, onScan }: TasksProps) {
  const go = useNavigate()
  const { tasks, doneCount, action } = store
  const allDone = doneCount === tasks.length
  return (
    <section className={s.section}>
      <header className={s.head}>
        <h2>Задания дня</h2>
        <span className={s.chest}>
          <img src="/assets/cases/chest.webp" alt="" />
          <span className={s.chestText}>
          {allDone ? 'сундук твой' : 'до сундука'}
          <span className={s.dots}>
            <SegmentBar
              segments={tasks.map((_, i) => (i < doneCount ? 'done' : 'idle'))}
              label={`Выполнено ${doneCount} из ${tasks.length}`}
            />
          </span>
          </span>
        </span>
      </header>
      <TaskTrio>
        {tasks.map((t) => {
          const receipt = t.type === 'receipt'
          return (
            <TaskTile
              key={t.id}
              title={t.short}
              hint={t.hint}
              label={t.title}
              reward={t.reward}
              game={t.game}
              cover={gameCover(t.game)}
              receipt={receipt}
              boost={Boolean(t.bonus)}
              progress={{ value: t.progress, goal: t.goal }}
              done={t.status === 'claimed'}
              ready={t.status === 'ready'}
              main={!t.done && ((action.kind === 'task' && action.id === t.id) || (action.kind === 'receipt' && receipt))}
              onClick={() => (t.done ? go(`/tasks?open=${t.id}`) : receipt ? onScan() : t.game && onPlay(t.game))}
            />
          )
        })}
      </TaskTrio>
      {allDone && action.kind === 'receipt' && (
        <div className={s.receipt}>
          <Button onClick={onScan}>Отсканировать чек</Button>
          <p>Буст ×2 к силе и XP на 24 часа</p>
        </div>
      )}
    </section>
  )
}

export function HomeSkeleton() {
  return (
    <main className={s.main} aria-busy>
      <HeroSkeleton />
      <div className={s.tiles}>
        <TileSkeleton />
        <TileSkeleton />
      </div>
      <Skeleton h={139} r="var(--r-card)" />
      <section className={s.section}>
        <h2>Задания дня</h2>
        <TaskTrio>
          <TaskTileSkeleton />
          <TaskTileSkeleton />
          <TaskTileSkeleton />
        </TaskTrio>
      </section>
      <section className={s.section}>
        <h2>Кейсы</h2>
        <CaseCardSkeleton />
      </section>
      <section className={s.section}>
        <h2>Твоя статистика</h2>
        <StatsSkeleton />
      </section>
    </main>
  )
}
