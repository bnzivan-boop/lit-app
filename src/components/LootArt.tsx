import type { Loot } from '../data/store'
import s from './LootArt.module.css'

/* Монеты и голова — настоящие рендеры. Наушники и худи нарисованы временно, до фото призов */
export function LootArt({ loot }: { loot: Loot }) {
  switch (loot.kind) {
    case 'soft':
    case 'hard':
      return (
        <span className={s.art}>
          {(loot.amount ?? 0) >= 50 && (
            <>
              <img className={s.left} src={`/assets/currency/coin-${loot.kind}.png`} alt="" />
              <img className={s.right} src={`/assets/currency/coin-${loot.kind}.png`} alt="" />
            </>
          )}
          <img className={s.coin} src={`/assets/currency/coin-${loot.kind}.png`} alt="" />
        </span>
      )
    case 'boost':
      return (
        <span className={s.art}>
          <span className={s.flame} />
          <span className={s.x}>×2</span>
        </span>
      )
    case 'frame':
      return (
        <span className={s.art}>
          <span className={s.ring}>
            <img src="/assets/characters/hero-head-blue-fire.png" alt="" />
          </span>
        </span>
      )
    case 'headphones':
      return (
        <svg className={s.svg} viewBox="0 0 120 120" aria-hidden>
          <path d="M18 74V62a42 42 0 0 1 84 0v12" fill="none" stroke="#10201f" strokeWidth="13" strokeLinecap="round" />
          <path d="M18 74V62a42 42 0 0 1 84 0v12" fill="none" stroke="#2c3d3c" strokeWidth="6" strokeLinecap="round" />
          <rect x="8" y="62" width="30" height="44" rx="14" fill="#10201f" />
          <rect x="82" y="62" width="30" height="44" rx="14" fill="#10201f" />
          <rect x="14" y="68" width="17" height="32" rx="8.500" fill="#70fff6" />
          <rect x="89" y="68" width="17" height="32" rx="8.500" fill="#70fff6" />
          <path d="M22 76v16M98 76v16" stroke="#0c6763" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'hoodie':
      return (
        <svg className={s.svg} viewBox="0 0 120 120" aria-hidden>
          <path d="M40 20 18 34 4 86l18 6 8-26v42h60V66l8 26 18-6-14-52-22-14c-4 10-36 10-40 0Z" fill="#141c1c" />
          <path d="M40 20c-4 12 4 24 20 30 16-6 24-18 20-30-6-10-34-10-40 0Z" fill="#243130" />
          <path d="M48 24c2 10 6 16 12 20 6-4 10-10 12-20-6-6-18-6-24 0Z" fill="#0a0f0f" />
          <path d="M44 84h32l6 18H38z" fill="#0e1515" />
          <path d="M54 48v14M66 48v14" stroke="#70fff6" strokeWidth="3" strokeLinecap="round" />
          <image href="/assets/brand/logo-flame-white.png" x="50" y="62" width="20" height="28" />
        </svg>
      )
  }
}
