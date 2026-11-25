/* Прокрутку под шторками и экранами наград держит общий счётчик.
   Раньше каждый запоминал своё «как было», и при смене шторки на награду страница оставалась заблокированной. */
let locks = 0

/** Запретить прокрутку страницы. Возвращает снятие, повторный вызов безвреден */
export function lockScroll() {
  locks++
  document.body.style.overflow = 'hidden'
  let on = true
  return () => {
    if (!on) return
    on = false
    locks--
    if (locks === 0) document.body.style.overflow = ''
  }
}
