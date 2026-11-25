import { useState } from 'react'
import { useStore } from '../data/store'
import type { Reward } from '../data/types'
import { RewardScreen } from './RewardScreen'

type Won = { title: string; reward: Reward; image?: string }

/** Сбор награды на месте: начисляет и показывает отбивку, экран под ней не меняется */
export function useClaim(action: string) {
  const store = useStore()
  const { balance, user, boost } = store
  const snap = () => ({ ...balance, level: user.level, xp: user.xp, xpNext: user.xpNext })
  const [won, setWon] = useState<(Won & { before: ReturnType<typeof snap> }) | null>(null)

  function claim(id: string, title: string, reward: Reward, image?: string) {
    /* буст удваивает XP: показываем то, что начислится */
    const shown = boost.msLeft > 0 && reward.xp ? { ...reward, xp: reward.xp * boost.multiplier } : reward
    setWon({ title, reward: shown, image, before: snap() })
    store.claim(id)
  }

  return { claim, reward: won && <RewardScreen {...won} after={snap()} action={action} onClose={() => setWon(null)} /> }
}
