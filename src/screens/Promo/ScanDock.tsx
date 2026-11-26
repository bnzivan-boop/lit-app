import { useRef } from 'react'
import { Icon } from '../../components/Icon'
import { plural } from '../../data/format'
import { usePanel } from '../../lib/usePanel'
import s from './ScanDock.module.css'

type Props = { tickets: number; boosted?: boolean; onClick: () => void; pressed?: boolean; inline?: boolean; page?: boolean }

/** Крупная «Сканировать чек» над нижней панелью: главное действие экрана акций */
export function ScanDock({ tickets, boosted, onClick, pressed, inline, page }: Props) {
  const plate = useRef<HTMLSpanElement>(null)
  const clip = usePanel(plate, { top: [10, 0], r: 22 })
  return (
    <div className={s.dock} data-inline={inline || undefined} data-page={page || undefined}>
      <button type="button" className={`press ${s.button}`} data-pressed={pressed || undefined} onClick={onClick}>
        <span ref={plate} className={s.plate} style={clip}>
          <i />
        </span>
        <span className={s.scan} aria-hidden>
          <Icon name="scan" size={30} />
          <i />
        </span>
        <span className={s.text}>
          <b>Сканировать чек</b>
          <span>{boosted ? 'хард, билет, продлит буст' : 'хард, билет и буст ×2'}</span>
        </span>
        {tickets > 0 && (
          <span className={s.tickets}>
            <b>{tickets}</b>
            {plural(tickets, ['билет', 'билета', 'билетов'])}
          </span>
        )}
      </button>
    </div>
  )
}
