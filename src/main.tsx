import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tokens.css'
import './base.css'
import './fontLab.css'
import { hasAccess } from './gate/access'
import { Gate } from './gate/Gate'
import { loadTelegram } from './lib/telegram'

/* примерка шрифта заголовков: ?font=… запоминается до закрытия вкладки, ?font=roboto — обычный */
const FONTS = ['steelfish', 'damn', 'coolvetica', 'adderley']
const asked = new URLSearchParams(location.search).get('font')
if (asked) sessionStorage.setItem('font', asked)
const font = sessionStorage.getItem('font')
if (font && FONTS.includes(font)) document.documentElement.dataset.font = font

const root = createRoot(document.getElementById('root')!)

/* само приложение грузим только после входа */
async function start() {
  const { Root } = await import('./Root')
  root.render(
    <StrictMode>
      <Root />
    </StrictMode>,
  )
}

async function boot() {
  const [open] = await Promise.all([hasAccess(), loadTelegram()])
  if (open) return start()
  document.documentElement.removeAttribute('data-boot')
  root.render(
    <StrictMode>
      <Gate onOpen={start} />
    </StrictMode>,
  )
}

void boot()
