import { useState } from 'react'
import { Screen } from '../../components/Screen'
import { Toast } from '../../components/Toast'
import { useStore } from '../../data/store'
import { haptic } from '../../lib/motion'
import { askWrite } from '../../lib/telegram'
import { useOrigin } from '../../lib/useOrigin'
import { Rows, SwitchRow } from './Rows'
import s from './Notifications.module.css'

/** Уведомления: бот в Telegram включён или выключен, и о чём он пишет */
export function Notifications() {
  const back = useOrigin()
  const { notify, setNotify, remindDrop, toggleRemind } = useStore()
  const [refused, setRefused] = useState(false)

  async function toggle(on: boolean) {
    haptic('land')
    /* включить можно, только если Telegram разрешил боту писать */
    if (on && !(await askWrite())) return setRefused(true)
    setNotify({ on })
  }

  return (
    <Screen title="Уведомления" onBack={back}>
      <section className={s.hero} data-on={notify.on || undefined}>
        <i aria-hidden />
        <div>
          <h2>{notify.on ? 'Бот пишет' : 'Бот молчит'}</h2>
          <p>{notify.on ? 'Сообщения приходят в Telegram' : 'Ничего не пришлём, пока не включишь'}</p>
        </div>
        <button type="button" role="switch" aria-checked={notify.on} aria-label="Уведомления от бота" className="press" onClick={() => toggle(!notify.on)}>
          {notify.on ? 'Выключить' : 'Включить'}
        </button>
      </section>

      <Rows title="О чём писать">
        <SwitchRow icon="flame" title="Стрик под угрозой" value="вечером, если день ещё не засчитан" on={notify.streak} disabled={!notify.on} onChange={(streak) => setNotify({ streak })} />
        <SwitchRow icon="bolt" title="Заряд полный" value="пора собирать" on={notify.charge} disabled={!notify.on} onChange={(charge) => setNotify({ charge })} />
        <SwitchRow icon="bell" title="Старт дропа" value="перед началом" on={remindDrop} disabled={!notify.on} onChange={toggleRemind} />
        <SwitchRow icon="box" title="Заказы" value="где едет и когда забирать" on={notify.order} disabled={!notify.on} onChange={(order) => setNotify({ order })} />
      </Rows>
      {refused && <Toast text="Telegram не разрешил боту писать" ok={false} onDone={() => setRefused(false)} />}
    </Screen>
  )
}
