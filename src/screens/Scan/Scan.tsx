import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useOrigin } from '../../lib/useOrigin'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Qr } from '../../components/Qr'
import { useStore } from '../../data/store'
import { haptic } from '../../lib/motion'
import s from './Scan.module.css'

type Phase = 'aim' | 'lock' | 'error'

const ERRORS = {
  empty: ['В чеке нет LIT', 'Нужен чек, где есть хотя бы один товар LIT Energy'],
  used: ['Чек уже добавлен', 'Этот чек уже принёс хард. Отсканируй другой'],
  unread: ['QR не читается', 'Разгладь чек и поднеси телефон ближе'],
} as const

const isError = (v: string | null): v is keyof typeof ERRORS => Boolean(v && v in ERRORS)

/* Камеры в прототипе нет: в кадре нарисованный чек, QR «находится» сам.
   Ошибки: /scan?error=empty | used | unread */
export function Scan() {
  const go = useNavigate()
  /* откуда пришли, туда и вернёмся: и с камеры, и после чека */
  const { state } = useLocation()
  const back = useOrigin()
  const [params] = useSearchParams()
  const { scanReceipt, boost } = useStore()
  const failure = params.get('error')
  const [phase, setPhase] = useState<Phase>('aim')
  const scan = useRef(scanReceipt)
  useEffect(() => {
    scan.current = scanReceipt
  })

  useEffect(() => {
    if (phase === 'error') return
    if (phase === 'aim') {
      const t = setTimeout(() => {
        haptic('press')
        setPhase(isError(failure) ? 'error' : 'lock')
      }, 2400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      haptic('done')
      scan.current()
      go('/receipt', { replace: true, state })
    }, 900)
    return () => clearTimeout(t)
  }, [phase, failure, go, state])

  function retry() {
    setPhase('aim')
    go('/scan', { replace: true, state })
  }

  return (
    <main className={s.screen} data-phase={phase}>
      <header className={s.top}>
        <button type="button" className={`press ${s.back}`} aria-label="Назад" onClick={back}>
          <Icon name="close" size={22} />
        </button>
        <h1>Скан чека</h1>
      </header>

      <div className={s.view}>
        <div className={s.hand} aria-hidden>
          <div className={s.paper}>
            <p className={s.shop}>КАССОВЫЙ ЧЕК</p>
            <p className={s.line}>
              <span>LIT ENERGY ЛИМОНАД ×2</span>
              <span>178.00</span>
            </p>
            <p className={s.line}>
              <span>LIT ENERGY ЧИПСЫ</span>
              <span>119.00</span>
            </p>
            <p className={s.line}>
              <span>БАТОН НАРЕЗНОЙ</span>
              <span>46.00</span>
            </p>
            <p className={`${s.line} ${s.total}`}>
              <span>ИТОГ</span>
              <span>343.00</span>
            </p>
            <Qr className={s.qr} />
            <p className={s.fine}>ФН 0000000000 ФД 000000</p>
          </div>
        </div>
        <div className={s.frame} aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <span className={s.laser} />
        </div>
        <p className={s.hint} role="status">
          {phase === 'lock' ? 'Нашёл чек' : phase === 'aim' ? 'Наведи на QR-код' : ''}
        </p>
      </div>

      {phase === 'error' && isError(failure) ? (
        <section className={s.panel} role="alert">
          <h2>{ERRORS[failure][0]}</h2>
          <p className={s.text}>{ERRORS[failure][1]}</p>
          <div className={s.action}>
            <Button onClick={retry}>Попробовать ещё</Button>
          </div>
        </section>
      ) : (
        <section className={s.panel}>
          <h2>За каждый чек</h2>
          <ul className={s.gains}>
            <li>
              <b>
                <Amount value={25} kind="hard" coin={20} />
              </b>
              и больше за каждый товар LIT
            </li>
            <li>
              <b>×2</b>
              {boost.msLeft > 0 ? 'буст продлится на 24 часа' : 'к силе и XP на 24 часа'}
            </li>
            <li>
              <b>
                <Icon name="ticket" size={26} />
              </b>
              билет в розыгрыш
            </li>
          </ul>
        </section>
      )}
    </main>
  )
}
