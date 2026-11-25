import { useEffect, useState } from 'react'
import s from './DeviceFrame.module.css'

/* На широком экране показываем приложение в iPhone. Внутри — то же приложение
   во фрейме 390×844, поэтому вся вёрстка честно работает в ширине телефона. */

const W = 390
const H = 844
const BEZEL = 12

const fit = () => Math.min(1, (innerHeight - 48) / (H + BEZEL * 2))

export function DeviceFrame() {
  const [scale, setScale] = useState(fit)
  const [src] = useState(() => {
    const url = new URL(location.href)
    url.searchParams.set('ios', '1')
    return url.toString()
  })
  useEffect(() => {
    const onResize = () => setScale(fit())
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [])
  return (
    <div className={s.stage}>
      <div className={s.box} style={{ width: (W + BEZEL * 2) * scale, height: (H + BEZEL * 2) * scale }}>
        <div className={s.phone} style={{ transform: `scale(${scale})` }}>
          <iframe className={s.screen} src={src} title="LIT Energy на iPhone" width={W} height={H} allow="clipboard-write" />
        </div>
      </div>
    </div>
  )
}
