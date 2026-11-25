/* Вход по коду. Это занавеска, а не сейф: файлы сайта лежат открыто, код лишь отсекает случайных людей.
   В сборке только отпечаток кода (PBKDF2), сам код задаётся при сборке через APP_CODE. */

const KEY = 'lit-access'

async function hash(code: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode('lit-app'), iterations: 600_000 }, key, 256)
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Запомнить устройство. Хранилище бывает закрыто — тогда спросим ещё раз */
function remember() {
  try {
    localStorage.setItem(KEY, __CODE_HASH__)
  } catch {
    /* приватный режим */
  }
}

function remembered() {
  try {
    return localStorage.getItem(KEY) === __CODE_HASH__
  } catch {
    return false
  }
}

export async function enter(code: string) {
  const ok = (await hash(code.trim())) === __CODE_HASH__
  if (ok) remember()
  return ok
}

/** Пускать ли сразу: входа нет, устройство знакомо или код вписан в ссылку (#КОД) */
export async function hasAccess() {
  if (!__CODE_HASH__ || remembered()) return true
  const raw = location.hash.slice(1)
  /* Telegram кладёт в адрес свои данные, их не трогаем */
  if (!raw || raw.includes('tgWebApp')) return false
  history.replaceState(null, '', location.pathname + location.search)
  try {
    return await enter(decodeURIComponent(raw))
  } catch {
    return false
  }
}
