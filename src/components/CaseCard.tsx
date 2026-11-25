import type { CSSProperties, ReactNode } from 'react'
import { RARITY_NAME } from '../data/labels'
import type { Rarity } from '../data/types'
import { Amount } from './Amount'
import { Skeleton } from './Skeleton'
import s from './CaseCard.module.css'

/* место, задержка, снос вбок */
const SPARKS = [
  [12, 0, -10],
  [30, -0.9, 8],
  [46, -1.7, -6],
  [62, -0.4, 12],
  [78, -1.3, -8],
  [90, -2.1, 10],
] as const

type Props = {
  title: string
  rarity: Rarity
  price: number
  image: string
  balance: number
  onOpen?: () => void
  pressed?: boolean
  loading?: boolean
}

/** Кейс: тёмная карточка, свет и ящик справа, ящик выходит за верхний край */
export function CaseCard({ title, rarity, price, image, balance, onOpen, pressed, loading }: Props) {
  const missing = price - balance
  return (
    <article className={`${s.card} ${s[rarity]}`}>
      <span className={s.scene} aria-hidden>
        <span className={s.flame} />
      </span>
      <span className={`${s.boxWrap} ${image.includes('chest') ? s.wide : ''}`} aria-hidden>
        <img className={s.box} src={image} alt="" />
        <span className={s.sparks}>
          {SPARKS.map(([x, d, sway]) => (
            <i key={x} style={{ '--x': `${x}%`, '--d': `${d}s`, '--sway': `${sway}px` } as CSSProperties} />
          ))}
        </span>
      </span>
      <h3 className={`${s.title} ${title.length > 6 ? s.long : ''}`}>
        <span className={s.sticker}>Mystery box</span>
        {title}
      </h3>
      <p className={s.rarity}>{RARITY_NAME[rarity]}</p>
      {missing > 0 ? (
        <span className={`${s.pill} ${s.locked}`}>
          Ещё <Amount value={missing} kind="soft" coin={20} />
        </span>
      ) : (
        <button
          type="button"
          className={`press ${s.pill} ${s.open}`}
          onClick={onOpen}
          data-pressed={pressed || undefined}
          disabled={loading}
          aria-busy={loading || undefined}
          aria-label={`Открыть кейс «${title}» за ${price} софта`}
        >
          <span className={s.label}>
            Открыть за <Amount value={price} kind="soft" coin={20} />
          </span>
          {loading && <span className={s.loader} aria-hidden />}
        </button>
      )}
    </article>
  )
}

export function CaseCardSkeleton() {
  return (
    <div className={s.card} aria-busy>
      <Skeleton w={92} h={20} />
      <span className={s.gap} />
      <Skeleton w={132} h={34} r={8} />
      <span className={s.pillSkeleton}>
        <Skeleton w={156} h={46} r={23} />
      </span>
    </div>
  )
}

/** Карусель: карточка занимает 84% ширины, соседняя выглядывает */
export function CaseCarousel({ children }: { children: ReactNode }) {
  return <div className={s.track}>{children}</div>
}
