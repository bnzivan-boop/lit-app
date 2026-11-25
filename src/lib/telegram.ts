/* Всё, что просим у Telegram. Вне Telegram работает обычный браузер */

type WebApp = {
  initData?: string
  initDataUnsafe?: { user?: { username?: string }; start_param?: string }
  openTelegramLink?: (url: string) => void
  requestWriteAccess?: (done?: (ok: boolean) => void) => void
  requestContact?: (done?: (ok: boolean, e?: { responseUnsafe?: { contact?: { phone_number?: string } } }) => void) => void
}

const app = () => {
  const w = (window as { Telegram?: { WebApp?: WebApp } }).Telegram?.WebApp
  return w?.initData ? w : undefined
}

export const tgUsername = () => app()?.initDataUnsafe?.user?.username
export const tgStart = () => app()?.initDataUnsafe?.start_param

export function openTelegram(url: string) {
  const w = app()
  if (w?.openTelegramLink) w.openTelegramLink(url)
  else window.open(url, '_blank', 'noopener')
}

/** Отправить другу: окно выбора чата */
export const shareTelegram = (url: string, text: string) =>
  openTelegram(`https://t.me/share/url?${new URLSearchParams({ url, text })}`)

/** Разрешить боту писать. Вне Telegram всегда да */
export const askWrite = () =>
  new Promise<boolean>((ok) => {
    const w = app()
    if (w?.requestWriteAccess) w.requestWriteAccess(ok)
    else ok(true)
  })

export const canAskContact = () => Boolean(app()?.requestContact)
export const askContact = () =>
  new Promise<string | null>((ok) => app()?.requestContact?.((done, e) => ok(done ? (e?.responseUnsafe?.contact?.phone_number ?? null) : null)))
