import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { LiquidBar } from '../../components/LiquidBar'
import { TopBar } from '../../components/TopBar'
import { left, num } from '../../data/format'
import { PROMOS } from '../../data/promos'
import { useStore } from '../../data/store'
import { useOpen } from '../../lib/useOrigin'
import { PromoCard } from './PromoCard'
import { ScanDock } from './ScanDock'
import s from './PromoHub.module.css'

/** Чеки и акции: центральная кнопка меню ведёт сюда. Баннеры акций и крупная «Сканировать чек» на одном экране */
export function PromoHub() {
  const go = useNavigate()
  const open = useOpen()
  const { user, balance, now, promo, boost } = useStore()
  return (
    <main className={s.main}>
      <TopBar nick="Чеки и акции" balance={balance} after={70} />
      <header className={s.who}>
        <button type="button" className={`press ${s.avatar}`} aria-label={`Профиль: ${user.nick}`} onClick={() => go('/profile')}>
          <img src={user.avatar} alt="" />
        </button>
        <div className={s.mid}>
          <span className={s.line}>
            <b>{user.nick}</b>
            <span className={s.money}>
              <Amount value={balance.soft} kind="soft" coin={18} />
              <Amount value={balance.hard} kind="hard" coin={18} />
            </span>
          </span>
          <LiquidBar value={user.xp} max={user.xpNext} label="Опыт" left={`${num(user.xp)} XP`} right={`${user.level + 1} уровень`} />
        </div>
      </header>

      <div className={s.list}>
        {PROMOS.map((p, i) => (
          <PromoCard key={p.id} promo={p} ends={left(Date.parse(p.endsAt) - now).replace(/^ещё\s/, '')} shape={i % 2 ? { top: [18, 0] } : { bottom: [0, 18] }} onClick={() => open(`/promo/${p.id}`)} />
        ))}
      </div>

      <ScanDock tickets={promo.tickets} boosted={boost.msLeft > 0} onClick={() => open('/scan')} />
    </main>
  )
}
