import { useState } from 'react'
import { Button, IconButton } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Rewards } from '../../components/Rewards'
import { Sheet } from '../../components/Sheet'
import { left } from '../../data/format'
import { PARTNERS } from '../../data/store'
import { PartnerLogo, QuestArt, QuestBar, type QuestView } from './parts'
import { VideoField } from './VideoField'
import { VideoReview } from './VideoReview'
import s from './QuestSheet.module.css'

const KIND = { super: 'Супер-задание', partner: 'От партнёра', weekly: 'Задание недели', daily: 'Задание дня' } as const

type Props = { q: QuestView; endsAt: number; now: number; onClose: () => void; onClaim: () => void; onGo: () => void; onSubmit?: (link: string) => void; onApprove?: () => void }

/** Раскрытое задание: что сделать, прогресс, награда, условия и одно действие по статусу */
export function QuestSheet({ q, endsAt, now, onClose, onClaim, onGo, onSubmit, onApprove }: Props) {
  const [edit, setEdit] = useState(false)
  const brand = q.partner ? PARTNERS[q.partner].color : undefined
  const video = q.how === 'upload'
  const review = q.status === 'review'
  const form = video && (edit || q.status === 'todo' || q.status === 'active')
  /* какие шаги уже пройдены: последний шаг всегда «собери награду» */
  const passed = q.status === 'claimed' ? q.steps.length : q.status === 'ready' || review ? q.steps.length - 1 : 0
  return (
    <Sheet label={q.title} onClose={onClose}>
      <div className={s.art} style={{ '--brand': brand ?? 'var(--accent)' } as React.CSSProperties} data-game={q.game || undefined}>
        <span className={s.flame} aria-hidden />
        <QuestArt q={q} />
        {q.partner && (
          <span className={s.logo}>
            <PartnerLogo id={q.partner} />
          </span>
        )}
        <IconButton icon="close" label="Закрыть задание" onClick={onClose} className={s.close} />
      </div>

      <div className={s.head}>
        <span className={s.kind}>{q.tag ?? KIND[q.kind]}</span>
        <span className={s.left}>{q.status === 'claimed' ? 'выполнено' : review ? 'обычно до суток' : left(endsAt - now)}</span>
      </div>
      <h2 className={s.title}>{q.title}</h2>

      <div className={s.bar}>
        {review && q.link ? <VideoReview link={q.link} onEdit={() => setEdit(true)} /> : <QuestBar q={q} />}
      </div>

      <h3 className={s.sub}>Награда</h3>
      <div className={s.rewards}>
        <Rewards reward={q.reward} size="lg" />
      </div>
      {q.bonus && <p className={s.bonus}>И буст ×2 к силе и XP на 24 часа за любой чек</p>}

      <h3 className={s.sub}>Как выполнить</h3>
      <ol className={s.steps}>
        {q.steps.map((step, i) => (
          <li key={step} className={i < passed ? s.passed : ''}>
            <span>{i < passed ? <Icon name="check" size={16} /> : i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <p className={s.rules}>{q.rules}</p>

      <div className={s.action}>
        {form ? (
          <VideoField
            open={edit}
            initial={q.link}
            onOpen={() => setEdit(true)}
            onSubmit={(link) => {
              setEdit(false)
              onSubmit?.(link)
            }}
          />
        ) : q.status === 'ready' ? (
          <Button onClick={onClaim}>Собрать награду</Button>
        ) : q.status === 'claimed' || review ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              К заданиям
            </Button>
            {review && onApprove && (
              <button type="button" className={s.demo} onClick={onApprove}>
                Подтвердить видео (демо)
              </button>
            )}
          </>
        ) : (
          <Button onClick={onGo}>{q.how === 'game' ? 'Играть' : 'Отсканировать чек'}</Button>
        )}
      </div>
    </Sheet>
  )
}
