import { useState } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Skeleton } from '../../components/Skeleton'
import { api, type City, type Point, type Quote } from '../../data/cdek'
import { num } from '../../data/format'
import { haptic } from '../../lib/motion'
import { PointMap } from './PointMap'
import { Screen } from '../../components/Screen'
import { useLoad } from './useLoad'
import s from './PointPicker.module.css'

const KINDS = [
  { id: 'all', title: 'Все' },
  { id: 'PVZ', title: 'Пункты' },
  { id: 'POSTAMAT', title: 'Постаматы' },
]
/* больше на маленькой карте не разобрать, дальше — поиск */
const LIMIT = 40

/* «Ежедневно» в середине строки — с маленькой, «Пн–Пт» не трогаем */
const lower = (t: string) => t.replace(/^(Ежедневно|Круглосуточно)/, (w) => w.toLowerCase())
export const about = (p: Point) => [p.type === 'PVZ' ? 'пункт' : 'постамат', lower(p.work), p.fitting && 'есть примерка'].filter(Boolean).join(', ')

type Props = { city: City; quote?: Quote; value?: Point; onBack: () => void; onPick: (p: Point) => void }

/** Пункты СДЭК: карта и список смотрят на один выбор */
export function PointPicker({ city, quote, value, onBack, onPick }: Props) {
  const { data = [], loading, error, retry } = useLoad(() => api.points(city), String(city.code))
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState(value?.code)
  /* точки, до которых СДЭК не считает цену, не предлагаем */
  const found = data.filter((p) => (!quote || quote[p.type]) && (kind === 'all' || p.type === kind) && p.address.toLowerCase().includes(q.trim().toLowerCase()))
  const shown = found.slice(0, LIMIT)
  const point = data.find((p) => p.code === picked)

  function pick(code: string) {
    haptic('land')
    setPicked(code)
  }

  return (
    <Screen title={city.title} onBack={onBack} footer={
        point && (
          <>
            <p className={s.chosen}>
              <b>{point.address}</b>
              {about(point)}
              {quote?.[point.type] && `. Доставка ${num(quote[point.type]!.price)} ₽`}
            </p>
            <Button onClick={() => onPick(point)}>Забрать здесь</Button>
          </>
        )
      }>
      {error ? (
        <div className={s.error}>
          <h2>СДЭК не отвечает</h2>
          <p>Проверь интернет и попробуй ещё раз.</p>
          <Button variant="secondary" onClick={retry}>
            Повторить
          </Button>
        </div>
      ) : (
        <>
          <div className={s.map}>{loading ? <Skeleton h={250} r="24px" /> : <PointMap points={shown} picked={picked} onPick={pick} seed={city.code} />}</div>
          <div className={s.tools}>
            <div className={s.kinds} role="radiogroup" aria-label="Что показать">
              {KINDS.map((k) => (
                <button key={k.id} type="button" role="radio" aria-checked={k.id === kind} className="press" onClick={() => setKind(k.id)}>
                  {k.title}
                </button>
              ))}
            </div>
            <input type="search" aria-label="Улица" placeholder="Найти по улице" enterKeyHint="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {loading ? (
            <div className={s.loading}>
              <Skeleton h={72} r="18px" />
              <Skeleton h={72} r="18px" />
              <Skeleton h={72} r="18px" />
            </div>
          ) : (
            <ul className={s.list} role="radiogroup" aria-label="Пункты">
              {shown.map((p) => (
                <li key={p.code}>
                  <button type="button" role="radio" aria-checked={p.code === picked} className="press" onClick={() => pick(p.code)}>
                    <span className={s.kind}>
                      <Icon name={p.type === 'PVZ' ? 'pin' : 'box'} size={22} />
                    </span>
                    <span className={s.text}>
                      <b>{p.address}</b>
                      {about(p)}
                    </span>
                    <i />
                  </button>
                </li>
              ))}
              {shown.length === 0 && <li className={s.none}>Ничего не нашли. Попробуй другую улицу или покажи все.</li>}
              {found.length > LIMIT && <li className={s.none}>Показали {LIMIT}. Введи улицу, чтобы найти свой.</li>}
            </ul>
          )}
        </>
      )}
    </Screen>
  )
}
