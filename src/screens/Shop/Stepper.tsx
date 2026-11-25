import { Icon } from '../../components/Icon'
import { haptic } from '../../lib/motion'
import s from './Stepper.module.css'

type Props = { value: number; max: number; big?: boolean; onChange: (n: number) => void }

export function Stepper({ value, max, big, onChange }: Props) {
  const set = (n: number) => {
    haptic('land')
    onChange(n)
  }
  return (
    <span className={s.stepper} data-big={big || undefined}>
      <button type="button" className="press" aria-label={value === 1 ? 'Убрать' : 'Меньше'} onClick={() => set(value - 1)}>
        <Icon name={big && value === 1 ? 'trash' : 'minus'} size={20} />
      </button>
      <b key={value} aria-live="polite">
        {value}
      </b>
      <button type="button" className="press" aria-label="Больше" disabled={value >= max} onClick={() => set(value + 1)}>
        <Icon name="plus" size={20} />
      </button>
    </span>
  )
}
