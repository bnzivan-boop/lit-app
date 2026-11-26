import mock from '../../data/mock.json'

export type LeagueId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
export type League = { id: LeagueId; name: string; /** «до Серебра» */ of: string; from: number }

export type Challenge = { id: string; game?: string; title: string; text: string; progress: number; goal: number; power: number; hard?: boolean; box?: string }
export type BoardRow = { place: number; nick: string; power: number; me?: boolean }
export type Board = { size: number; rows: BoardRow[] }

/** Сезон: лига растёт от набранной силы Титана, вниз не падает */
export const SEASON = mock.season as {
  title: string
  endsAt: string
  power: number
  leagues: League[]
  challenges: { daily: Challenge[]; weekly: Challenge[]; seasonal: Challenge }
  /** базовые — за силу, дополнительные — за товары из чеков */
  rewards: { base: { power: number; box: string }[]; extra: { items: number; box: string }[]; items: number }
  board: { group: Board; all: Board }
}

export const leagueArt = (id: LeagueId) => `/assets/season/league-${id}.webp`
export const seasonArt = (name: string) => `/assets/season/${name}.webp`

/** Текущая лига и следующая по силе */
export function leagueOf(power: number) {
  const list = SEASON.leagues
  let i = 0
  while (i + 1 < list.length && power >= list[i + 1].from) i++
  return { league: list[i], next: list[i + 1] as League | undefined }
}

/** Следующая базовая награда и откуда к ней идёт шкала */
export function nextReward(power: number) {
  const list = SEASON.rewards.base
  const i = list.findIndex((r) => r.power > power)
  if (i < 0) return undefined
  return { ...list[i], from: i ? list[i - 1].power : 0, taken: i, total: list.length }
}
