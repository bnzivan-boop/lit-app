import { reduced } from './motion'
import s from './sparks.module.css'

/** Фирменные огоньки разлетаются из центра элемента. Возвращает уборку */
export function sparks(host: HTMLElement, from: HTMLElement, count: number) {
  if (reduced()) return () => {}
  const box = from.getBoundingClientRect()
  const base = host.getBoundingClientRect()
  const nodes = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + (i % 3) * 0.2
    const far = 190 + (i % 5) * 62
    const size = 14 + (i % 4) * 9
    const turn = i % 2 ? 1 : -1
    const n = document.createElement('i')
    n.className = s.spark
    n.style.cssText = `left:${box.left - base.left + box.width / 2}px;top:${box.top - base.top + box.height / 2}px;width:${size}px`
    host.append(n)
    n.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        {
          transform: `translate(-50%,-50%) translate(${Math.cos(a) * far}px,${Math.sin(a) * far}px) rotate(${turn * 70}deg) scale(1)`,
          opacity: 1,
          offset: 0.7,
        },
        {
          transform: `translate(-50%,-50%) translate(${Math.cos(a) * far * 1.1}px,${Math.sin(a) * far * 1.1 + 40}px) rotate(${turn * 90}deg) scale(.5)`,
          opacity: 0,
        },
      ],
      { duration: 1000 + (i % 4) * 160, easing: 'cubic-bezier(0.12, 0.8, 0.2, 1)', fill: 'forwards' },
    ).onfinish = () => n.remove()
    return n
  })
  return () => nodes.forEach((n) => n.remove())
}
