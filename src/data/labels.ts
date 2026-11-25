import type { Currency, League, Rarity } from './types'

export const LEAGUE_NAME: Record<League, string> = {
  bronze: 'Бронза',
  silver: 'Серебро',
  gold: 'Золото',
  platinum: 'Платина',
  diamond: 'Даймонд',
}

export const RARITY_NAME: Record<Rarity, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legend: 'Легендарный',
}

export const CURRENCY_NAME: Record<Currency, string> = { soft: 'софт', hard: 'хард' }
