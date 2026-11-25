import mock from '../../data/mock.json'

/* Модуль СДЭК. Есть VITE_CDEK_SERVICE — ходит в серверный service.php СДЭК (ключи лежат там, в приложении их нет).
   Нет адреса — условные данные из mock.json с такой же задержкой, чтобы загрузка и ошибки были настоящими. */

export type City = { code: number; title: string }
export type Point = {
  code: string
  type: 'PVZ' | 'POSTAMAT'
  address: string
  work: string
  fitting: boolean
  lat: number
  lng: number
}
export type Tariff = { code: number; price: number; min: number; max: number }
/** Пункт, постамат и курьер тарифицируются отдельно */
export type Quote = Partial<Record<Point['type'] | 'door', Tariff>>

type Cdek = {
  points: (city: City) => Promise<Point[]>
  quote: (city: City) => Promise<Quote>
}

const { cdek } = mock
const SERVICE = import.meta.env.VITE_CDEK_SERVICE as string | undefined
export const cdekLive = Boolean(SERVICE)

/** Список городов с кодами СДЭК. У service.php такого метода нет, поэтому список ведём сами */
export const CITIES: City[] = cdek.cities.map(({ code, title }) => ({ code, title }))

/* ---------- настоящий СДЭК ---------- */

type RawPoint = {
  code: string
  type: string
  work_time?: string
  is_dressing_room?: boolean
  location?: { address?: string; latitude?: number; longitude?: number }
}
type RawTariff = { tariff_code: number; delivery_mode: number; delivery_sum: number; period_min: number; period_max: number }

async function call<T>(params: Record<string, string>, body?: unknown): Promise<T> {
  const res = await fetch(`${SERVICE}?${new URLSearchParams(params)}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) throw new Error(`СДЭК ответил ${res.status}`)
  return res.json() as Promise<T>
}

/* способы доставки СДЭК: склад-дверь, склад-склад, склад-постамат */
const MODE = { door: 3, PVZ: 4, POSTAMAT: 7 }

const live: Cdek = {
  async points(city) {
    const list = await call<RawPoint[]>({ action: 'offices', city_code: String(city.code) })
    return list.flatMap((p) => {
      const { address, latitude, longitude } = p.location ?? {}
      if (!address || latitude === undefined || longitude === undefined) return []
      return [
        {
          code: p.code,
          type: p.type === 'POSTAMAT' ? ('POSTAMAT' as const) : ('PVZ' as const),
          address,
          work: p.work_time ?? '',
          fitting: Boolean(p.is_dressing_room),
          lat: latitude,
          lng: longitude,
        },
      ]
    })
  },
  async quote(city) {
    const { tariff_codes: list = [] } = await call<{ tariff_codes?: RawTariff[] }>(
      { action: 'calculate' },
      { from_location: { code: cdek.fromCode }, to_location: { code: city.code }, packages: [cdek.parcel] },
    )
    const cheapest = (mode: number): Tariff | undefined => {
      const best = list.filter((t) => t.delivery_mode === mode).sort((a, b) => a.delivery_sum - b.delivery_sum)[0]
      return best && { code: best.tariff_code, price: Math.ceil(best.delivery_sum), min: best.period_min, max: best.period_max }
    }
    return { PVZ: cheapest(MODE.PVZ), POSTAMAT: cheapest(MODE.POSTAMAT), door: cheapest(MODE.door) }
  },
}

/* ---------- условные данные ---------- */

/* для показа: ?cdek=error — СДЭК не отвечает */
const fails = new URLSearchParams(location.search).get('cdek') === 'error'
const wait = <T>(value: () => T) =>
  new Promise<T>((ok, fail) =>
    setTimeout(() => (fails ? fail(new Error('СДЭК не отвечает')) : ok(value())), 650),
  )

const demo: Cdek = {
  points: (city) =>
    wait(() =>
      cdek.points.map((p, i) => ({
        code: `${city.code}-${i + 1}`,
        type: p.type as Point['type'],
        address: `${p.street}, ${((city.code * (i + 3)) % 89) + 4}`,
        work: p.work,
        fitting: p.fitting,
        lat: 1 - p.y,
        lng: p.x,
      })),
    ),
  quote: (city) =>
    wait(() => {
      const z = cdek.zones[cdek.cities.find((c) => c.code === city.code)?.zone ?? 1]
      return { PVZ: { code: 136, price: z.point, min: z.min, max: z.max }, POSTAMAT: { code: 368, price: z.point - 30, min: z.min, max: z.max }, door: { code: 137, price: z.door, min: z.min, max: z.max + 1 } }
    }),
}

export const api: Cdek = SERVICE ? live : demo
