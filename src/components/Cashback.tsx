import { useState } from 'react'
import { num, plural } from '../data/format'
import { useStore } from '../data/store'
import { Amount } from './Amount'
import { Icon } from './Icon'
import { Sheet } from './Sheet'
import s from './Cashback.module.css'

const until = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

/** Строка «Кэшбек 25 за банку» — открывает окно с правилами. Если кэшбек увеличен, видно сразу */
export function CashbackLine({ className = '' }: { className?: string }) {
  const { cashback } = useStore()
  const [open, setOpen] = useState(false)
  const base = cashback.rates[0]
  const m = cashback.multiplier
  return (
    <>
      <button type="button" className={`press ${s.line} ${className}`} data-boost={m > 1 || undefined} onClick={() => setOpen(true)}>
        {m > 1 && <span className={s.mult}>×{m}</span>}
        <span className={s.lineText}>
          Кэшбек за товары LIT: <Amount value={base.hard * m} kind="hard" coin={15} /> за {base.unit}
        </span>
        <Icon name="info" size={18} />
      </button>
      {open && <CashbackSheet onClose={() => setOpen(false)} />}
    </>
  )
}

/** Окно о базовом кэшбеке: ставки за товары, пример, текущее увеличение */
export function CashbackSheet({ onClose }: { onClose: () => void }) {
  const { cashback } = useStore()
  const m = cashback.multiplier
  const can = cashback.rates[0]
  return (
    <Sheet label="Кэшбек за товары LIT" onClose={onClose}>
      <div className={s.sheet}>
        <h2>Кэшбек за LIT</h2>
        <p className={s.lead}>За каждый товар LIT в чеке ты точно получаешь хард. Задания дают награду сверху.</p>

        {cashback.boost && (
          <div className={s.boost}>
            <span className={s.boostMult}>×{m}</span>
            <span>
              <b>{cashback.boost.title}</b>
              Кэшбек увеличен в {m} {plural(m, ['раз', 'раза', 'раз'])} до {until(cashback.boost.endsAt)}
            </span>
          </div>
        )}

        <ul className={s.rates}>
          {cashback.rates.map((r) => (
            <li key={r.tag}>
              <img src={r.image} alt="" />
              <span className={s.rateName}>
                {r.title}
                <small>за {r.unit}</small>
              </span>
              <span className={s.rateSum}>
                {m > 1 && <s>{num(r.hard)}</s>}
                <Amount value={r.hard * m} kind="hard" coin={20} />
              </span>
            </li>
          ))}
        </ul>

        <p className={s.example}>
          Например, 3 банки — это <Amount value={can.hard * m * 3} kind="hard" coin={15} /> даже без заданий
        </p>
      </div>
    </Sheet>
  )
}
