/* Что нужно главной, чтобы открыться без подгрузок на глазах */
const IMAGES = [
  '/assets/characters/hero-head-blue-fire.png',
  '/assets/currency/coin-soft.png',
  '/assets/currency/coin-hard.png',
  '/assets/brand/logo-flame-white.png',
  '/assets/banners/banner-chips-pyaterochka.png',
  '/assets/cases/box-cutout.png',
  ...['soft', 'hard'].flatMap((k) => [1, 2, 3, 4, 5].map((t) => `/assets/wheel/${k}-${t}.webp`)),
  '/assets/cases/chest.webp',
  '/assets/games/energy-mix.webp',
  '/assets/games/energy-jump.webp',
  '/assets/products/phone-receipt.webp',
  '/assets/products/can-lemonade.webp',
  '/assets/prizes/ps5.webp',
]
const FONTS = ['800 20px "Roboto Condensed"', '700 20px "Roboto Condensed"', '400 20px "Liter"']

const image = (src: string) =>
  new Promise<void>((done) => {
    const img = new Image()
    img.onload = img.onerror = () => done()
    img.src = src
  })

/** Загружает всё нужное, сообщает долю. Не ждёт дольше limit: плохая сеть не должна запирать экран */
export function preload(onProgress: (part: number) => void, limit = 5000) {
  const jobs = [...IMAGES.map(image), ...FONTS.map((f) => document.fonts.load(f, 'Аа0').catch(() => null))]
  let done = 0
  const all = jobs.map((j) => Promise.resolve(j).then(() => onProgress(++done / jobs.length)))
  return Promise.race([Promise.all(all), new Promise((r) => setTimeout(r, limit))]).then(() => onProgress(1))
}
