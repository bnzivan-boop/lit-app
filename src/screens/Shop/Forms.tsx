import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { Button } from '../../components/Button'
import { ORDER, type Recipient } from '../../data/shop'
import { haptic } from '../../lib/motion'
import { Screen } from '../../components/Screen'
import s from './Forms.module.css'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; onText: (v: string) => void }

export function Field({ label, error, onText, required, ...rest }: FieldProps) {
  return (
    <label className={s.field} data-error={error ? '' : undefined}>
      <span>
        {label}
        {!required && <i>необязательно</i>}
      </span>
      <input {...rest} aria-invalid={Boolean(error)} onChange={(e) => onText(e.target.value)} />
      {error && <b role="alert">{error}</b>}
    </label>
  )
}

/** +7 900 000-00-00 по мере ввода */
export function phoneMask(v: string) {
  let d = v.replace(/\D/g, '')
  if (d.startsWith('8')) d = `7${d.slice(1)}`
  if (d && !d.startsWith('7')) d = `7${d}`
  d = d.slice(0, 11)
  if (d.length <= 1) return d ? '+7' : ''
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
  return `+7 ${p[0]}${p[1] && ` ${p[1]}`}${p[2] && `-${p[2]}`}${p[3] && `-${p[3]}`}`
}

type FormProps<T> = { value?: T; onBack: () => void; onSave: (v: T) => void }

/** Проверка при сохранении: первая ошибка получает фокус */
export function useForm<T extends Record<string, string>>(start: T, rules: Partial<Record<keyof T, (v: string) => string>>, onSave: (v: T) => void) {
  const [v, setV] = useState(start)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const bind = (name: keyof T & string, map: (x: string) => string = (x) => x) => ({
    name,
    value: v[name],
    error: errors[name],
    required: Boolean(rules[name]),
    onText: (x: string) => {
      setV({ ...v, [name]: map(x) })
      setErrors({ ...errors, [name]: undefined })
    },
  })
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found: Partial<Record<keyof T, string>> = {}
    for (const k in rules) {
      const text = rules[k]?.(v[k].trim())
      if (text) found[k] = text
    }
    setErrors(found)
    const first = Object.keys(found)[0]
    if (!first) return onSave(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.trim()])) as T)
    haptic('land')
    e.currentTarget.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus()
  }
  return { v, bind, submit, errors, set: (x: Partial<T>) => setV({ ...v, ...x }) }
}

export const filled = (text: string) => (v: string) => (v ? '' : text)

/** phone — номер из настроек, если получателя ещё нет */
export function RecipientForm({ value, phone = '', onBack, onSave }: FormProps<Recipient> & { phone?: string }) {
  const f = useForm<Recipient>(
    value ?? { surname: '', name: '', patronymic: '', phone, email: '' },
    {
      surname: filled('Нужна фамилия, как в документе'),
      name: filled('Нужно имя, как в документе'),
      phone: (v) => (v.replace(/\D/g, '').length === 11 ? '' : 'В номере должно быть 11 цифр'),
      email: (v) => (/^\S+@\S+\.\S{2,}$/.test(v) ? '' : 'Проверь почту: нужен вид name@mail.ru'),
    },
    onSave,
  )
  return (
    <Screen title="Получатель" onBack={onBack} footer={<Button type="submit" form="recipient">Сохранить</Button>}>
      <form id="recipient" className={s.form} noValidate onSubmit={f.submit}>
        <Field label="Фамилия" autoComplete="family-name" enterKeyHint="next" {...f.bind('surname')} />
        <Field label="Имя" autoComplete="given-name" enterKeyHint="next" {...f.bind('name')} />
        <Field label="Отчество" autoComplete="additional-name" enterKeyHint="next" {...f.bind('patronymic')} />
        <h2>Контакты</h2>
        <Field label="Телефон" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" enterKeyHint="next" {...f.bind('phone', phoneMask)} />
        <Field label="Почта" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" placeholder="name@mail.ru" enterKeyHint="done" {...f.bind('email')} />
      </form>
    </Screen>
  )
}

export function PaymentForm({ value, onBack, onSave }: FormProps<string>) {
  const [pick, setPick] = useState(value ?? ORDER.payments[0])
  return (
    <Screen title="Оплата" onBack={onBack} footer={<Button onClick={() => onSave(pick)}>Сохранить</Button>}>
      <p className={s.lead}>Товары списываются хардом. Рублями — только сервисный сбор агрегатора и доставка, если она нужна.</p>
      <div className={s.pays} role="radiogroup" aria-label="Способ оплаты">
        {ORDER.payments.map((p) => (
          <button key={p} type="button" role="radio" aria-checked={p === pick} className="press" onClick={() => setPick(p)}>
            <span>{p}</span>
            <i />
          </button>
        ))}
      </div>
    </Screen>
  )
}
