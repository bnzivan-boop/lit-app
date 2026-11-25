import { useNavigate } from 'react-router'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { useOpen } from '../../lib/useOrigin'
import s from './BalanceSheet.module.css'

type Props = {
  balance: { soft: number; hard: number }
  /** не хватает на товар: показываем, как добрать */
  need?: number
  onClose: () => void
}

/** Что такое софт и хард и откуда их брать */
export function BalanceSheet({ balance, need, onClose }: Props) {
  const go = useNavigate()
  const open = useOpen()
  if (need)
    return (
      <Sheet label="Как добрать хард" onClose={onClose}>
        <h2 className={s.title}>
          Не хватает <Amount value={need} kind="hard" coin={20} />
        </h2>
        <ul className={s.ways}>
          <li>
            <button type="button" className="press" onClick={() => open('/scan')}>
              <b>Сканируй чеки</b>
              <span>главный источник харда</span>
            </button>
          </li>
          <li>
            <button type="button" className="press" onClick={() => go('/tasks')}>
              <b>Выполняй задания</b>
              <span>партнёрские и недельные платят хардом</span>
            </button>
          </li>
          <li>
            <button type="button" className="press" onClick={() => go('/')}>
              <b>Открывай mystery box</b>
              <span>хард выпадает редко, но бывает</span>
            </button>
          </li>
        </ul>
        <Button variant="secondary" onClick={onClose}>
          Понятно
        </Button>
      </Sheet>
    )
  return (
    <Sheet label="Софт и хард" onClose={onClose}>
      <div className={s.pair}>
        <section data-kind="soft">
          <h2>Софт</h2>
          <Amount value={balance.soft} kind="soft" coin={20} />
          <img src="/assets/wheel/soft-3.webp" alt="" />
          <p>Дают игры, задания и заряд. Тратишь на mystery box.</p>
        </section>
        <section data-kind="hard">
          <h2>Хард</h2>
          <Amount value={balance.hard} kind="hard" coin={20} />
          <img src="/assets/wheel/hard-3.webp" alt="" />
          <p>Дают чеки, задания и mystery box. Тратишь на призы.</p>
        </section>
      </div>
      <Button onClick={onClose}>Понятно</Button>
    </Sheet>
  )
}
