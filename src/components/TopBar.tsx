import { useEffect, useState, type ReactNode } from 'react'
import { Amount } from './Amount'
import { IconButton } from './Button'
import { Icon } from './Icon'
import s from './TopBar.module.css'

type Props = { nick: string; balance: { soft: number; hard: number }; onMenu?: () => void; onBack?: () => void; after?: number; extra?: ReactNode }

/** Компактная шапка: появляется, когда герой ушёл вверх. Баланс и меню всегда под рукой */
export function TopBar({ nick, balance, onMenu, onBack, after = 190, extra }: Props) {
  const [shown, setShown] = useState(false)
  const [edge, setEdge] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      setShown(scrollY > after)
      setEdge(scrollY > 6)
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [after])
  return (
    <>
      {/* контент не просвечивает под часами и кнопками Telegram */}
      <div className={`${s.edge} ${edge ? s.on : ''}`} aria-hidden />
      <div className={`${s.bar} ${shown ? s.on : ''}`} inert={!shown}>
        {onBack && (
          <button type="button" className={`press ${s.back}`} aria-label="Назад" onClick={onBack}>
            <Icon name="chevron" size={24} />
          </button>
        )}
        <span className={s.nick}>{nick}</span>
        <span className={s.balance}>
          <Amount value={balance.soft} kind="soft" coin={18} />
          <Amount value={balance.hard} kind="hard" coin={18} />
        </span>
        {extra}
        {onMenu && <IconButton icon="menu" label="Меню" onClick={onMenu} className={s.menu} />}
      </div>
    </>
  )
}
