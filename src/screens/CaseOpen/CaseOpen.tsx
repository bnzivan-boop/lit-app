import { useEffect, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { LootCard } from '../../components/LootCard'
import { RARITY_NAME } from '../../data/labels'
import { BOX_CASE } from '../../data/games'
import { LOOT, rollLoot, useStore, type Loot } from '../../data/store'
import { haptic, reduced } from '../../lib/motion'
import { useOrigin } from '../../lib/useOrigin'
import { MultiWin } from './MultiWin'
import { Reel } from './Reel'
import { Slots } from './Slots'
import { Win } from './Win'
import s from './CaseOpen.module.css'

type Phase = 'idle' | 'charge' | 'spin' | 'win'

const COUNTS = [1, 2, 3, 4, 5, 10]

/** Кейс: содержимое и количество → замах → рулетка или слоты → выигрыш.
    ?win=legend | epic | rare | common или id приза — задать выигрыш для показа, ?soft=5000 — баланс */
export function CaseOpen() {
  const leave = useOrigin()
  const { id } = useParams()
  const [params] = useSearchParams()
  const { cases, balance, openCase, gameBox } = useStore()
  const item = cases.find((c) => c.id === id)
  const [phase, setPhase] = useState<Phase>('idle')
  const [picked, setPicked] = useState(1)
  const [loots, setLoots] = useState<Loot[]>([])
  /* растёт с каждым открытием: экран выигрыша всегда новый */
  const [round, setRound] = useState(0)
  /* софт, который ещё не долетел до баланса */
  const [held, setHeld] = useState(0)

  useEffect(() => {
    if (phase !== 'charge') return
    const t = setTimeout(() => setPhase('spin'), 620)
    return () => clearTimeout(t)
  }, [phase])

  if (!item) return <Navigate to="/" replace />
  const price = item.price.soft
  /* выиграл в игре: один раз бесплатно */
  const free = gameBox.free > 0 && item.id === BOX_CASE
  const affordable = Math.floor(balance.soft / price)
  const count = free ? 1 : Math.min(picked, Math.max(1, affordable))
  const total = free ? 0 : price * count
  const missing = free ? 0 : price - balance.soft

  function open() {
    if (!free && affordable < 1) return
    const wanted = LOOT.filter((l) => [l.rarity, l.id].includes(params.get('win') ?? ''))
    /* заданный для показа приз — первым, остальные случайные */
    const prizes = Array.from({ length: count }, (_, i) =>
      i === 0 && wanted.length ? wanted[Math.floor(Math.random() * wanted.length)] : rollLoot(),
    )
    setLoots(prizes)
    setRound((n) => n + 1)
    setHeld(prizes.reduce((sum, l) => sum + (l.kind === 'soft' ? (l.amount ?? 0) : 0), 0))
    openCase(total, prizes, free)
    haptic('press')
    setPhase(reduced() ? 'win' : 'charge')
  }

  if (phase === 'win' && loots.length > 0) {
    const props = { price, count, balance: balance.soft, held, onHeld: setHeld, onAgain: open, onClose: leave }
    return loots.length === 1 ? <Win key={round} loot={loots[0]} {...props} /> : <MultiWin key={round} loots={loots} {...props} />
  }

  const done = () => {
    haptic('done')
    setPhase('win')
  }

  return (
    <main className={`${s.screen} ${s[item.rarity]}`} data-phase={phase}>
      <header className={s.top}>
        <button type="button" className={`press ${s.close}`} aria-label="Назад" onClick={leave} disabled={phase !== 'idle'}>
          <Icon name="close" size={22} />
        </button>
        <span className={s.balance}>
          <Amount value={balance.soft - held} kind="soft" coin={20} />
        </span>
      </header>

      <div className={s.stage}>
        <span className={s.glow} aria-hidden />
        <span className={s.flame} aria-hidden />
        <div className={s.name}>
          <h1>{item.title}</h1>
          <p>Mystery box, {RARITY_NAME[item.rarity].toLowerCase()}</p>
        </div>
        <img className={s.box} src={item.image} alt="" />
        <span className={s.flash} aria-hidden />
        {phase === 'spin' &&
          (loots.length === 1 ? (
            <Reel key={round} loot={loots[0]} onDone={done} />
          ) : (
            <Slots key={round} loots={loots} onDone={done} />
          ))}
      </div>

      <section className={s.panel}>
        <h2>Что внутри</h2>
        <div className={s.loot}>
          {LOOT.map((l) => (
            <LootCard key={l.id} loot={l} />
          ))}
        </div>
        {missing <= 0 && !free && (
          <div className={s.counts} role="radiogroup" aria-label="Сколько открыть">
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={count === n}
                className={`press ${s.count}`}
                disabled={n > affordable}
                onClick={() => setPicked(n)}
              >
                ×{n}
              </button>
            ))}
          </div>
        )}
        <div className={s.action}>
          {free ? (
            <Button onClick={open}>Открыть бесплатно</Button>
          ) : missing > 0 ? (
            <>
              <Button disabled>
                Не хватает <Amount value={missing} kind="soft" coin={20} />
              </Button>
              <p>Софт дают заряд, задания и игры</p>
            </>
          ) : (
            <Button onClick={open}>
              {count === 1 ? 'Открыть за' : `Открыть ${count} за`} <Amount value={total} kind="soft" coin={20} />
            </Button>
          )}
        </div>
      </section>
    </main>
  )
}
