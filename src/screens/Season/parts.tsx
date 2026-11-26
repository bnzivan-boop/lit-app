import type { CSSProperties } from 'react'
import { Icon } from '../../components/Icon'
import { num } from '../../data/format'
import { seasonArt, type LeagueId } from '../../data/season'
import s from './parts.module.css'

/** Металл лиги: основной цвет и концы градиента */
export const METAL: Record<LeagueId, [string, string, string]> = {
  bronze: ['#d08b66', '#c4682c', '#ffc79c'],
  silver: ['#c9d3d6', '#7f8c93', '#f4f8fa'],
  gold: ['#f5c84b', '#c7871c', '#ffe68a'],
  platinum: ['#8f8cff', '#5a52d8', '#c9c5ff'],
  diamond: ['#70fff6', '#16b8ae', '#b8fffa'],
}

export const metal = (id: LeagueId) => {
  const [m, lo, hi] = METAL[id]
  return { '--metal': m, '--metal-lo': lo, '--metal-hi': hi } as CSSProperties
}

/** Значок силы Титана: кулак с огнём LIT */
export const PowerIcon = ({ size = 20 }: { size?: number }) => (
  <img className={s.icon} src={seasonArt('power')} alt="" width={Math.round(size * 0.75)} height={size} />
)

/** Сила Титана со значком-кулаком: так сила отличается от монет */
export const Power = ({ value, plus, className = '' }: { value: number; plus?: boolean; className?: string }) => (
  <span className={`${s.power} ${className}`}>
    <PowerIcon size={20} />
    {plus ? '+' : ''}
    {num(value)}
  </span>
)

/** Круглая «Назад» поверх картинки */
export const Back = ({ onClick, label = 'Назад' }: { onClick: () => void; label?: string }) => (
  <button type="button" className={`press ${s.back}`} aria-label={label} onClick={onClick}>
    <Icon name="chevron" size={24} />
  </button>
)
