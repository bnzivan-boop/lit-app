import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { LiquidBar } from '../../components/LiquidBar'
import { Sheet } from '../../components/Sheet'
import { TopBar } from '../../components/TopBar'
import { num, plural } from '../../data/format'
import { nextReward, seasonArt, SEASON, type Box } from '../../data/season'
import { useStore } from '../../data/store'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { Back, Power } from './parts'
import s from './Rewards.module.css'

type State = 'open' | 'next' | 'lock'
type Picked = Box & { state: State; when: string; extra?: boolean }

/** Награды сезона: слева базовые за силу, справа дополнительные за товары из чеков, пороги посередине */
export function Rewards() {
  const go = useNavigate()
  const open = useOpen()
  const back = useOrigin('/season')
  const { balance } = useStore()
  const [picked, setPicked] = useState<Picked | null>(null)
  const power = SEASON.power
  const { base, extra, items } = SEASON.rewards
  const reward = nextReward(power)
  const nextExtra = extra.find((x) => x.items > items)
  const prevExtra = [...extra].reverse().find((x) => x.items <= items)?.items ?? 0
  const rows = Math.max(base.length, extra.length)
  /* бирюзовая линия посередине заполнена до текущей силы */
  const done = base.filter((b) => b.power <= power).length
  const share = reward ? done + (power - reward.from) / (reward.power - reward.from) : base.length

  const stateOf = (have: number, need: number, isNext: boolean): State => (have >= need ? 'open' : isNext ? 'next' : 'lock')

  return (
    <main className={s.page}>
      <TopBar nick="Награды" balance={balance} onBack={back} after={160} />
      <section className={s.hero}>
        <img src={seasonArt('titan')} alt="" />
        <Back onClick={back} />
      </section>

      <header className={s.head}>
        <h1>Награды сезона</h1>
        <span className={s.mine}>
          у тебя <Power value={power} />
        </span>
      </header>

      <div className={s.cols}>
        <span className={s.colHead}>
          <b>Базовые</b>
          за силу Титана
        </span>
        <span className={`${s.colHead} ${s.colExtra}`}>
          <b>Дополнительные</b>
          за товары LIT из чеков
        </span>
      </div>

      <div className={s.track} style={{ '--rows': rows, '--done': share } as CSSProperties}>
        <span className={s.rail} aria-hidden>
          <i />
        </span>
        {Array.from({ length: rows }, (_, i) => {
          const b = base[i]
          const x = extra[i]
          const bs = b && stateOf(power, b.power, b.power === reward?.power)
          const xs = x && stateOf(items, x.items, x === nextExtra)
          return (
            <div key={i} className={s.row}>
              {b ? (
                <button type="button" className={`press ${s.tile}`} data-state={bs} onClick={() => setPicked({ ...b, state: bs!, when: `на ${num(b.power)} силы` })}>
                  <img src={seasonArt(b.box)} alt="" />
                  <Mark state={bs!} />
                </button>
              ) : (
                <span />
              )}
              <span className={s.node} data-on={b && b.power <= power ? true : undefined}>
                {b ? num(b.power) : ''}
              </span>
              {x ? (
                <button type="button" className={`press ${s.tile} ${s.extra}`} data-state={xs} onClick={() => setPicked({ ...x, state: xs!, when: `за ${num(x.items)} ${plural(x.items, ['товар', 'товара', 'товаров'])}`, extra: true })}>
                  <img src={seasonArt(x.box)} alt="" />
                  <span className={s.items}>{num(x.items)} шт.</span>
                  <Mark state={xs!} />
                </button>
              ) : (
                <span />
              )}
            </div>
          )
        })}
      </div>

      {nextExtra && (
        <section className={s.extraBox}>
          <b>Товары из чеков: {num(items)}</b>
          <LiquidBar value={items - prevExtra} max={nextExtra.items - prevExtra} label="До дополнительного бокса" left={`${num(items)} шт.`} right={<span className={s.dim}>ещё {num(nextExtra.items - items)} до бокса</span>} />
          <Button variant="secondary" className={s.scan} onClick={() => open('/scan')}>
            <Icon name="scan" size={18} /> Сканировать чек
          </Button>
        </section>
      )}

      <div className={s.dock}>
        <Button onClick={() => go('/season')}>
          <Icon name="play" size={18} /> К испытаниям
        </Button>
      </div>

      {picked && (
        <Sheet label="Что в боксе" onClose={() => setPicked(null)}>
          <div className={s.sheet} data-extra={picked.extra || undefined}>
            <img src={seasonArt(picked.box)} alt="" />
            <span className={s.sheetTag}>{picked.state === 'open' ? 'Получен' : picked.state === 'next' ? 'Следующий' : 'Закрыт'}</span>
            <h2>Бокс содержит</h2>
            <ul>
              <li>
                <Amount value={picked.soft} kind="soft" coin={20} />
                <span>шанс 100 %</span>
              </li>
              <li>
                <Amount value={picked.hard} kind="hard" coin={20} />
                <span>шанс {picked.chance} %</span>
              </li>
            </ul>
            <p>Открывается {picked.when}</p>
          </div>
        </Sheet>
      )}
    </main>
  )
}

function Mark({ state }: { state: State }) {
  if (state === 'next') return null
  return <i className={s.mark}>{state === 'open' ? <Icon name="check" size={16} /> : <Icon name="lock" size={14} />}</i>
}
