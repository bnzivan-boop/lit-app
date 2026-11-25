/** Копирует текст. Внутри Telegram и фрейма буфер бывает закрыт, тогда старый способ */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.style.cssText = 'position:fixed;opacity:0'
    document.body.append(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}
