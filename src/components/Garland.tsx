import { isNewYear } from '../lib/theme'

/** Гирлянда над кнопкой скана: провод дугой и пять лампочек. Только в новогодней теме */
export function Garland() {
  if (!isNewYear()) return null
  return (
    <svg className="ny-garland" viewBox="0 0 96 22" aria-hidden>
      <path className="ny-wire" d="M2 4 Q48 26 94 4" />
      {[
        [12, 9.6],
        [30, 14.4],
        [48, 16],
        [66, 14.4],
        [84, 9.6],
      ].map(([x, y], i) => (
        <g key={i} className="ny-bulb" data-i={i} transform={`translate(${x} ${y})`}>
          <rect x="-1.6" y="-1" width="3.2" height="2.6" rx="0.6" className="ny-cap" />
          <ellipse cx="0" cy="4.4" rx="2.6" ry="3.6" />
        </g>
      ))}
    </svg>
  )
}
