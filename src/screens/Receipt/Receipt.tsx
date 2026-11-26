import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { BoostTile, TicketTile } from '../../components/RewardTiles'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Header } from '../../components/Header'
import { ReceiptTicket } from '../../components/ReceiptTicket'
import { useStore } from '../../data/store'
import { flyCoins, haptic, reduced } from '../../lib/motion'
import s from './Receipt.module.css'

const COINS = 16

/** Результат скана: чек печатается, «Забрать» отправляет хард в баланс */
export function Receipt() {
  const go = useNavigate()
  const { state } = useLocation()
  const back = useOrigin()
  const open = useOpen()
  const { receipt, user, balance, boost, promo } = useStore()
  const top = useRef<HTMLDivElement>(null)
  const total = useRef<HTMLSpanElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  /* сколько харда ещё не показано в шапке */
  const [held, setHeld] = useState(receipt?.hard ?? 0)
  const [phase, setPhase] = useState<'print' | 'ready' | 'taking'>('print')
  const leave = useRef(0)
  useEffect(() => () => clearTimeout(leave.current), [])

  if (!receipt) return <Navigate to="/scan" replace state={state} />

  function take() {
    if (phase !== 'ready' || !receipt) return
    const coin = top.current?.querySelector<HTMLElement>('img[alt="хард"]')
    haptic('press')
    setPhase('taking')
    const finish = () => {
      setHeld(0)
      haptic('done')
      leave.current = window.setTimeout(back, 450)
    }
    if (reduced() || !coin || !total.current || !layer.current) return finish()
    let landed = 0
    flyCoins(
      layer.current,
      total.current.getBoundingClientRect(),
      coin.getBoundingClientRect(),
      COINS,
      () => {
        landed++
        setHeld(receipt.hard - Math.round((receipt.hard * landed) / COINS))
        coin.animate([{ transform: 'scale(1.4)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' })
        if (landed % 3 === 0) haptic('land')
        if (landed === COINS) finish()
      },
      'hard',
    )
  }

  return (
    <div className={s.screen}>
      <div ref={top} className={s.header}>
        <Header {...user} balance={{ ...balance, hard: balance.hard - held }} onProfile={() => go('/profile')} />
      </div>
      <main className={s.main}>
        <ReceiptTicket receipt={receipt} totalRef={total} onPrinted={() => setPhase((p) => (p === 'print' ? 'ready' : p))} />
        <div className={`${s.rewards} ${phase === 'print' ? s.hidden : ''}`}>
          <BoostTile msLeft={boost.msLeft} extended={receipt.doubled} />
          <TicketTile count={receipt.tickets} total={promo.tickets} onClick={() => open('/promo/prizes')} />
        </div>
      </main>
      <footer className={`${s.actions} ${phase === 'print' ? s.hidden : ''}`}>
        <Button onClick={take} aria-busy={phase === 'taking'}>
          Забрать <Amount value={receipt.hard} kind="hard" plus coin={20} />
        </Button>
        <Button variant="secondary" onClick={() => go('/scan', { replace: true, state })} disabled={phase === 'taking'}>
          Ещё чек
        </Button>
      </footer>
      <div ref={layer} className={s.layer} aria-hidden />
    </div>
  )
}
