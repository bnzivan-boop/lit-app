import mock from '../../data/mock.json'

export type Control = { id: string; title: string; hint: string }

/** Игра. Сама игра живёт на бэке, здесь всё вокруг неё: описание, цель, рейтинг */
export type Game = {
  id: string
  title: string
  isNew?: boolean
  best: number
  /** цель дня: очки, за которые дают mystery box */
  goal: number
  durationMin?: number
  color: string
  about: string
  rules: string[]
  note: string
  controls?: Control[]
  /** очки лидера */
  top: number
  /** место игрока; place 0 — ещё не играл; before — рекорд до запуска таблицы */
  me: { place: number; move: number; before: number }
}

export const GAMES = mock.games as Game[]
export const RUN = mock.gameRun
export const BOX_CASE = mock.gameBox.caseId

export const findGame = (id?: string) => GAMES.find((g) => g.id === id)
const art = (id: string) => id.replace('energy-', '')
export const gameCover = (id?: string) => (findGame(id) ? `/assets/games/${id}.webp` : undefined)
export const gameHero = (id: string) => `/assets/games/${art(id)}-hero.webp`
export const gameScene = (id: string) => `/assets/games/${art(id)}-scene.webp`
export const gameTitle = (id: string) => findGame(id)?.title
export const shortestGame = () =>
  GAMES.reduce((a, b) => ((b.durationMin ?? Infinity) < (a.durationMin ?? Infinity) ? b : a)).id

export type BoardRow = { place: number; nick: string; score: number; move: number; me?: boolean }

const { nicks, share, move } = mock.gameBoard

/** Место с рекордом best: в десятке — честно, ниже — приближение от места из моков */
export function placeOf(game: Game, best: number) {
  if (best <= 0) return 0
  const tail = Math.round(game.top * share[share.length - 1])
  const above = share.filter((k) => Math.round(game.top * k) > best).length
  if (above < share.length) return above + 1
  const base = game.me.place || 140
  if (best <= game.best) return base
  const k = (best - game.best) / Math.max(1, tail - game.best)
  return Math.max(share.length + 1, Math.round(base - (base - share.length - 1) * k))
}

/** Первая десятка с учётом игрока и строка игрока */
export function board(game: Game, best: number, nick: string) {
  const rows: BoardRow[] = nicks.map((n, i) => ({ place: i + 1, nick: n, score: Math.round(game.top * share[i]), move: move[i] }))
  const place = placeOf(game, best)
  const me: BoardRow = { place, nick, score: best, move: best > game.best ? 1 : game.me.move, me: true }
  if (place > 0 && place <= rows.length) {
    rows.splice(place - 1, 0, me)
    rows.pop()
    rows.forEach((r, i) => (r.place = i + 1))
  }
  /* сколько до следующего места: в десятке точно, ниже — до десятки */
  const ahead = place > 1 ? (rows[Math.min(place, rows.length + 1) - 2] ?? rows[rows.length - 1]) : undefined
  return { rows, me, gap: ahead ? ahead.score - best + 1 : 0, gapPlace: ahead?.place ?? 0 }
}
