import mock from '../../data/mock.json'

export type PromoPrize = { title: string; image: string; count?: number; note?: string; soon?: boolean; size?: 'tall' | 'wide' }

/** Акция. Всё на баннере и на её странице — из данных */
export type Promo = {
  id: string
  sticker: string
  /** коротко, для баннера */
  title: string
  sub: string
  /** полностью, для страницы */
  name: string
  lead: string
  theme: 'dragon' | 'prizes'
  art: string
  /** сцена для верха страницы */
  scene: string
  endsAt: string
  /** есть ли в акции «мечты» */
  dreams: boolean
  super: PromoPrize[]
  prizes: PromoPrize[]
  /** правила списком: 1, 2, 3… */
  steps: string[]
}

export const PROMOS = mock.promos as Promo[]
export const findPromo = (id?: string) => PROMOS.find((p) => p.id === id)
export const promoArt = (name: string) => `/assets/promo/${name}.webp`
