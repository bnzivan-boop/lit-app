import { useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { Fire, type FireState } from '../../components/Fire'
import { useStore } from '../../data/store'
import { haptic, tween } from '../../lib/motion'
import { sparks } from '../../lib/sparks'
import s from './Done.module.css'

/** Заказ оформлен: огонь, две скрещённые ленты и что дальше */
export function Done() {
  const go = useNavigate()
  const { orders } = useStore()
  const order = orders[0]
  const root = useRef<HTMLElement>(null)
  const art = useRef<HTMLImageElement>(null)
  const fire = useRef<FireState>({ power: 0, burst: 0 })
  useEffect(() => {
    if (!root.current || !art.current) return
    haptic('done')
    const stop = [
      tween(900, (x) => (fire.current.power = 0.95 * x)),
      tween(800, (x) => (fire.current.burst = 1 - x)),
      sparks(root.current, art.current, 30),
    ]
    return () => stop.forEach((f) => f())
  }, [])
  if (!order) return <Navigate to="/shop" replace />
  return (
    <main ref={root} className={s.screen}>
      <div className={s.stage}>
        <Fire state={fire} className={s.fire} />
        <img ref={art} className={s.art} src="/assets/rewards/emblem.webp" alt="" />
        <span className={s.tape} data-back aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className={s.tape}>№ LIT-{order.number}</span>
      </div>
      <h1>Заказ оформлен</h1>
      <p>{order.delivery ? 'Скоро в «Моих заказах» появится, где он едет' : 'Код придёт в «Мои заказы»'}</p>
      <footer>
        <Button onClick={() => go('/orders', { replace: true, state: { from: '/shop' } })}>Мои заказы</Button>
        <Button variant="secondary" onClick={() => go('/shop', { replace: true })}>
          В магазин
        </Button>
      </footer>
    </main>
  )
}
