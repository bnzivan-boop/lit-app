import { num } from '../data/format'
import { LEAGUE_NAME } from '../data/labels'
import type { League } from '../data/types'
import { IconButton } from './Button'
import { Icon, type IconName } from './Icon'
import { Sheet } from './Sheet'
import s from './MenuSheet.module.css'

type Item = { id: string; title: string; group: string }

const ICON: Record<string, IconName> = {
  orders: 'shop',
  track: 'pin',
  notifications: 'bell',
  faq: 'question',
  support: 'chat',
  settings: 'gear',
  company: 'info',
  wheel: 'wheel',
  levels: 'box',
}

type Props = {
  user: { id: string; nick: string; avatar: string; level: number; league: League }
  items: Item[]
  /** пометка справа: «1 вращение» */
  badges?: Record<string, string>
  onSelect: (id: string) => void
  onCopyId: () => void
  onClose: () => void
}

export function MenuSheet({ user, items, badges = {}, onSelect, onCopyId, onClose }: Props) {
  const groups = [...new Set(items.map((i) => i.group))]
  return (
    <Sheet label="Меню" onClose={onClose}>
      <header className={s.head}>
        <button type="button" className={`press ${s.user}`} onClick={() => onSelect('profile')}>
          <span className={s.avatar}>
            <img src={user.avatar} alt="" />
          </span>
          <span className={s.name}>
            <b>{user.nick}</b>
            <span>
              {num(user.level)} уровень, {LEAGUE_NAME[user.league]}
            </span>
          </span>
        </button>
        <IconButton icon="close" label="Закрыть меню" onClick={onClose} className={s.close} />
      </header>

      <button type="button" className={`press ${s.id}`} onClick={onCopyId} aria-label={`Скопировать ID ${user.id}`}>
        <span>
          <small>ID игрока для розыгрышей</small>
          {user.id}
        </span>
        <Icon name="copy" size={20} />
      </button>

      <button type="button" className={`press ${s.friend}`} onClick={() => onSelect('friend')}>
        <Icon name="friend" size={24} />
        <span className={s.friendText}>Рассказать другу</span>
        {badges.friend && <span className={s.friendBadge}>{badges.friend}</span>}
        <Icon name="chevron" />
      </button>

      {groups.map((g) => (
        <ul key={g} className={s.list}>
          {items
            .filter((i) => i.group === g)
            .map((i) => (
              <li key={i.id}>
                <button type="button" className={s.row} onClick={() => onSelect(i.id)}>
                  <span className={s.icon}>
                    <Icon name={ICON[i.id] ?? 'info'} size={18} />
                  </span>
                  <span className={s.title}>
                    {i.title}
                    {badges[i.id] && <span className={s.badge}>{badges[i.id]}</span>}
                  </span>
                  <Icon name="chevron" size={16} />
                </button>
              </li>
            ))}
        </ul>
      ))}

      <button type="button" className={`press ${s.remove}`} onClick={() => onSelect('delete')}>
        Удалить аккаунт
      </button>
    </Sheet>
  )
}
