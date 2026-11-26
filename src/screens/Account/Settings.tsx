import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import mock from '../../../data/mock.json'
import { Button } from '../../components/Button'
import { Screen } from '../../components/Screen'
import { Toast } from '../../components/Toast'
import { deliveryPlace } from '../../data/shop'
import { useStore } from '../../data/store'
import { copyText } from '../../lib/copy'
import { haptic } from '../../lib/motion'
import { askContact, canAskContact, tgUsername } from '../../lib/telegram'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { DeliveryForm } from '../Shop/DeliveryForm'
import { Field, phoneMask, RecipientForm, useForm } from '../Shop/Forms'
import f from '../Shop/Forms.module.css'
import { Row, Rows } from './Rows'
import s from './Settings.module.css'


/** Настройки: ник, Telegram, телефон, данные доставки. ?edit= открывает форму */
export function Settings() {
  const back = useOrigin()
  const open = useOpen()
  const { state } = useLocation()
  const [params, setParams] = useSearchParams()
  const { user, profile, saveProfile, checkout, saveCheckout, notify } = useStore()
  const [toast, setToast] = useState('')
  const edit = params.get('edit')
  const show = (id?: string) => {
    setParams(id ? { edit: id } : {}, { replace: true, state })
    scrollTo(0, 0)
  }
  const done = (text: string) => {
    haptic('done')
    setToast(text)
    show()
  }
  async function copy() {
    const ok = await copyText(user.id)
    if (ok) haptic('land')
    setToast(ok ? 'ID скопирован' : 'Не получилось скопировать')
  }

  if (edit === 'nick') return <NickForm value={profile.nick} onBack={() => show()} onSave={(nick) => (saveProfile({ nick }), done('Ник изменён'))} />
  if (edit === 'phone') return <PhoneForm value={profile.phone} onBack={() => show()} onSave={(phone) => (saveProfile({ phone }), done('Телефон сохранён'))} />
  if (edit === 'recipient')
    return (
      <RecipientForm
        value={checkout.recipient}
        phone={profile.phone}
        onBack={() => show()}
        onSave={(recipient) => {
          saveCheckout({ recipient })
          done('Получатель сохранён')
        }}
      />
    )
  if (edit === 'delivery')
    return (
      <DeliveryForm
        value={checkout.delivery}
        onBack={() => show()}
        onSave={(delivery) => {
          saveCheckout({ delivery })
          done('Доставка сохранена')
        }}
      />
    )

  const { recipient: r, delivery: d } = checkout
  return (
    <Screen title="Настройки" onBack={back}>
      <button type="button" className={`press ${s.user}`} onClick={() => show('nick')}>
        <img src={user.avatar} alt="" />
        <span>
          <b>{profile.nick}</b>
          изменить ник
        </span>
      </button>
      <Rows title="Аккаунт">
        <Row icon="chat" title="Telegram" value={`@${tgUsername() ?? mock.telegram.username}, меняется в самом Telegram`} />
        <Row icon="phone" title="Телефон" value={profile.phone || 'не указан'} onClick={() => show('phone')} />
        <Row icon="copy" title="ID игрока" value={user.id} end="copy" onClick={copy} />
      </Rows>
      <Rows title="Доставка" note="Подставим эти данные при оформлении заказа.">
        <Row icon="friend" title="Получатель" value={r ? `${[r.surname, r.name].join(' ')}, ${r.phone}` : 'не указан'} onClick={() => show('recipient')} />
        <Row icon="pin" title="Адрес СДЭК" value={d ? deliveryPlace(d) : 'не указан'} onClick={() => show('delivery')} />
      </Rows>
      <Rows title="Приложение">
        <Row icon="bell" title="Уведомления" value={notify.on ? 'включены' : 'выключены'} onClick={() => open('/notifications')} />
      </Rows>
      {toast && <Toast text={toast} ok={!toast.startsWith('Не')} onDone={() => setToast('')} />}
    </Screen>
  )
}

type FormProps = { value: string; onBack: () => void; onSave: (v: string) => void }

function NickForm({ value, onBack, onSave }: FormProps) {
  const form = useForm(
    { nick: value },
    {
      nick: (v) =>
        v.length < 3 ? 'Минимум 3 символа' : v.length > 16 ? 'Максимум 16 символов' : /^[\p{L}\p{N}._-]+$/u.test(v) ? '' : 'Только буквы, цифры, точка, дефис и подчёркивание',
    },
    (v) => onSave(v.nick),
  )
  return (
    <Screen title="Ник" onBack={onBack} footer={<Button type="submit" form="nick">Сохранить</Button>}>
      <form id="nick" className={f.form} noValidate onSubmit={form.submit}>
        <Field label="Как тебя показывать в рейтингах" autoComplete="nickname" autoCapitalize="none" maxLength={20} enterKeyHint="done" {...form.bind('nick')} />
      </form>
    </Screen>
  )
}

function PhoneForm({ value, onBack, onSave }: FormProps) {
  const form = useForm({ phone: value }, { phone: (v) => (v.replace(/\D/g, '').length === 11 ? '' : 'В номере должно быть 11 цифр') }, (v) => onSave(v.phone))
  async function fromTelegram() {
    const phone = await askContact()
    if (phone) onSave(phoneMask(phone))
  }
  return (
    <Screen title="Телефон" onBack={onBack} footer={<Button type="submit" form="phone">Сохранить</Button>}>
      <form id="phone" className={f.form} noValidate onSubmit={form.submit}>
        <Field label="Номер" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" enterKeyHint="done" {...form.bind('phone', phoneMask)} />
        {canAskContact() && (
          <Button variant="secondary" onClick={fromTelegram}>
            Взять из Telegram
          </Button>
        )}
      </form>
    </Screen>
  )
}
