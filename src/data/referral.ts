import mock from '../../data/mock.json'
import { BASE } from '../lib/base'
import { tgStart } from '../lib/telegram'
import type { Reward } from './types'

export type Friend = { nick: string; at: string; claimed: boolean }

export const REFERRAL = mock.referral as { inviter: Reward; newcomer: Reward; friends: Friend[] }

/** Код игрока: из его ID, поэтому не меняется */
export const codeOf = (id: string) => {
  const c = id.replace(/[^0-9a-z]/gi, '').toUpperCase()
  return `LIT-${c.slice(0, 4)}-${c.slice(4, 8)}`
}

/** «lit96095853» → «LIT-9609-5853» по мере ввода */
export function codeMask(v: string) {
  const c = v.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/^LIT/, '').slice(0, 8)
  if (!c) return /^L/i.test(v) ? v.toUpperCase().slice(0, 4) : ''
  return `LIT-${c.slice(0, 4)}${c.length > 4 ? `-${c.slice(4)}` : ''}`
}

export function codeError(v: string, own: string) {
  if (!/^LIT-[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(v)) return 'Код выглядит так: LIT-0000-0000'
  if (v === own) return 'Это твой код. Нужен код друга'
  return ''
}

/** Ссылка для друга: бот с кодом, а пока бота нет — само приложение */
export const inviteLink = (code: string) =>
  mock.telegram.bot ? `https://t.me/${mock.telegram.bot}?startapp=${code}` : `${location.origin}${BASE}?ref=${code}`

/** Код из ссылки, по которой пришёл игрок */
const start = new URLSearchParams(location.search).get('ref') ?? tgStart() ?? ''
export const refFromLink = /^LIT-[0-9A-Z]{4}-[0-9A-Z]{4}$/i.test(start) ? start.toUpperCase() : ''
