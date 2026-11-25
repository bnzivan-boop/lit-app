import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { CHARTS } from '../../data/shop'
import s from './SizeSheet.module.css'

/** Размерная сетка: что где мерить и таблица */
export function SizeSheet({ chart, onClose }: { chart: 'jacket' | 'shorts'; onClose: () => void }) {
  const t = CHARTS[chart]
  return (
    <Sheet label="Размерная сетка" onClose={onClose}>
      <h2 className={s.title}>{t.title}</h2>
      <div className={s.draw}>{chart === 'jacket' ? <Jacket /> : <Shorts />}</div>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">
              <span className={s.hide}>Мерка</span>
            </th>
            {t.sizes.map((x) => (
              <th key={x} scope="col">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map(([name, ...v], i) => (
            <tr key={name}>
              <th scope="row">
                <i>{i + 1}</i>
                {name}
              </th>
              {v.map((n, k) => (
                <td key={k}>{String(n).replace('.', ',')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={s.note}>В сантиметрах. Реальные мерки могут отличаться на 1–2 см.</p>
      <Button onClick={onClose}>Понятно</Button>
    </Sheet>
  )
}

/* номер мерки на чертеже совпадает с номером строки */
function Mark({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="11" className={s.dot} />
      <text x={x} y={y + 5} className={s.num}>
        {n}
      </text>
    </g>
  )
}

function Jacket() {
  return (
    <svg viewBox="0 0 320 200" aria-hidden>
      <path className={s.line} d="M128 28c8 10 56 10 64 0l34 14 46 96-24 14-26-54v84H98V98l-26 54-24-14 46-96zM160 36v146M98 168h124" />
      <path className={s.measure} d="M236 52v130M98 106h124M98 192h124M84 50 40 134" />
      <Mark x={236} y={118} n={1} />
      <Mark x={130} y={106} n={2} />
      <Mark x={190} y={192} n={3} />
      <Mark x={60} y={94} n={4} />
    </svg>
  )
}

function Shorts() {
  return (
    <svg viewBox="0 0 320 200" aria-hidden>
      <path className={s.line} d="M104 22h112v16H104zM104 38 88 178h62l10-82 10 82h62L216 38M160 38v58" />
      <path className={s.measure} d="M104 12h112M96 92h128M88 190h62M246 22v156" />
      <Mark x={160} y={12} n={1} />
      <Mark x={124} y={92} n={2} />
      <Mark x={119} y={188} n={3} />
      <Mark x={246} y={100} n={4} />
    </svg>
  )
}
