import { reduced } from './motion'

const COLORS = ['#f5c84b', '#ffe9a8', '#70fff6', '#ff3b2c', '#ffffff']

/** Праздничное конфетти: выстрел из центра элемента вверх и в стороны, потом плавно падает. Возвращает уборку */
export function confetti(host: HTMLElement, from: HTMLElement, count = 60) {
  if (reduced()) return () => {}
  const box = from.getBoundingClientRect()
  const base = host.getBoundingClientRect()
  const x0 = box.left - base.left + box.width / 2
  const y0 = box.top - base.top + box.height / 2
  const nodes = Array.from({ length: count }, (_, i) => {
    const n = document.createElement('i')
    const w = 6 + (i % 3) * 3
    const round = i % 4 === 0
    n.style.cssText = `position:absolute;z-index:5;left:${x0}px;top:${y0}px;width:${w}px;height:${round ? w : w * 0.45}px;border-radius:${round ? '50%' : '1px'};background:${COLORS[i % COLORS.length]};pointer-events:none`
    host.append(n)
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3
    const v = 180 + Math.random() * 260
    const dx = Math.cos(a) * v
    const up = Math.sin(a) * v
    const fall = 360 + Math.random() * 260
    const spin = (Math.random() - 0.5) * 1080
    const ms = 1600 + Math.random() * 900
    n.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.8}px), calc(-50% + ${up}px)) rotate(${spin * 0.4}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${up + fall}px)) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: ms, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'forwards' },
    ).onfinish = () => n.remove()
    return n
  })
  return () => nodes.forEach((n) => n.remove())
}
