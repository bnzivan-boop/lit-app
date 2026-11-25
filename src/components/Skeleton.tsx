import s from './Skeleton.module.css'

type Props = { w?: number | string; h?: number | string; r?: number | string }

export function Skeleton({ w = '100%', h = 12, r = 6 }: Props) {
  return <span className={s.skeleton} style={{ width: w, height: h, borderRadius: r }} aria-hidden />
}
