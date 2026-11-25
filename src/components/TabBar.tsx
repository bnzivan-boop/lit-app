import { Icon, type IconName } from './Icon'
import s from './TabBar.module.css'

export type TabId = 'home' | 'tasks' | 'scan' | 'games' | 'shop'

const TABS: { id: Exclude<TabId, 'scan'>; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Главная', icon: 'home' },
  { id: 'tasks', label: 'Задания', icon: 'tasks' },
  { id: 'games', label: 'Игры', icon: 'games' },
  { id: 'shop', label: 'Магазин', icon: 'shop' },
]

type Props = {
  active?: TabId
  onSelect?: (id: TabId) => void
  /** false — в потоке страницы (витрина) */
  fixed?: boolean
  pressed?: TabId
  disabled?: TabId[]
  /** число на вкладке: сколько наград ждёт */
  badge?: Partial<Record<TabId, number>>
}

export function TabBar({ active, onSelect, fixed = true, pressed, disabled = [], badge = {} }: Props) {
  const tab = ({ id, label, icon }: (typeof TABS)[number]) => (
    <button
      key={id}
      type="button"
      className={`press ${s.tab}`}
      aria-current={active === id ? 'page' : undefined}
      data-pressed={pressed === id || undefined}
      disabled={disabled.includes(id)}
      onClick={() => onSelect?.(id)}
    >
      <span className={s.iconBox}>
        <Icon name={icon} />
        {Boolean(badge[id]) && <i aria-label={`наград: ${badge[id]}`}>{badge[id]}</i>}
      </span>
      {label}
    </button>
  )
  return (
    <nav className={`${s.bar} ${fixed ? s.fixed : ''}`} aria-label="Разделы">
      {TABS.slice(0, 2).map(tab)}
      <span className={s.scanCell}>
        <button
          type="button"
          className={`press ${s.scan}`}
          aria-label="Скан чека"
          data-pressed={pressed === 'scan' || undefined}
          disabled={disabled.includes('scan')}
          onClick={() => onSelect?.('scan')}
        >
          <Icon name="scan" size={26} />
        </button>
      </span>
      {TABS.slice(2).map(tab)}
    </nav>
  )
}
