import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { haptic } from '../../lib/motion'
import s from './TiltSheet.module.css'

/** Настройка наклона: уровень живёт от датчика, кнопка запоминает удобное положение */
export function TiltSheet({ onClose }: { onClose: () => void }) {
  const dot = useRef<HTMLSpanElement>(null)
  const raw = useRef(0)
  const zero = useRef(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const on = (e: DeviceOrientationEvent) => {
      raw.current = e.gamma ?? 0
      const x = Math.max(-1, Math.min(1, (raw.current - zero.current) / 30))
      if (dot.current) dot.current.style.transform = `translateX(${x * 110}px)`
    }
    addEventListener('deviceorientation', on)
    return () => removeEventListener('deviceorientation', on)
  }, [])

  function save() {
    zero.current = raw.current
    if (dot.current) dot.current.style.transform = 'none'
    haptic('done')
    setSaved(true)
  }

  return (
    <Sheet label="Настройка наклона" onClose={onClose}>
      <h2 className={s.title}>Настрой наклон</h2>
      <p className={s.text}>Возьми телефон так, как удобно играть, и запомни это положение. Прямо будет считаться оно.</p>
      <div className={s.level} data-saved={saved || undefined}>
        <i />
        <span ref={dot} />
      </div>
      <Button onClick={saved ? onClose : save}>{saved ? 'Готово' : 'Запомнить положение'}</Button>
    </Sheet>
  )
}
