import { Tag } from '../../components/Tag'
import { promoArt, type Promo } from '../../data/promos'
import s from './PromoSlide.module.css'

/** Акция в ленте баннеров на главной: тот же размер, что у баннера с картинкой */
export function PromoSlide({ promo: p, onClick }: { promo: Promo; onClick: () => void }) {
  return (
    <button type="button" className={`press ${s.slide}`} data-theme={p.theme} aria-label={`${p.sticker}: ${p.name}. Подробнее`} onClick={onClick}>
      <img className={s.art} src={promoArt(p.art)} alt="" />
      <span className={s.text}>
        <Tag tone="white">{p.sticker}</Tag>
        <span className={s.title}>{p.title.replace(/ /g, ' ')}</span>
        <span className={s.more}>Подробнее</span>
      </span>
    </button>
  )
}
