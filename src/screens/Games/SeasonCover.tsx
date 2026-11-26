import { useRef } from 'react'
import { Button } from '../../components/Button'
import { LiquidBar } from '../../components/LiquidBar'
import { left, num } from '../../data/format'
import { leagueArt, leagueOf, seasonArt, SEASON } from '../../data/season'
import { usePanel } from '../../lib/usePanel'
import s from './SeasonCover.module.css'

/** Обложка сезона вверху «Игр» — постер: фото на всю обложку, крупное название, лига со шкалой, кнопка */
export function SeasonCover({ now, onOpen }: { now: number; onOpen: () => void }) {
  const frame = useRef<HTMLSpanElement>(null)
  const clip = usePanel(frame, { bottom: [34, 0], r: 0.1 })
  const power = SEASON.power
  const { league, next } = leagueOf(power)
  return (
    <section className={s.cover} data-tour="g-season">
      <span ref={frame} className={s.frame} style={clip}>
        <img className={s.photo} src={seasonArt('titan-cover')} alt="" />
        <span className={s.tint} />
        <span className={s.shade} />
      </span>
      <button type="button" className={s.hit} aria-label={`Сезон «${SEASON.title}»: подробнее`} onClick={onOpen} />
      <span className={s.top}>
        <span className={s.sticker}>Сезон</span>
        <span className={s.ends}>{left(Date.parse(SEASON.endsAt) - now)}</span>
      </span>
      <div className={s.body}>
        <h1>{SEASON.title}</h1>
        <div className={s.me} data-league={league.id}>
          <img className={s.badge} src={leagueArt(league.id)} alt="" />
          <div className={s.stat}>
            <span className={s.row}>
              <b>{league.name}</b>
            </span>
            <span className={s.liquid}>
              <LiquidBar value={power - league.from} max={next ? next.from - league.from : 1} label="До следующей лиги" left={num(power)} right={<span className={s.dim}>{next ? `до ${next.of} ${num(next.from - power)}` : 'высшая лига'}</span>} />
            </span>
          </div>
        </div>
        <Button className={s.go} onClick={onOpen}>
          Перейти в сезон
        </Button>
      </div>
    </section>
  )
}
