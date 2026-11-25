import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import s from './Button.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
  loading?: boolean
  children: ReactNode
}

/** primary — одна на экран. md занимает всю ширину, sm — по содержимому. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`press ${s.button} ${s[variant]} ${s[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      <span className={s.label}>{children}</span>
      {loading && <span className={s.loader} aria-hidden />}
    </button>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }

export function IconButton({ icon, label, className = '', ...rest }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} {...rest} className={`press ${s.icon} ${className}`}>
      <Icon name={icon} />
    </button>
  )
}
