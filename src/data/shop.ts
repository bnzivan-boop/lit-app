import mock from '../../data/mock.json'
import type { City, Point, Tariff } from './cdek'
import type { League } from './types'

export type Product = {
  id: string
  title: string
  category: string
  price: { hard: number }
  minLeague: League
  about: string
  /** код или ссылка: доставка не нужна */
  digital?: boolean
  sizes?: string[]
  chart?: 'jacket' | 'shorts'
  /** осталось штук */
  left?: number
}

export const PRODUCTS = mock.shop as Product[]

/** Скидка: на товары списком или на весь раздел, процент, срок и причина. Цена сама возвращается после срока */
export type Sale = { id: string; title: string; percent: number; products?: string[]; category?: string; startsAt: string; endsAt: string }
export const SALES = mock.sales as Sale[]

/** Действующая скидка на товар; если их несколько — бо́льшая */
export function saleOf(p: Product, now: number) {
  const on = SALES.filter((x) => Date.parse(x.startsAt) <= now && now < Date.parse(x.endsAt) && (x.products?.includes(p.id) || x.category === p.category))
  const best = on.sort((a, b) => b.percent - a.percent)[0]
  if (!best) return undefined
  return { ...best, price: Math.round((p.price.hard * (100 - best.percent)) / 100), base: p.price.hard, msLeft: Date.parse(best.endsAt) - now }
}

/** Цена сейчас: со скидкой, если она идёт */
export const priceOf = (p: Product, now: number) => saleOf(p, now)?.price ?? p.price.hard
export const CATEGORIES = mock.shopCategories
export const LEAGUES = mock.leagues as League[]
export const ORDER = mock.shopOrder
export const CHARTS = mock.sizeCharts as unknown as Record<string, { title: string; sizes: string[]; rows: [string, ...number[]][] }>

const { drop } = mock
/** Приз дропа: на полках его нет, купить можно только со страницы дропа */
export const DROP: Product = {
  id: drop.productId,
  title: drop.title,
  category: 'drop',
  price: drop.price,
  minLeague: drop.minLeague as League,
  about: '',
  left: 1,
}
/** wait — ждём, live — идёт, over — разобрали */
export type DropPhase = 'wait' | 'live' | 'over'

export const findProduct = (id?: string) => (id === DROP.id ? DROP : PRODUCTS.find((p) => p.id === id))
export const thumb = (id: string) => `/assets/shop/${id}-s.webp`
export const photo = (id: string) => `/assets/shop/${id}.webp`
export const isOpen = (p: Product, league: League) => LEAGUES.indexOf(p.minLeague) <= LEAGUES.indexOf(league)
/** сколько можно взять */
export const maxQty = (p: Product) => Math.min(9, p.left ?? 9)

export type CartLine = { id: string; size?: string; qty: number }
export type Recipient = { name: string; surname: string; patronymic: string; phone: string; email: string }
export type Address = { street: string; house: string; flat: string; entrance: string; floor: string; comment: string }
/** Доставка СДЭК: до пункта или постамата либо курьером */
export type Delivery = { city: City; mode: 'point' | 'door'; tariff: Tariff; point?: Point; address?: Address }
export type Checkout = { recipient?: Recipient; delivery?: Delivery; payment?: string }
export type Order = {
  number: number
  at: number
  lines: CartLine[]
  hard: number
  rub: number
  recipient: Recipient
  delivery?: Delivery
  payment: string
}

/** «ул. Садовая, 12» — куда едет */
export const deliveryPlace = (d: Delivery) =>
  d.mode === 'point' ? `${d.city.title}, ${d.point?.address}` : `${d.city.title}, ${d.address?.street}, ${d.address?.house}${d.address?.flat ? `, кв. ${d.address.flat}` : ''}`
export const needsDelivery = (lines: CartLine[]) => lines.some((l) => !findProduct(l.id)?.digital)
export const cartSum = (lines: CartLine[], now: number) =>
  lines.reduce((sum, l) => {
    const p = findProduct(l.id)
    return sum + (p ? priceOf(p, now) : 0) * l.qty
  }, 0)
export const cartCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.qty, 0)
