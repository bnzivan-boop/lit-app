import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import s from './Toast.module.css'

type Props = { text: string; ok?: boolean; onDone: () => void }

export function Toast({ text, ok = true, onDone }: Props) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setLeaving(true), 1800)
    const b = setTimeout(onDone, 2050)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [onDone])
  return createPortal(
    <div className={`${s.toast} ${leaving ? s.leaving : ''}`} role="status">
      <Icon name={ok ? 'check' : 'info'} size={18} />
      {text}
    </div>,
    document.body,
  )
}
