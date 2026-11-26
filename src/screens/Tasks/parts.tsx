import { GameCover } from '../../components/GameCover'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { Rewards } from '../../components/Rewards'
import { left, num, plural } from '../../data/format'
import { gameCover, PARTNERS, type Quest, type QuestStatus } from '../../data/store'
import s from './parts.module.css'

export type QuestView = Quest & { status: QuestStatus }

/** «14 товаров» */
export const counted = (q: Quest, n: number) => `${num(n)} ${plural(n, q.unit)}`

export function PartnerLogo({ id }: { id: string }) {
  const p = PARTNERS[id]
  return (
    <span className={s.logo}>
      <img src={p.logo} alt={p.title} />
    </span>
  )
}

export function QuestBar({ q }: { q: Quest }) {
  return <LiquidBar value={q.progress} max={q.goal} label={q.title} left={counted(q, q.progress)} right={`из ${num(q.goal)}`} />
}

type Props = { q: QuestView; now: number; onOpen: () => void; onClaim: () => void; pressed?: boolean }

/** Супер-задание: герой экрана */
export function SuperQuest({ q, now, onOpen, onClaim }: Props) {
  return (
    <section className={s.super} data-tour="t-super">
      <span className={s.superFlame} aria-hidden />
      <span className={s.sticker}>
        Супер
        <i />
        задание
      </span>
      <h1 className={s.superTitle}>{q.title}</h1>
      {q.image && <img className={s.superArt} src={q.image} alt="" />}
      <div className={s.superRewards}>
        <Rewards reward={q.reward} />
      </div>
      <QuestBar q={q} />
      <div className={s.superRow}>
        <span>{q.endsAt ? left(Date.parse(q.endsAt) - now) : ''}</span>
        {q.status === 'ready' ? (
          <button type="button" className={`press ${s.claim}`} onClick={onClaim}>
            Собрать
          </button>
        ) : (
          <button type="button" className={`press ${s.more}`} onClick={onOpen}>
            {q.status === 'claimed' ? 'Награда получена' : 'Подробнее'}
          </button>
        )}
      </div>
    </section>
  )
}

/** Задание партнёра: карточка его цвета */
export function PartnerCard({ q, onOpen, onClaim, pressed }: Omit<Props, 'now'>) {
  const p = PARTNERS[q.partner!]
  const done = q.status === 'claimed'
  return (
    <article className={`${s.partner} ${done ? s.partnerDone : ''}`} style={{ '--brand': p.color } as React.CSSProperties}>
      <button type="button" className={`press ${s.cover}`} onClick={onOpen} data-pressed={pressed || undefined} aria-label={`${q.title}, ${p.title}`} />
      <span className={s.partnerFlame} aria-hidden />
      <div className={s.partnerTop}>
        <h3>{q.title}</h3>
        <PartnerLogo id={q.partner!} />
      </div>
      <div className={s.partnerBottom}>
        <Rewards reward={q.reward} />
        {q.status === 'ready' ? (
          <button type="button" className={`press ${s.claim}`} onClick={onClaim}>
            Собрать
          </button>
        ) : done ? (
          <span className={s.check}>
            <Icon name="check" size={22} />
          </span>
        ) : (
          <span className={s.count}>
            {num(q.progress)} / {num(q.goal)}
          </span>
        )}
      </div>
    </article>
  )
}

/** Недельное задание: кольцо прогресса слева, награда справа */
export function QuestRow({ q, onOpen, onClaim, pressed }: Omit<Props, 'now'>) {
  const part = Math.min(1, q.progress / q.goal)
  const done = q.status === 'claimed'
  return (
    <article className={`${s.row} ${done ? s.rowDone : ''}`}>
      <button type="button" className={`press ${s.cover}`} onClick={onOpen} data-pressed={pressed || undefined} aria-label={q.title} />
      <span className={s.ring} data-review={q.status === 'review' || undefined} aria-hidden>
        <svg viewBox="0 0 64 64">
          <circle r="28" cx="32" cy="32" />
          <circle r="28" cx="32" cy="32" pathLength="100" strokeDasharray={q.status === 'review' ? '26 100' : `${part * 100} 100`} className={s.arc} />
        </svg>
        {q.status === 'review' ? (
          <Icon name="clock" size={30} />
        ) : done || q.status === 'ready' ? (
          <Icon name="check" size={26} />
        ) : (
          <b>
            {num(q.progress)}
            <small>/{num(q.goal)}</small>
          </b>
        )}
      </span>
      <span className={s.rowText}>
        {q.status === 'review' ? <span className={s.review}>Видео на проверке</span> : q.tag && <span className={s.tag}>{q.tag}</span>}
        <span className={s.rowTitle}>{q.title}</span>
        {q.status === 'ready' ? (
          <button type="button" className={`press ${s.claim} ${s.claimWide}`} onClick={onClaim}>
            Собрать
          </button>
        ) : (
          <Rewards reward={q.reward} />
        )}
      </span>
    </article>
  )
}

/** Картинка задания для шторки */
export function QuestArt({ q }: { q: Quest }) {
  if (q.game) return <GameCover game={q.game} cover={gameCover(q.game)} title="" />
  return q.image ? <img src={q.image} alt="" /> : <span className={s.artFlame} />
}
