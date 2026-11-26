/* Новогодняя тема: включается кнопкой «Новый год» в панели или ?theme=ny, ?theme=off — выключить.
   Запоминается на этом устройстве. Все праздничные детали висят на html[data-theme='ny'] — выключение не трогает обычный вид. */

const KEY = 'theme'

export const isNewYear = () => document.documentElement.dataset.theme === 'ny'

export function initTheme() {
  const asked = new URLSearchParams(location.search).get('theme')
  if (asked === 'ny') localStorage.setItem(KEY, 'ny')
  if (asked === 'off') localStorage.removeItem(KEY)
  if (localStorage.getItem(KEY) === 'ny') document.documentElement.dataset.theme = 'ny'
}

/** Переключить тему и перезапустить приложение, чтобы праздник начался с загрузки */
export function toggleNewYear() {
  if (isNewYear()) localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, 'ny')
  const url = new URL(location.href)
  url.searchParams.delete('theme')
  url.searchParams.delete('loader')
  location.replace(url)
}
