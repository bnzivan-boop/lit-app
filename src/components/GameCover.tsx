import { useId } from 'react'
import s from './GameCover.module.css'

/* Обложка задания. Обложка игры — из моков. Нет обложки — временный рисунок в цветах бренда.
   У чека своя сцена: телефон со сканом и банка. */

type Props = { game?: string; receipt?: boolean; cover?: string; title: string }

export function GameCover({ game, receipt, cover, title }: Props) {
  return (
    <span className={`${s.cover} ${receipt ? s.receipt : ''}`}>
      {receipt ? (
        <>
          <img className={s.phone} src="/assets/products/phone-receipt.webp" alt="" />
          <img className={s.can} src="/assets/products/can-lemonade.webp" alt={title} />
        </>
      ) : cover ? (
        <img className={s.photo} src={cover} alt={title} />
      ) : game === 'energy-jump' ? (
        <JumpArt />
      ) : (
        <RushArt />
      )}
    </span>
  )
}

const FLAME = '/assets/brand/logo-flame-white.png'

function RushArt() {
  return (
    <svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="120" height="120" fill="var(--glow-low)" />
      <path d="M-10 96 130 40v22L-10 118z" fill="var(--glow-mid)" />
      <path d="M-10 70 130 14v10L-10 80z" fill="var(--accent)" />
      <path d="M-10 130 130 74v30L10 152z" fill="var(--accent-ink)" />
      <path d="M0 40 46 22M6 56l28-11M74 100l46-18" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <g transform="rotate(62 66 58)">
        <image href={FLAME} x="38" y="14" width="56" height="84" />
      </g>
    </svg>
  )
}

function JumpArt() {
  const id = useId()
  return (
    <svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <clipPath id={id}>
        <rect width="120" height="120" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="120" height="120" fill="var(--accent-ink)" />
        <circle cx="88" cy="34" r="46" fill="var(--glow-low)" />
        <circle cx="88" cy="34" r="26" fill="var(--glow-mid)" />
        <path d="M-4 104h50l-8 24H-4zM50 82h44l-6 12H56zM86 56h44v11H92z" fill="var(--accent)" />
        <path d="M22 92C28 52 46 34 66 38" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
        <g transform="rotate(-8 64 40)">
          <image href={FLAME} x="40" y="4" width="48" height="72" />
        </g>
      </g>
    </svg>
  )
}
