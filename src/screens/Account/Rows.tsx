import type { ReactNode } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import s from './Rows.module.css'

/** Группа строк, как в настройках iOS */
export function Rows({ title, note, children }: { title?: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className={s.group}>
      {title && <h2>{title}</h2>}
      <ul className={s.list}>{children}</ul>
      {note && <p className={s.note}>{note}</p>}
    </section>
  )
}

type RowProps = { icon: IconName; title: string; value?: ReactNode; end?: IconName; onClick?: () => void }

export function Row({ icon, title, value, end = 'chevron', onClick }: RowProps) {
  const body = (
    <>
      <span className={s.icon}>
        <Icon name={icon} size={20} />
      </span>
      <span className={s.text}>
        <b>{title}</b>
        {value && <span>{value}</span>}
      </span>
      {onClick && <Icon name={end} size={18} />}
    </>
  )
  return (
    <li>
      {onClick ? (
        <button type="button" className={s.row} onClick={onClick}>
          {body}
        </button>
      ) : (
        <div className={s.row}>{body}</div>
      )}
    </li>
  )
}

type SwitchProps = { icon: IconName; title: string; value?: string; on: boolean; disabled?: boolean; onChange: (on: boolean) => void }

export function SwitchRow({ icon, title, value, on, disabled, onChange }: SwitchProps) {
  return (
    <li>
      <button type="button" role="switch" aria-checked={on} disabled={disabled} className={s.row} onClick={() => onChange(!on)}>
        <span className={s.icon}>
          <Icon name={icon} size={20} />
        </span>
        <span className={s.text}>
          <b>{title}</b>
          {value && <span>{value}</span>}
        </span>
        <span className={s.switch} aria-hidden />
      </button>
    </li>
  )
}
