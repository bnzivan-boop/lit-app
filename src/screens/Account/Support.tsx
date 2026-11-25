import { useState } from 'react'
import mock from '../../../data/mock.json'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { Toast } from '../../components/Toast'
import { useStore } from '../../data/store'
import { copyText } from '../../lib/copy'
import { haptic } from '../../lib/motion'
import { openTelegram } from '../../lib/telegram'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { Row, Rows } from './Rows'
import s from './Support.module.css'

/** Поддержка: чат в Telegram. ID копируется по дороге, чтобы не искать */
export function Support() {
  const back = useOrigin()
  const open = useOpen()
  const { user } = useStore()
  const [toast, setToast] = useState('')
  async function copy() {
    const ok = await copyText(user.id)
    if (ok) haptic('land')
    setToast(ok ? 'ID скопирован' : 'Не получилось скопировать')
  }
  return (
    <Screen
      title="Поддержка"
      onBack={back}
      footer={
        <Button onClick={() => openTelegram(mock.telegram.support)}>
          <Icon name="chat" size={20} /> Открыть чат в Telegram
        </Button>
      }
    >
      <section className={s.hero}>
        <i aria-hidden />
        <h2>Напиши нам</h2>
        <p>Расскажи, что случилось, и приложи скриншот. Ответим в чате.</p>
      </section>
      <Rows note="Вставь ID в первое сообщение: так найдём тебя сразу.">
        <Row icon="copy" title="Скопировать ID" value={user.id} end="copy" onClick={copy} />
        <Row icon="question" title="Частые вопросы" value="может, ответ уже есть" onClick={() => open('/faq')} />
      </Rows>
      {toast && <Toast text={toast} ok={toast === 'ID скопирован'} onDone={() => setToast('')} />}
    </Screen>
  )
}
