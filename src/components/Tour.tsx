import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { haptic, reduced } from '../lib/motion'
import s from './Tour.module.css'

/** Шаг тура: на каком экране, что подсветить (data-tour), что сказать.
    tap — игрок сам нажимает на подсвеченное (так тур переходит в другой раздел) */
export type TourStep = { page: string; target: string; title: string; text: string; tap?: boolean }

/** Тур по приложению: главная, затем сам ведёшь в задания, игры и магазин */
export const TOUR: TourStep[] = [
  { page: '/', target: 'money', title: 'Софт и хард', text: 'Софт — на кейсы. Хард — на настоящие призы в магазине.' },
  { page: '/', target: 'charge', title: 'Заряд', text: 'Пока тебя нет, копится софт. Заходи и собирай — нажми на плитку.' },
  { page: '/', target: 'streak', title: 'Стрик', text: 'Заходи и играй каждый день. Чем длиннее серия, тем больше наград.' },
  { page: '/', target: 'xp', title: 'Опыт', text: 'XP дают игры, задания и чеки. Он растит уровень.' },
  { page: '/', target: 'level', title: 'Уровень', text: 'За каждый новый уровень — награда. Нажми на уровень, чтобы её забрать.' },
  { page: '/', target: 'tasks', title: 'Задания дня', text: 'Три задания в день. Выполни все три — откроется сундук.' },
  { page: '/', target: 'cases', title: 'Кейсы', text: 'Открывай за софт: внутри софт, хард, бусты и призы.' },
  { page: '/', target: 'drop', title: 'Дроп недели', text: 'Раз в неделю — редкий приз за хард. Штук мало: кто успел, тот забрал.' },
  { page: '/', target: 'tab-scan', title: 'Скан чека', text: 'Главное: сканируй чеки с LIT. За каждый товар — хард, плюс буст ×2 и билет в розыгрыш.' },
  { page: '/', target: 'tab-tasks', title: 'Загляни в задания', text: 'Нажми на «Задания» — покажу, как они устроены.', tap: true },

  { page: '/tasks', target: 't-super', title: 'Суперзадание', text: 'Большая цель на месяц и самая крупная награда. Прогресс копится с каждого чека.' },
  { page: '/tasks', target: 't-partner', title: 'От партнёров', text: 'Купи нужный товар LIT в магазине-партнёре и отсканируй чек. Награду собираешь здесь.' },
  { page: '/tasks', target: 't-weekly', title: 'Еженедельные', text: 'Задания на неделю. Обновляются в понедельник.' },
  { page: '/tasks', target: 't-daily', title: 'Ежедневные', text: 'Те же задания дня, что на главной. Готовое — нажми «Собрать».' },
  { page: '/tasks', target: 'tab-games', title: 'Теперь игры', text: 'Нажми на «Игры».', tap: true },

  { page: '/games', target: 'g-season', title: 'Сезон «Титаны»', text: 'Набирай силу Титана в играх, поднимайся по лигам и забирай награды сезона.' },
  { page: '/games', target: 'g-box', title: 'Mystery box дня', text: 'Дойди до цели в любой игре — и бокс твой. Раз в день.' },
  { page: '/games', target: 'g-games', title: 'Все игры', text: 'Каждая игра даёт софт и XP за очки. Рекорд попадает в рейтинг.' },
  { page: '/games', target: 'tab-shop', title: 'И магазин', text: 'Нажми на «Магазин».', tap: true },

  { page: '/shop', target: 's-drop', title: 'Дроп недели', text: 'Редкий приз за хард в назначенное время. Включи напоминание, чтобы успеть.' },
  { page: '/shop', target: 's-rail', title: 'Полки по лигам', text: 'Чем выше лига, тем дороже призы на полках. Закрытые видно заранее.' },
  { page: '/shop', target: 's-chips', title: 'Разделы', text: 'Мерч, техника, игры, подписки, сертификаты.' },
  { page: '/shop', target: 's-sale', title: 'Скидки', text: 'Цены со скидкой и до какого дня она действует. Потом цена вернётся.' },
]

const PAD = 8
const START = 'tour:start'
/* «Скрыть» убирает тур до следующего открытия приложения */
let hidden = false

/** Запустить тур заново (пункт меню «Как всё устроено») */
export function startTour() {
  hidden = false
  window.dispatchEvent(new Event(START))
}

type Box = { x: number; y: number; w: number; h: number; r: number }

/** Тур живёт в оболочке с нижней панелью: показывает шаг, когда игрок на нужном экране */
export function TourHost() {
  const { pathname } = useLocation()
  const [i, setI] = useState<number | null>(null)

  /* при каждом открытии приложения — с начала, если не скрыли */
  useEffect(() => {
    const t = setTimeout(() => !hidden && setI(0), 900)
    const again = () => setI(0)
    window.addEventListener(START, again)
    return () => {
      clearTimeout(t)
      window.removeEventListener(START, again)
    }
  }, [])

  const onNext = useCallback(() => setI((k) => (k === null || k >= TOUR.length - 1 ? null : k + 1)), [])

  /* пока открыта шторка, меню или окно награды — тур ждёт */
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (i === null) return
    const check = () => setBusy(Boolean(document.querySelector('[role="dialog"]:not([data-tour-layer]), [aria-modal="true"]:not([data-tour-layer])')))
    check()
    const t = setInterval(check, 300)
    return () => clearInterval(t)
  }, [i])

  if (i === null || hidden || busy) return null
  const step = TOUR[i]
  if (step.page !== pathname) return null
  return (
    <TourStepView
      key={i}
      step={step}
      n={i}
      total={TOUR.length}
      onNext={onNext}
      onHide={() => {
        hidden = true
        setI(null)
      }}
    />
  )
}

function TourStepView({ step, n, total, onNext, onHide }: { step: TourStep; n: number; total: number; onNext: () => void; onHide: () => void }) {
  const [box, setBox] = useState<Box | null>(null)
  const [el, setEl] = useState<HTMLElement | null>(null)

  /* блок может появиться не сразу: ждём его до двух секунд, иначе шаг пропускаем */
  useEffect(() => {
    let tries = 0
    let timer = 0
    const find = () => {
      const found = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      if (found) return setEl(found)
      if (++tries > 20) return onNext()
      timer = window.setTimeout(find, 100)
    }
    timer = window.setTimeout(find, 0)
    return () => clearTimeout(timer)
  }, [step, onNext])

  const measure = useCallback(() => {
    if (!el) return
    const r = el.getBoundingClientRect()
    const radius = parseFloat(getComputedStyle(el).borderRadius) || 16
    setBox({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2, r: radius + PAD })
  }, [el])

  useLayoutEffect(() => {
    if (!el) return
    if (!el.closest('nav')) el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior })
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [el, measure])

  const next = () => {
    haptic('press')
    /* шаг «нажми сам»: нажатие проходит в сам блок и ведёт дальше */
    if (step.tap) el?.click()
    onNext()
  }

  if (!box) return null
  /* облачко под блоком, а если внизу мало места — над ним; за край экрана не выходит */
  const TIP = 200
  const below = box.y + box.h + TIP < window.innerHeight
  const tip = below ? { top: Math.max(box.y + box.h + 14, 60) } : { bottom: Math.min(window.innerHeight - box.y + 14, window.innerHeight - TIP - 20) }
  const arrow = Math.min(Math.max(box.x + box.w / 2, 28), window.innerWidth - 28)

  return createPortal(
    <div className={s.layer} data-tour-layer role="dialog" aria-modal="true" aria-label={`Подсказка ${n + 1} из ${total}: ${step.title}`}>
      <button
        type="button"
        className={s.hole}
        data-tap={step.tap || undefined}
        data-still={reduced() || undefined}
        style={{ left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: box.r }}
        aria-label={step.tap ? step.title : 'Дальше'}
        onClick={next}
      />
      <div className={s.tip} data-below={below || undefined} style={{ ...tip, ['--arrow' as string]: `${arrow}px` } as CSSProperties}>
        <span className={s.count}>
          {n + 1} из {total}
        </span>
        <b>{step.title}</b>
        <p>{step.text}</p>
        <div className={s.actions}>
          <button type="button" className={`press ${s.skip}`} onClick={onHide}>
            Скрыть
          </button>
          {step.tap ? (
            <span className={s.hint}>нажми на подсвеченное</span>
          ) : (
            <button type="button" className={`press ${s.next}`} onClick={next}>
              {n < total - 1 ? 'Дальше' : 'Понятно'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
