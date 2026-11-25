import { useId, useState } from 'react'
import mock from '../../../data/mock.json'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { useOrigin, useOpen } from '../../lib/useOrigin'
import { Row, Rows } from './Rows'
import s from './Faq.module.css'

/** Частые вопросы: один ответ раскрыт, остальные свёрнуты */
export function Faq() {
  const back = useOrigin()
  const open = useOpen()
  const [shown, setShown] = useState('')
  return (
    <Screen title="Частые вопросы" onBack={back}>
      {mock.faq.map((g) => (
        <section key={g.title} className={s.group}>
          <h2>{g.title}</h2>
          <div className={s.list}>
            {g.items.map((i) => (
              <Item key={i.q} {...i} on={shown === i.q} onToggle={() => setShown(shown === i.q ? '' : i.q)} />
            ))}
          </div>
        </section>
      ))}
      <div className={s.more}>
        <Rows>
          <Row icon="chat" title="Не нашёл ответ" value="напиши в поддержку" onClick={() => open('/support')} />
        </Rows>
      </div>
    </Screen>
  )
}

function Item({ q, a, on, onToggle }: { q: string; a: string; on: boolean; onToggle: () => void }) {
  const id = useId()
  return (
    <div className={s.item} data-on={on || undefined}>
      <h3>
        <button type="button" aria-expanded={on} aria-controls={id} onClick={onToggle}>
          {q}
          <Icon name="chevron" size={20} />
        </button>
      </h3>
      <div id={id} className={s.drop} inert={!on}>
        <p>{a}</p>
      </div>
    </div>
  )
}
