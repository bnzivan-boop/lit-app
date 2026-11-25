const NBSP = ' '
const grouped = new Intl.NumberFormat('ru-RU', { useGrouping: true })

/** 45000 → «45 000» */
export const num = (n: number) => grouped.format(n)

/** plural(5, ['день', 'дня', 'дней']) → «дней» */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  const d = Math.abs(n) % 100
  const u = d % 10
  if (d > 10 && d < 20) return many
  if (u === 1) return one
  if (u > 1 && u < 5) return few
  return many
}

export const days = (n: number) => `${num(n)}${NBSP}${plural(n, ['день', 'дня', 'дней'])}`

/** 150 → «2 ч 30 мин» */
export function duration(minutes: number) {
  const total = Math.floor(minutes)
  const h = Math.floor(total / 60)
  const m = total % 60
  return [h && `${h}${NBSP}ч`, (m || !h) && `${m}${NBSP}мин`].filter(Boolean).join(' ')
}

const WEEKDAY_OF: Record<string, string> = {
  понедельник: 'понедельника',
  вторник: 'вторника',
  среда: 'среды',
  четверг: 'четверга',
  пятница: 'пятницы',
  суббота: 'субботы',
  воскресенье: 'воскресенья',
}

/** Дата → «пятницы» (по Москве) */
export function weekdayOf(time: number) {
  const name = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', timeZone: 'Europe/Moscow' }).format(time)
  return WEEKDAY_OF[name] ?? name
}

/** мс → «23:59:59» */
export function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':')
}

/** сколько осталось: «ещё 6 дней», меньше суток — «ещё 5 ч 20 мин» */
export function left(ms: number) {
  const min = Math.max(0, Math.floor(ms / 60_000))
  return `ещё${NBSP}${min >= 1440 ? days(Math.floor(min / 1440)) : duration(min)}`
}
