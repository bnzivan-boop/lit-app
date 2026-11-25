import s from './PromoBanner.module.css'

type Props = { image: string; alt: string; onClick?: () => void; pressed?: boolean }

export function PromoBanner({ image, alt, onClick, pressed }: Props) {
  return (
    <button type="button" className={`press ${s.banner}`} onClick={onClick} data-pressed={pressed || undefined}>
      <img src={image} alt={alt} width={1074} height={417} />
    </button>
  )
}
