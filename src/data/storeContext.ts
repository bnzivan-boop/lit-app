import { createContext } from 'react'
import type { Store } from './store'

/* Отдельный файл: при горячей перезагрузке контекст не пересоздаётся */
export const StoreContext = createContext<Store | null>(null)
