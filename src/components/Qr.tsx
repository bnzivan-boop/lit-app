/* Рисунок QR для демо: узор похож на настоящий, но ничего не кодирует */
const N = 25
const finder = (x: number, y: number) =>
  [[0, 0], [N - 7, 0], [0, N - 7]].some(([a, b]) => x >= a - 1 && x < a + 8 && y >= b - 1 && y < b + 8)

const CELLS = Array.from({ length: N * N }, (_, i) => [i % N, Math.floor(i / N)] as const).filter(
  ([x, y]) => !finder(x, y) && ((x * 7 + y * 13 + x * y * 3 + ((x ^ y) << 1)) % 5 < 2 || (x + y * 3) % 11 === 0),
)

export function Qr({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" aria-hidden>
      {CELLS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
      ))}
      {[[0, 0], [N - 7, 0], [0, N - 7]].map(([x, y]) => (
        <path key={`${x}${y}`} fillRule="evenodd" d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`} />
      ))}
    </svg>
  )
}
