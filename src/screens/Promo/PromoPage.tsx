import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Sheet } from '../../components/Sheet'
import { Tag } from '../../components/Tag'
import { TopBar } from '../../components/TopBar'
import { left, num, plural } from '../../data/format'
import { findPromo, promoArt, type PromoPrize } from '../../data/promos'
import { useStore } from '../../data/store'
import { useOpen, useOrigin } from '../../lib/useOrigin'
import { PromoTimer } from './PromoTimer'
import { ScanDock } from './ScanDock'
import s from './PromoPage.module.css'
import t from './theme.module.css'

/** Страница акции, один шаблон на все: заголовок, баннер, твоё участие, призы, правила, срок */
export function PromoPage() {
  const { id } = useParams()
  const back = useOrigin('/promo')
  const open = useOpen()
  const { balance, promo: mine, now, boost } = useStore()
  const [sheet, setSheet] = useState(false)
  const p = findPromo(id)
  if (!p) return <Navigate to="/promo" replace />
  const ms = Date.parse(p.endsAt) - now
  return (
    <main className={`${t.theme} ${s.page}`} data-theme={p.theme}>
      <TopBar nick={p.title} balance={balance} onBack={back} after={300} />
      <section className={s.hero}>
        <button type="button" className={`press ${s.back}`} aria-label="К акциям" onClick={back}>
          <Icon name="chevron" size={24} />
        </button>
        <span className={s.ends}>
          <Tag tone="dark">{left(ms)}</Tag>
        </span>
        <h1>{p.name}</h1>
        <p>{p.lead}</p>
        <img className={s.scene} src={promoArt(p.scene)} alt="" />
      </section>

      <section className={s.mine} aria-label="Твоё участие">
        <span>
          <b>{num(mine.receipts)}</b> {plural(mine.receipts, ['чек', 'чека', 'чеков'])}
        </span>
        <button type="button" className="press" onClick={() => setSheet(true)}>
          <b>{num(mine.tickets)}</b> {plural(mine.tickets, ['билет', 'билета', 'билетов'])}
          <Icon name="info" size={17} />
        </button>
        {p.dreams && (
          <span>
            <b>{num(mine.dreams)}</b> {plural(mine.dreams, ['мечта', 'мечты', 'мечт'])}
          </span>
        )}
      </section>

      <section className={s.section}>
        <h2>Призы</h2>
        <div className={s.grid}>
          {p.super.map((x) => (
            <Prize key={x.title} prize={x} main />
          ))}
          {p.prizes.map((x, i) => (
            <Prize key={x.title} prize={x} tone={i % 3} />
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2>Как участвовать</h2>
        <ol className={s.rules}>
          {p.steps.map((x, i) => (
            <li key={x}>
              <b>{i + 1}</b>
              {x}
            </li>
          ))}
        </ol>
      </section>

      <section className={s.section}>
        <h2>До конца акции</h2>
        <PromoTimer msLeft={ms} />
      </section>

      <ScanDock page tickets={mine.tickets} boosted={boost.msLeft > 0} onClick={() => open('/scan')} />

      {sheet && (
        <Sheet label="Билеты" onClose={() => setSheet(false)}>
          <h2 className={s.sheetTitle}>Что такое билет</h2>
          <p className={s.sheetText}>Билет — это твоё участие в розыгрыше. Даём за каждый чек с LIT Energy. Больше билетов — выше шанс выиграть.</p>
          <Button variant="secondary" onClick={() => setSheet(false)}>
            Понятно
          </Button>
        </Sheet>
      )}
    </main>
  )
}

/** Плитка приза. Супер-приз — широкая, с наклейкой */
function Prize({ prize: x, tone, main }: { prize: PromoPrize; tone?: number; main?: boolean }) {
  return (
    <figure className={s.prize} data-image={x.image} data-size={main ? 'super' : x.size} data-tone={tone}>
      {!main && <i className={s.prizeFlame} aria-hidden />}
      <img src={promoArt(x.image)} alt="" loading="lazy" />
      {x.count && (
        <Tag big className={s.count}>
          ×{x.count}
        </Tag>
      )}
      <figcaption>
        {main && <Tag>Супер-приз</Tag>}
        <b>{x.title}</b>
        {x.note && <span>{x.note}</span>}
      </figcaption>
    </figure>
  )
}
