import type { LootKind } from './store'

type Scene = { hi: string; bg: string; deep: string; fg: string }

const INK = '#061716'
const TIFFANY: Scene = { hi: '#dcfffd', bg: '#70fff6', deep: '#129f97', fg: INK }
const GOLD: Scene = { hi: '#fff0b0', bg: '#ffc94a', deep: '#dd8418', fg: INK }
const BLUE: Scene = { hi: '#6aa8ff', bg: '#2a5bff', deep: '#2410a8', fg: '#ffffff' }
const VIOLET: Scene = { hi: '#c99fff', bg: '#8b3dff', deep: '#33108f', fg: '#ffffff' }

/** Цвет говорит, что это: софт — тиффани, хард — золото, буст — синий, предметы — фиолетовые.
    hi — свет за призом, fg — текст и кнопка */
export const LOOT_COLOR: Record<LootKind, Scene> = {
  soft: TIFFANY,
  hard: GOLD,
  boost: BLUE,
  frame: VIOLET,
  headphones: VIOLET,
  hoodie: VIOLET,
}

export const lootVars = (kind: LootKind) => {
  const c = LOOT_COLOR[kind]
  return { '--hi': c.hi, '--loot': c.bg, '--deep': c.deep, '--fg': c.fg, '--on': c.fg === INK ? c.bg : c.deep } as React.CSSProperties
}
