/* Мелкие инструменты сбора: плавное число и полёт монет. */

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Кадры от 0 до 1 с замедлением к концу. Возвращает отмену. */
export function tween(ms: number, onStep: (k: number) => void, onDone?: () => void) {
  if (reduced()) {
    onStep(1)
    onDone?.()
    return () => {}
  }
  let id = 0
  const start = performance.now()
  const tick = (now: number) => {
    const x = Math.min(1, Math.max(0, (now - start) / ms))
    onStep(1 - (1 - x) ** 3)
    if (x < 1) id = requestAnimationFrame(tick)
    else onDone?.()
  }
  id = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(id)
}

/** Монеты разлетаются из точки и собираются в цель. onLand — на каждую прилетевшую. */
export function flyCoins(layer: HTMLElement, from: DOMRect, to: DOMRect, count: number, onLand: (i: number) => void, kind: 'soft' | 'hard' = 'soft') {
  const x0 = from.left + from.width / 2
  const y0 = from.top + from.height / 2
  const x1 = to.left + to.width / 2
  const y1 = to.top + to.height / 2
  for (let i = 0; i < count; i++) {
    const size = 26 + (i % 4) * 9
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.35
    const reach = 90 + (i % 5) * 22
    /* не даём монетам уйти за край экрана */
    const bx = Math.min(innerWidth - 24 - x0, Math.max(24 - x0, Math.cos(angle) * reach))
    const by = Math.sin(angle) * reach * 0.8 - 20
    const spin = (i % 2 ? 1 : -1) * (120 + (i % 4) * 60)
    const img = document.createElement('img')
    img.src = `/assets/currency/coin-${kind}.png`
    img.alt = ''
    img.style.cssText = `position:fixed;left:${x0 - size / 2}px;top:${y0 - size / 2}px;width:${size}px;height:${size}px;pointer-events:none;will-change:transform`
    layer.append(img)
    const delay = i * 28
    const flight = img.animate(
      [
        { transform: 'translate(0,0) scale(.5) rotate(0deg)', opacity: 0, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        { transform: `translate(${bx * 0.5}px,${by * 0.5}px) scale(1)`, opacity: 1, offset: 0.12, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        { transform: `translate(${bx}px,${by}px) scale(1) rotate(${spin * 0.6}deg)`, opacity: 1, offset: 0.48, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' },
        { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(${18 / size}) rotate(${spin}deg)`, opacity: 1 },
      ],
      { duration: 1050, delay, fill: 'both' },
    )
    flight.onfinish = () => {
      img.remove()
      onLand(i)
    }
  }
}

type HapticApi = { impactOccurred(s: string): void; notificationOccurred(s: string): void }

export function haptic(kind: 'press' | 'land' | 'done') {
  const api = (window as { Telegram?: { WebApp?: { HapticFeedback?: HapticApi } } }).Telegram?.WebApp?.HapticFeedback
  if (kind === 'done') api?.notificationOccurred('success')
  else api?.impactOccurred(kind === 'press' ? 'heavy' : 'light')
}
