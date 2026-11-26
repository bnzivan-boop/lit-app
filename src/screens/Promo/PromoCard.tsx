import { useRef, type CSSProperties } from 'react'
import { Icon } from '../../components/Icon'
import { Tag } from '../../components/Tag'
import { promoArt, type Promo } from '../../data/promos'
import { usePanel, type PanelShape } from '../../lib/usePanel'
import s from './PromoCard.module.css'
import t from './theme.module.css'

type Props = { promo: Promo; ends: string; shape?: PanelShape; pressed?: boolean; onClick: () => void }

/** Баннер акции: слева текст, справа сцена. Колонки не пересекаются, приз выходит только вверх и вправо */
export function PromoCard({ promo: p, ends, shape = {}, pressed, onClick }: Props) {
  const frame = useRef<HTMLSpanElement>(null)
  const clip = usePanel(frame, { r: 24, ...shape })
  const [bl, br] = shape.bottom ?? [0, 0]
  return (
    <button type="button" className={`press ${t.theme} ${s.card}`} data-theme={p.theme} data-pressed={pressed || undefined} aria-label={`${p.sticker}: ${p.name}. Подробнее`} onClick={onClick}>
      <span ref={frame} className={s.frame} style={clip}>
        <i className={s.flame} />
      </span>
      <span className={s.pop} style={{ '--bl': `${bl}px`, '--br': `${br}px` } as CSSProperties} aria-hidden>
        {p.theme === 'prizes' && (
          <>
            <img className={s.fly} data-n="2" src={promoArt('rayban')} alt="" />
            <img className={s.fly} data-n="3" src={promoArt('deck')} alt="" />
            <img className={s.fly} data-n="1" src={promoArt('airmax')} alt="" />
          </>
        )}
        <img className={s.art} src={promoArt(p.art)} alt="" />
      </span>
      <span className={s.text} style={{ paddingTop: shape.top?.[0] ?? 0 }}>
        <span className={s.tags}>
          <Tag tone="white">{p.sticker}</Tag>
          <span className={s.ends}>{ends}</span>
        </span>
        <span className={s.title}>{p.title.replace(/\u00a0/g, ' ')}</span>
        <span className={s.sub}>{p.sub}</span>
        <span className={s.more}>
          Подробнее
          <Icon name="chevron" size={16} />
        </span>
      </span>
    </button>
  )
}
