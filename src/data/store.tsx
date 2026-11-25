import { useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import mock from '../../data/mock.json'
import { findGame, GAMES, gameTitle, placeOf, RUN, shortestGame } from './games'
import { codeOf, REFERRAL, type Friend } from './referral'
import { cartCount, cartSum, DROP, isOpen, needsDelivery, ORDER, type CartLine, type Checkout, type DropPhase, type Order } from './shop'
import { StoreContext as Ctx } from './storeContext'
import type { Currency, League, Rarity, Reward } from './types'

/* Локальное состояние поверх моков. Время в демо идёт от момента из сценария, а не от часов телефона. */

export type ScenarioId = keyof typeof mock.demo.scenarios
export const SCENARIOS = Object.keys(mock.demo.scenarios) as ScenarioId[]
const isScenario = (v: string | null): v is ScenarioId => SCENARIOS.includes(v as ScenarioId)
export const scenarioFrom = (v: string | null): ScenarioId =>
  isScenario(v) ? v : (mock.demo.default as ScenarioId)

type Scenario = {
  now: string
  charge?: { current: number }
  streak?: { days?: number; todayDone?: boolean; freezes?: number }
  taskProgress?: Record<string, number>
}

export type Task = {
  id: string
  title: string
  short: string
  hint: string
  game?: string
  type?: string
  goal: number
  progress: number
  reward: Reward
  bonus?: string
}

export type QuestKind = 'super' | 'partner' | 'weekly' | 'daily'
export type Partner = { title: string; color: string; logo: string }

type Match = { shop?: string; tag?: string; any?: boolean }

/** Задание. Всё настраивается данными: срок, цель, награда, условия, какие чеки считаются */
export type Quest = {
  id: string
  kind: QuestKind
  title: string
  tag?: string
  partner?: string
  image?: string
  game?: string
  bonus?: string
  unit: [string, string, string]
  goal: number
  progress: number
  reward: Reward
  /** чем двигается прогресс */
  how: 'receipt' | 'game' | 'upload'
  match?: Match
  endsAt?: string
  steps: string[]
  rules: string
  /** прикреплённая ссылка на видео */
  link?: string
}

/** todo — не начато, active — в процессе, review — видео на проверке, ready — можно собрать, claimed — награда получена */
export type QuestStatus = 'todo' | 'active' | 'review' | 'ready' | 'claimed'

export const PARTNERS = mock.partners as Record<string, Partner>

/* Задание дня в общем виде: для шторки и сбора */
function dailyQuest(t: Task): Quest {
  const game = gameTitle(t.game ?? '')
  const receipt = t.type === 'receipt'
  return {
    id: t.id,
    kind: 'daily',
    title: t.title,
    game: t.game,
    bonus: t.bonus,
    image: receipt ? '/assets/products/can-lemonade.webp' : undefined,
    unit: receipt ? ['чек', 'чека', 'чеков'] : t.goal > 1 ? ['очко', 'очка', 'очков'] : ['игра', 'игры', 'игр'],
    goal: t.goal,
    progress: t.progress,
    reward: t.reward,
    how: receipt ? 'receipt' : 'game',
    steps: receipt
      ? ['Купи газировку LIT', 'Отсканируй чек', 'Собери награду']
      : [`Открой «${game}»`, t.goal > 1 ? `Набери ${t.goal.toLocaleString('ru-RU')} очков за одну игру` : 'Сыграй одну игру', 'Собери награду'],
    rules: 'Задания дня обновляются в 00:00 по Москве.',
  }
}

const DAILY_CHEST = mock.dailyChest.reward as Reward

export type CaseItem = { id: string; title: string; rarity: Rarity; price: { soft: number }; image: string }

export type LootKind = 'soft' | 'hard' | 'boost' | 'frame' | 'headphones' | 'hoodie'
export type Loot = { id: string; kind: LootKind; amount?: number; title: string; rarity: Rarity; weight: number }
export const LOOT = mock.caseLoot as Loot[]

/** Сектор колеса. tier — насколько богатая картинка: от одной монеты до сундука */
export type WheelPrize = { id: string; kind: Currency; amount: number; tier: number; weight: number }
export const WHEEL = mock.wheel as WheelPrize[]

const byWeight = <T extends { weight: number }>(list: T[]) => {
  let x = Math.random() * list.reduce((sum, l) => sum + l.weight, 0)
  return list.find((l) => (x -= l.weight) < 0) ?? list[0]
}
export const rollWheel = () => byWeight(WHEEL)

export type ReceiptItem = { title: string; qty: number; tag: string; hard: number; image: string }

/** Что начислил последний чек */
export type ReceiptResult = {
  shop: string
  items: ReceiptItem[]
  /** сколько заданий чек продвинул и сколько из них теперь можно собрать */
  moved: number
  ready: number
  hard: number
  xp: number
  /** XP удвоен уже действовавшим бустом */
  doubled: boolean
  tickets: number
  boostUntil: number
}

/** Итог последней игры */
export type RunResult = {
  game: string
  score: number
  /** цель дня выполнена */
  win: boolean
  record: boolean
  place: number
  placeBefore: number
  soft: number
  xp: number
  /** mystery box: выдан сейчас, уже получен сегодня, ещё не заработан */
  box: 'won' | 'taken' | 'none'
  taskReady?: string
}

export type Notify = { on: boolean; streak: boolean; charge: boolean; order: boolean }

type State = {
  profile: { nick: string; phone: string }
  notify: Notify
  friends: Friend[]
  invitedBy: string
  cart: CartLine[]
  checkout: Checkout
  orders: Order[]
  best: Record<string, number>
  run: RunResult | null
  boxTaken: boolean
  /** бесплатные открытия mystery box из игр */
  freeBoxes: number
  clock: { base: number; startedAt: number }
  balance: { soft: number; hard: number }
  charge: { value: number; since: number }
  streak: { days: number; freezes: number; todayDone: boolean; milestones: number[] }
  tasks: Task[]
  remindDrop: boolean
  progress: { level: number; xp: number; xpNext: number }
  tickets: number
  boostUntil: number
  receipt: ReceiptResult | null
  inventory: string[]
  quests: Quest[]
  /** id заданий, награда за которые собрана; chest — сундук дня */
  claimed: string[]
  wheelSpun: boolean
}

type Action = { type: 'profile'; data: Partial<State['profile']> } | { type: 'notify'; data: Partial<Notify> } | { type: 'friend'; nick: string; at: number } | { type: 'invited'; code: string } | { type: 'cart'; line: CartLine } | { type: 'checkout'; data: Checkout } | { type: 'order'; at: number } | { type: 'collect'; amount: number; at: number } | { type: 'toggleRemind' } | { type: 'receipt'; at: number } | { type: 'claim'; id: string; at: number } | { type: 'finishGame'; game: string; score: number; at: number } | { type: 'submitVideo'; id: string; link: string } | { type: 'approve'; id: string } | { type: 'spinWheel'; prize: WheelPrize } | { type: 'openCase'; price: number; loots: Loot[]; at: number; free?: boolean }

/* для показа: ?soft=5000 и ?hard=5000 задают баланс */
function demo(kind: 'soft' | 'hard') {
  const v = new URLSearchParams(location.search).get(kind)
  return v && /^\d{1,6}$/.test(v) ? Number(v) : null
}

function init(id: ScenarioId): State {
  const sc = mock.demo.scenarios[id] as Scenario
  const base = Date.parse(sc.now)
  const tasks = (mock.dailyTasks as Task[]).map((t) => ({ ...t, progress: sc.taskProgress?.[t.id] ?? t.progress }))
  return {
    clock: { base, startedAt: Date.now() },
    balance: { soft: demo('soft') ?? mock.user.balance.soft, hard: demo('hard') ?? mock.user.balance.hard },
    profile: { nick: mock.user.nick, phone: '' },
    notify: mock.notify,
    friends: REFERRAL.friends,
    invitedBy: '',
    cart: [],
    checkout: {},
    orders: [],
    charge: { value: sc.charge?.current ?? mock.charge.current, since: base },
    streak: { ...mock.streak, ...sc.streak },
    tasks,
    quests: mock.quests as Quest[],
    claimed: mock.claimed.filter((c) => tasks.some((t) => t.id === c && isDone(t))),
    remindDrop: false,
    progress: { level: mock.user.level, xp: mock.user.xp, xpNext: mock.user.xpNext },
    tickets: 0,
    boostUntil: 0,
    receipt: null,
    inventory: [],
    wheelSpun: false,
    best: Object.fromEntries(GAMES.map((g) => [g.id, g.best])),
    run: null,
    boxTaken: false,
    freeBoxes: 0,
  }
}

const HOUR = 3_600_000
/* шаг уровня в моках не задан, берём условный */
const XP_STEP = 5000

const extendBoost = (until: number, now: number) => {
  const { hours, maxHours } = mock.receiptBoost
  return Math.min(Math.max(until, now) + hours * HOUR, now + maxHours * HOUR)
}

/** Выигрыш начисляется сразу, анимация только показывает результат */
function addLoot(s: State, loot: Loot, now: number): State {
  const balance = { ...s.balance }
  if (loot.kind === 'soft') balance.soft += loot.amount ?? 0
  if (loot.kind === 'hard') balance.hard += loot.amount ?? 0
  const keep = loot.kind === 'frame' || loot.kind === 'headphones' || loot.kind === 'hoodie'
  return {
    ...s,
    balance,
    boostUntil: loot.kind === 'boost' ? extendBoost(s.boostUntil, now) : s.boostUntil,
    inventory: keep ? [...s.inventory, loot.id] : s.inventory,
  }
}

/** Случайный выигрыш по весам */
export const rollLoot = () => byWeight(LOOT)

const countDay = (streak: State['streak']) =>
  streak.todayDone ? streak : { ...streak, days: streak.days + 1, todayDone: true }

function addXp(p: State['progress'], xp: number) {
  const next = { ...p, xp: p.xp + xp }
  while (next.xp >= next.xpNext) {
    next.level += 1
    next.xpNext += XP_STEP
  }
  return next
}

/** Сколько товаров из чека засчитывается заданию */
function countItems(match: Match | undefined) {
  const { shop, items } = mock.receipt
  if (!match || (match.shop && match.shop !== shop)) return 0
  return items.reduce((sum, i) => sum + (match.any || match.tag === i.tag ? i.qty : 0), 0)
}

/** Собрать награду задания или сундука дня. XP удваивает действующий буст */
function claim(s: State, id: string, now: number): State {
  if (s.claimed.includes(id)) return s
  const quest = id === 'chest' ? null : findQuest(s, id)
  const open = quest ? quest.progress >= quest.goal : id === 'chest' && s.tasks.every(isDone)
  if (!open) return s
  const { soft = 0, hard = 0, xp = 0 } = quest?.reward ?? DAILY_CHEST
  return {
    ...s,
    claimed: [...s.claimed, id],
    balance: { soft: s.balance.soft + soft, hard: s.balance.hard + hard },
    progress: addXp(s.progress, xp * (s.boostUntil > now ? mock.receiptBoost.multiplier : 1)),
  }
}

const findQuest = (s: State, id: string) => {
  const task = s.tasks.find((t) => t.id === id)
  return task ? dailyQuest(task) : s.quests.find((x) => x.id === id)
}

/** Чек: хард за товары, XP, билет, буст. Задания только двигаются, их награды собирает игрок.
    Повторный чек продлевает буст, но не дольше потолка */
function addReceipt(s: State, now: number): State {
  const { items, shop, xp: baseXp, tickets } = mock.receipt
  const doubled = s.boostUntil > now
  const xp = baseXp * (doubled ? mock.receiptBoost.multiplier : 1)
  const hard = items.reduce((sum, i) => sum + i.hard * i.qty, 0)
  const boostUntil = extendBoost(s.boostUntil, now)
  const tasks = s.tasks.map((t) => (t.type === 'receipt' && !isDone(t) ? { ...t, progress: t.goal } : t))
  const quests = s.quests.map((x) => {
    const n = x.how === 'receipt' ? countItems(x.match) : 0
    return n > 0 && x.progress < x.goal ? { ...x, progress: Math.min(x.goal, x.progress + n) } : x
  })
  const changed = [...tasks.filter((t, i) => t !== s.tasks[i]), ...quests.filter((x, i) => x !== s.quests[i])]
  const ready = changed.filter((x) => x.progress >= x.goal).length
  return {
    ...s,
    balance: { ...s.balance, hard: s.balance.hard + hard },
    tasks,
    quests,
    streak: tasks.some((t, i) => t !== s.tasks[i]) ? countDay(s.streak) : s.streak,
    progress: addXp(s.progress, xp),
    tickets: s.tickets + tickets,
    boostUntil,
    receipt: { shop, items, moved: changed.length, ready, hard, xp, doubled, tickets, boostUntil },
  }
}

/** Заказ: хард списывается сразу, корзина пустеет. Рубли здесь только показываем */
function placeOrder(s: State, now: number): State {
  const { recipient, delivery, payment } = s.checkout
  const hard = cartSum(s.cart)
  const physical = needsDelivery(s.cart)
  if (s.cart.length === 0 || !recipient || !payment || (physical && !delivery) || hard > s.balance.hard) return s
  const order: Order = {
    number: ORDER.firstNumber + s.orders.length,
    at: now,
    lines: s.cart,
    hard,
    rub: ORDER.fee + (physical ? (delivery?.tariff.price ?? ORDER.deliveryFrom) : 0),
    recipient,
    delivery: physical ? delivery : undefined,
    payment,
  }
  return { ...s, cart: [], orders: [order, ...s.orders], balance: { ...s.balance, hard: s.balance.hard - hard } }
}

/** Конец игры: рекорд, софт и XP по очкам, задания дня, стрик, mystery box раз в день за цель */
function finishGame(s: State, id: string, score: number, now: number): State {
  const game = findGame(id)
  if (!game) return s
  const before = s.best[id] ?? 0
  const best = Math.max(before, score)
  const units = Math.floor(score / RUN.perPoints)
  const soft = units * RUN.soft
  const xp = units * RUN.xp * (s.boostUntil > now ? mock.receiptBoost.multiplier : 1)
  const win = score >= game.goal
  /* «сыграй 1 раз» засчитывается сразу, «набери N» — по лучшему забегу */
  const tasks = s.tasks.map((t) =>
    t.game === id && !isDone(t) ? { ...t, progress: t.goal === 1 ? 1 : Math.min(t.goal, Math.max(t.progress, score)) } : t,
  )
  const ready = tasks.find((t, i) => isDone(t) && !isDone(s.tasks[i]))
  const won = win && !s.boxTaken
  return {
    ...s,
    tasks,
    best: { ...s.best, [id]: best },
    streak: countDay(s.streak),
    balance: { ...s.balance, soft: s.balance.soft + soft },
    progress: addXp(s.progress, xp),
    boxTaken: s.boxTaken || won,
    freeBoxes: s.freeBoxes + (won ? 1 : 0),
    run: {
      game: id,
      score,
      win,
      record: score > before,
      place: placeOf(game, best),
      placeBefore: placeOf(game, before),
      soft,
      xp,
      box: won ? 'won' : s.boxTaken ? 'taken' : 'none',
      taskReady: ready?.id,
    },
  }
}

function reduce(s: State, a: Action): State {
  switch (a.type) {
    case 'collect':
      return {
        ...s,
        balance: { ...s.balance, soft: s.balance.soft + a.amount },
        charge: { value: 0, since: a.at },
      }
    case 'toggleRemind':
      /* напоминание приходит от бота: включаем и его */
      return { ...s, remindDrop: !s.remindDrop, notify: s.remindDrop ? s.notify : { ...s.notify, on: true } }
    case 'profile':
      return { ...s, profile: { ...s.profile, ...a.data } }
    case 'notify':
      return { ...s, notify: { ...s.notify, ...a.data } }
    case 'friend': {
      if (!s.friends.some((f) => f.nick === a.nick && !f.claimed)) return s
      const { soft = 0, hard = 0, xp = 0 } = REFERRAL.inviter
      return {
        ...s,
        friends: s.friends.map((f) => (f.nick === a.nick ? { ...f, claimed: true } : f)),
        balance: { soft: s.balance.soft + soft, hard: s.balance.hard + hard },
        progress: addXp(s.progress, xp * (s.boostUntil > a.at ? mock.receiptBoost.multiplier : 1)),
      }
    }
    case 'invited':
      return s.invitedBy ? s : { ...s, invitedBy: a.code, balance: { ...s.balance, soft: s.balance.soft + (REFERRAL.newcomer.soft ?? 0) } }
    case 'receipt':
      return addReceipt(s, a.at)
    case 'claim':
      return claim(s, a.id, a.at)
    case 'cart': {
      const same = (l: CartLine) => l.id === a.line.id && l.size === a.line.size
      const cart = s.cart.some(same) ? s.cart.map((l) => (same(l) ? a.line : l)) : [...s.cart, a.line]
      return { ...s, cart: cart.filter((l) => l.qty > 0) }
    }
    case 'checkout':
      return { ...s, checkout: { ...s.checkout, ...a.data } }
    case 'order':
      return placeOrder(s, a.at)
    case 'finishGame':
      return finishGame(s, a.game, a.score, a.at)
    case 'submitVideo':
      return { ...s, quests: s.quests.map((q) => (q.id === a.id ? { ...q, link: a.link } : q)) }
    case 'approve':
      return { ...s, quests: s.quests.map((q) => (q.id === a.id && q.link ? { ...q, progress: q.goal } : q)) }
    case 'spinWheel':
      return {
        ...s,
        wheelSpun: true,
        balance: { ...s.balance, [a.prize.kind]: s.balance[a.prize.kind] + a.prize.amount },
      }
    case 'openCase':
      return a.loots.reduce<State>(
        (next, loot) => addLoot(next, loot, a.at),
        { ...s, freeBoxes: s.freeBoxes - (a.free ? 1 : 0), balance: { ...s.balance, soft: s.balance.soft - a.price } },
      )
  }
}

const DAY = 24 * HOUR
const MSK = 3 * HOUR

const isDone = (t: Task) => t.progress >= t.goal

/** Следующее лучшее действие. Порядок — PRODUCT.md, «Главное действие». */
export type MainAction =
  | { kind: 'streak'; game: string }
  | { kind: 'charge' }
  | { kind: 'task'; id: string; game: string }
  | { kind: 'receipt' }

function pickAction(threat: boolean, chargeFull: boolean, tasks: Task[]): MainAction {
  if (threat) return { kind: 'streak', game: shortestGame() }
  if (chargeFull) return { kind: 'charge' }
  const next = tasks.find((t) => t.game && !isDone(t))
  if (next?.game) return { kind: 'task', id: next.id, game: next.game }
  return { kind: 'receipt' }
}

export { gameCover, gameTitle } from './games'

/* для показа: ?drop=live | over */
const demoDrop = new URLSearchParams(location.search).get('drop')
function dropPhase(now: number): DropPhase {
  if (demoDrop === 'live' || demoDrop === 'over') return demoDrop
  return now < Date.parse(mock.drop.startsAt) ? 'wait' : 'live'
}

function useStoreValue(id: ScenarioId) {
  const [state, dispatch] = useReducer(reduce, id, init)
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10_000)
    return () => clearInterval(t)
  }, [])

  const now = state.clock.base + Date.now() - state.clock.startedAt
  const { max, perHour } = mock.charge
  const charge = Math.min(max, Math.floor(state.charge.value + ((now - state.charge.since) / HOUR) * perHour))
  const mskTime = (now + MSK) % DAY
  const threat = mskTime >= 20 * HOUR && !state.streak.todayDone
  const doneCount = state.tasks.filter(isDone).length
  const statusOf = (x: { id: string; progress: number; goal: number; link?: string }): QuestStatus =>
    state.claimed.includes(x.id)
      ? 'claimed'
      : x.progress >= x.goal
        ? 'ready'
        : x.link
          ? 'review'
          : x.progress > 0
            ? 'active'
            : 'todo'
  const quests = [...state.quests, ...state.tasks.map(dailyQuest)].map((x) => ({ ...x, status: statusOf(x) }))
  const chest = state.claimed.includes('chest') ? 'claimed' : doneCount === state.tasks.length ? 'ready' : 'todo'

  return {
    user: { ...mock.user, ...state.progress, nick: state.profile.nick, league: mock.user.league as League },
    balance: state.balance,
    charge: { current: charge, max, full: charge >= max, minutesToFull: Math.ceil(((max - charge) / perHour) * 60) },
    streak: { ...state.streak, threat, minutesLeft: Math.floor((DAY - 60_000 - mskTime) / 60_000) },
    tasks: state.tasks.map((t) => ({ ...t, done: isDone(t), status: statusOf(t) })),
    doneCount,
    quests,
    dailyChest: { status: chest as QuestStatus, reward: DAILY_CHEST },
    /** сколько наград ждёт */
    readyCount: quests.filter((x) => x.status === 'ready').length + (chest === 'ready' ? 1 : 0),
    minutesToMidnight: Math.ceil((DAY - mskTime) / 60_000),
    now,
    weekEndsAt: Date.parse(mock.leagueWeek.endsAt),
    claim: (questId: string) => dispatch({ type: 'claim', id: questId, at: now }),
    profile: state.profile,
    saveProfile: (data: Partial<State['profile']>) => dispatch({ type: 'profile', data }),
    notify: state.notify,
    setNotify: (data: Partial<Notify>) => dispatch({ type: 'notify', data }),
    referral: { code: codeOf(mock.user.id), friends: state.friends, invitedBy: state.invitedBy, ready: state.friends.filter((f) => !f.claimed).length },
    claimFriend: (nick: string) => dispatch({ type: 'friend', nick, at: now }),
    enterCode: (code: string) => dispatch({ type: 'invited', code }),
    cart: state.cart,
    cartCount: cartCount(state.cart),
    setCart: (line: CartLine) => dispatch({ type: 'cart', line }),
    checkout: state.checkout,
    saveCheckout: (data: Checkout) => dispatch({ type: 'checkout', data }),
    orders: state.orders,
    placeOrder: () => dispatch({ type: 'order', at: now }),
    best: state.best,
    run: state.run,
    /** mystery box из игр: получен ли сегодня и сколько можно открыть бесплатно */
    gameBox: { taken: state.boxTaken, free: state.freeBoxes },
    finishGame: (game: string, score: number) => dispatch({ type: 'finishGame', game, score, at: now }),
    /** ссылка на видео уходит на проверку */
    submitVideo: (questId: string, link: string) => dispatch({ type: 'submitVideo', id: questId, link }),
    /** демо: модератор подтвердил видео */
    approve: (questId: string) => dispatch({ type: 'approve', id: questId }),
    cases: mock.cases as CaseItem[],
    drop: {
      title: mock.drop.title,
      image: mock.drop.image,
      quantity: mock.drop.quantity,
      startsAt: Date.parse(mock.drop.startsAt),
      msLeft: Date.parse(mock.drop.startsAt) - now,
      price: DROP.price.hard,
      league: DROP.minLeague,
      open: isOpen(DROP, mock.user.league as League),
      phase: dropPhase(now),
      left: mock.drop.leftLive,
      /** уже в корзине или куплен: в одни руки один */
      inCart: state.cart.some((l) => l.id === DROP.id),
      mine: state.orders.some((o) => o.lines.some((l) => l.id === DROP.id)),
    },
    banners: mock.banners,
    stats: mock.stats,
    menu: mock.menu,
    remindDrop: state.remindDrop,
    receipt: state.receipt,
    tickets: state.tickets,
    boost: { msLeft: Math.max(0, state.boostUntil - now), multiplier: mock.receiptBoost.multiplier },
    /** демо-время: для живых таймеров */
    clock: state.clock,
    action: pickAction(threat, charge >= max, state.tasks),
    collect: () => dispatch({ type: 'collect', amount: charge, at: now }),
    inventory: state.inventory,
    wheel: { spun: state.wheelSpun, minutesToNext: Math.ceil((DAY - mskTime) / 60_000) },
    spinWheel: (prize: WheelPrize) => dispatch({ type: 'spinWheel', prize }),
    /** price — за все сразу */
    openCase: (price: number, loots: Loot[], free = false) => dispatch({ type: 'openCase', price, loots, at: now, free }),
    scanReceipt: () => dispatch({ type: 'receipt', at: now }),
    toggleRemind: () => dispatch({ type: 'toggleRemind' }),
  }
}

export type Store = ReturnType<typeof useStoreValue>

export function StoreProvider({ scenario, children }: { scenario: ScenarioId; children: ReactNode }) {
  const value = useStoreValue(scenario)
  return <Ctx value={value}>{children}</Ctx>
}

export function useStore() {
  const store = useContext(Ctx)
  if (!store) throw new Error('useStore вне StoreProvider')
  return store
}
