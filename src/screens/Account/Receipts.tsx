import { useState } from 'react'
import mock from '../../../data/mock.json'
import { Amount } from '../../components/Amount'
import { Screen } from '../../components/Screen'
import { Sheet } from '../../components/Sheet'
import { Toast } from '../../components/Toast'
import { num, plural } from '../../data/format'
import { copyText } from '../../lib/copy'
import { haptic } from '../../lib/motion'
import { useOrigin } from '../../lib/useOrigin'
import s from './Receipts.module.css'

type Receipt = { id: string; at: string; shop: string; fd: string; fn: string; fp: string; sum: number; items: number; hard: number; status: 'ok' | 'review' | 'rejected'; reason?: string }
const RECEIPTS = mock.receipts as Receipt[]

const STATUS = { ok: 'Принят', review: 'На проверке', rejected: 'Отклонён' } as const
const day = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const time = (iso: string) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

/** Отсканированные чеки: номер (ФД), магазин, сумма, что начислено, статус. Нажатие — все реквизиты */
export function Receipts() {
  const back = useOrigin('/')
  const [open, setOpen] = useState<Receipt | null>(null)
  const [toast, setToast] = useState('')

  async function copy(r: Receipt) {
    const ok = await copyText(`ФН ${r.fn} ФД ${r.fd} ФП ${r.fp}`)
    if (ok) haptic('land')
    setToast(ok ? 'Реквизиты скопированы' : 'Не получилось скопировать')
  }

  return (
    <Screen title="Отсканированные чеки" onBack={back}>
      <p className={s.lead}>Если чек на проверке, хард и прогресс заданий начислятся после неё — даже если задание уже закончилось.</p>
      <ul className={s.list}>
        {RECEIPTS.map((r) => (
          <li key={r.id}>
            <button type="button" className={`press ${s.card}`} data-status={r.status} onClick={() => setOpen(r)}>
              <span className={s.top}>
                <b>Чек № {r.fd}</b>
                <span className={s.status}>{STATUS[r.status]}</span>
              </span>
              <span className={s.meta}>
                {r.shop} · {day(r.at)}, {time(r.at)}
              </span>
              <span className={s.bottom}>
                <span>
                  {num(r.sum)} ₽{r.items ? ` · ${r.items} ${plural(r.items, ['товар', 'товара', 'товаров'])} LIT` : ''}
                </span>
                {r.status === 'rejected' ? <span className={s.reason}>{r.reason}</span> : <Amount value={r.hard} kind="hard" plus coin={18} />}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <Sheet label={`Чек № ${open.fd}`} onClose={() => setOpen(null)}>
          <div className={s.sheet}>
            <h2>Чек № {open.fd}</h2>
            <span className={s.status} data-status={open.status}>
              {STATUS[open.status]}
            </span>
            <dl>
              {[
                ['Магазин', open.shop],
                ['Дата', `${day(open.at)}, ${time(open.at)}`],
                ['Сумма', `${num(open.sum)} ₽`],
                ['Товаров LIT', String(open.items)],
                ['ФН', open.fn],
                ['ФД', open.fd],
                ['ФП', open.fp],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {open.reason && <p className={s.reasonBig}>{open.reason}</p>}
            <button type="button" className={`press ${s.copy}`} onClick={() => copy(open)}>
              Скопировать реквизиты
            </button>
          </div>
        </Sheet>
      )}
      {toast && <Toast text={toast} ok={!toast.startsWith('Не')} onDone={() => setToast('')} />}
    </Screen>
  )
}
