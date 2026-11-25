import { useState } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Skeleton } from '../../components/Skeleton'
import { api, CITIES, type City, type Point, type Tariff } from '../../data/cdek'
import { num, plural } from '../../data/format'
import type { Address, Delivery } from '../../data/shop'
import { haptic } from '../../lib/motion'
import { CdekBadge } from './CdekBadge'
import { Field, filled, useForm } from './Forms'
import { about, PointPicker } from './PointPicker'
import { Screen } from '../../components/Screen'
import { useLoad } from './useLoad'
import f from './Forms.module.css'
import s from './DeliveryForm.module.css'

const term = (t: Tariff) => `${t.min === t.max ? t.max : `${t.min}–${t.max}`} ${plural(t.max, ['день', 'дня', 'дней'])}`
const EMPTY: Address = { street: '', house: '', flat: '', entrance: '', floor: '', comment: '' }

type Props = { value?: Delivery; onBack: () => void; onSave: (d: Delivery) => void }

/** Доставка СДЭК: город → пункт или курьер → место */
export function DeliveryForm({ value, onBack, onSave }: Props) {
  const [city, setCity] = useState<City | undefined>(value?.city)
  const [mode, setMode] = useState<Delivery['mode']>(value?.mode ?? 'point')
  const [point, setPoint] = useState<Point | undefined>(value?.point)
  const [screen, setScreen] = useState<'main' | 'city' | 'point'>('main')
  const [hint, setHint] = useState('')
  const quote = useLoad(city ? () => api.quote(city) : null, String(city?.code))
  const { PVZ, POSTAMAT, door } = quote.data ?? {}
  /* пока пункт не выбран, показываем самый дешёвый вариант со словом «от» */
  const cheapest = PVZ && POSTAMAT ? (PVZ.price <= POSTAMAT.price ? PVZ : POSTAMAT) : (PVZ ?? POSTAMAT)
  const pointTariff = point ? quote.data?.[point.type] : cheapest
  const tariff = mode === 'door' ? door : pointTariff

  const form = useForm<Address>(
    value?.address ?? EMPTY,
    { street: filled('Нужна улица'), house: filled('Нужен дом') },
    (address) => city && tariff && onSave({ city, mode, tariff, address }),
  )
  const digits = (x: string) => x.replace(/\D/g, '').slice(0, 5)

  if (screen === 'city')
    return (
      <CityPicker
        value={city}
        onBack={() => setScreen('main')}
        onPick={(c) => {
          if (c.code !== city?.code) setPoint(undefined)
          setCity(c)
          setHint('')
          setScreen('main')
        }}
      />
    )
  if (screen === 'point' && city)
    return (
      <PointPicker
        city={city}
        quote={quote.data}
        value={point}
        onBack={() => setScreen('main')}
        onPick={(p) => {
          setPoint(p)
          setHint('')
          setScreen('main')
        }}
      />
    )

  function savePoint() {
    if (!city) return fail('Сначала выбери город')
    if (!point) return setScreen('point')
    if (tariff) onSave({ city, mode, tariff, point })
  }
  function fail(text: string) {
    haptic('land')
    setHint(text)
  }

  const byPoint = mode === 'point' || !city
  return (
    <Screen
      title="Доставка"
      onBack={onBack}
      footer={
        byPoint ? (
          <Button onClick={savePoint} disabled={Boolean(city) && !tariff}>
            {city && !point ? 'Выбрать пункт' : 'Сохранить'}
          </Button>
        ) : (
          <Button type="submit" form="door" disabled={!tariff}>
            Сохранить
          </Button>
        )
      }
    >
      <p className={s.by}>
        <CdekBadge /> доставит заказ
      </p>

      <div className={f.field} data-error={hint ? '' : undefined}>
        <span>Город</span>
        <button type="button" className={`press ${f.select}`} onClick={() => setScreen('city')}>
          <span data-empty={!city || undefined}>{city?.title ?? 'Выбери город'}</span>
          <Icon name="chevron" size={20} />
        </button>
        {hint && <b role="alert">{hint}</b>}
      </div>

      {city && quote.error && (
        <div className={s.error}>
          <p>СДЭК не отвечает. Цены и пункты пока не видно.</p>
          <Button variant="secondary" size="sm" onClick={quote.retry}>
            Повторить
          </Button>
        </div>
      )}

      {city && !quote.error && (
        <>
          <div className={s.modes} role="radiogroup" aria-label="Как доставить">
            {(['point', 'door'] as const).map((m) => {
              const t = m === 'door' ? door : pointTariff
              const from = m === 'point' && !point && PVZ?.price !== POSTAMAT?.price
              return (
                <button key={m} type="button" role="radio" aria-checked={m === mode} className={`press ${s.mode}`} disabled={!quote.loading && !t} onClick={() => setMode(m)}>
                  <Icon name={m === 'point' ? 'pin' : 'home'} size={24} />
                  <b>{m === 'point' ? 'Пункт или постамат' : 'Курьер до двери'}</b>
                  {quote.loading ? (
                    <Skeleton w={96} h={34} />
                  ) : t ? (
                    <span>
                      <strong>
                        {from && 'от '}
                        {num(t.price)} ₽
                      </strong>
                      {term(t)}
                    </span>
                  ) : (
                    <span>сюда так не возят</span>
                  )}
                </button>
              )
            })}
          </div>

          {mode === 'point' && (
            <button type="button" className={`press ${s.place}`} data-chosen={point ? '' : undefined} onClick={() => setScreen('point')}>
              <span className={s.pin}>
                <Icon name="pin" size={24} />
              </span>
              <span className={s.placeText}>
                <b>{point ? point.address : 'Пункт не выбран'}</b>
                {point ? about(point) : 'посмотри на карте или в списке'}
              </span>
              <Icon name="chevron" size={20} />
            </button>
          )}

          {mode === 'door' && (
            <form id="door" className={`${f.form} ${s.door}`} noValidate onSubmit={form.submit}>
              <Field label="Улица" autoComplete="address-line1" enterKeyHint="next" {...form.bind('street')} />
              <div className={f.two}>
                <Field label="Дом" enterKeyHint="next" {...form.bind('house')} />
                <Field label="Квартира" inputMode="numeric" enterKeyHint="next" {...form.bind('flat', digits)} />
                <Field label="Подъезд" inputMode="numeric" enterKeyHint="next" {...form.bind('entrance', digits)} />
                <Field label="Этаж" inputMode="numeric" enterKeyHint="next" {...form.bind('floor', digits)} />
              </div>
              <Field label="Комментарий курьеру" enterKeyHint="done" {...form.bind('comment')} />
            </form>
          )}
        </>
      )}
    </Screen>
  )
}

function CityPicker({ value, onBack, onPick }: { value?: City; onBack: () => void; onPick: (c: City) => void }) {
  const [q, setQ] = useState('')
  const list = CITIES.filter((c) => c.title.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <Screen title="Город" onBack={onBack}>
      <div className={f.form}>
        <Field label="Поиск" required value={q} onText={setQ} placeholder="Начни вводить" autoComplete="off" enterKeyHint="search" />
      </div>
      {list.length === 0 && <p className={f.none}>Такого города в списке нет. Проверь название или выбери ближайший.</p>}
      <ul className={f.list}>
        {list.map((c) => (
          <li key={c.code}>
            <button type="button" className="press" aria-pressed={c.code === value?.code} onClick={() => onPick(c)}>
              <span>{c.title}</span>
              <Icon name={c.code === value?.code ? 'check' : 'chevron'} size={20} />
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
