import mock from '../../data/mock.json'

export const NETWORKS = mock.videoNetworks
const NAMES = NETWORKS.map((n) => n.title)

/** «VK, TikTok, YouTube и Telegram» */
export const networkNames = `${NAMES.slice(0, -1).join(', ')} и ${NAMES[NAMES.length - 1]}`

function parse(text: string) {
  const raw = text.trim()
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    return url.hostname.includes('.') ? url : null
  } catch {
    return null
  }
}

/** Соцсеть по ссылке */
export function networkOf(text: string) {
  const host = parse(text)?.hostname.toLowerCase() ?? ''
  return NETWORKS.find((n) => n.hosts.some((h) => host === h || host.endsWith(`.${h}`)))?.title
}

/** Что не так со ссылкой; null — можно отправлять */
export function linkError(text: string) {
  const url = parse(text)
  if (!url || /\s/.test(text.trim())) return 'Это не похоже на ссылку. Скопируй её в соцсети целиком'
  if (!networkOf(text)) return `Подойдут ссылки из ${networkNames}`
  if (url.pathname.length < 2 && !url.search) return 'Нужна ссылка на сам ролик, а не на соцсеть'
  return null
}

/** Ссылка для показа: без протокола и хвостов */
export const shortLink = (text: string) => text.trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
