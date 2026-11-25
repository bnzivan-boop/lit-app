import { WHEEL } from '../../data/store'

/* Хард редкий, поэтому его сектор втрое уже: размер честно говорит о шансе */
const SIZE = { soft: 54, hard: 18 } as const
const scale = 360 / WHEEL.reduce((sum, p) => sum + SIZE[p.kind], 0)

/** Ширина и центр каждого сектора, градусы по часовой от верха */
export const SECTORS = WHEEL.map((p) => ({ size: SIZE[p.kind] * scale, center: 0 }))
SECTORS.reduce((from, s) => {
  s.center = from + s.size / 2
  return from + s.size
}, -SECTORS[0].size / 2)

export const mod = (n: number, m: number) => ((n % m) + m) % m

/** Какой сектор под указателем при повороте rot */
export function under(rot: number) {
  const a = mod(-rot, 360)
  return SECTORS.findIndex((s) => Math.abs(mod(a - s.center + 180, 360) - 180) <= s.size / 2 + 1e-6)
}
