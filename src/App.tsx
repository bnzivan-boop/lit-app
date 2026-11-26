import { useCallback, useEffect, useState } from 'react'
import { Snowfall } from './components/Snowfall'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router'
import { DeviceFrame } from './components/DeviceFrame'
import { chromeWanted, IosChrome } from './components/IosChrome'
import { Loader } from './components/loader/Loader'
import { TabBar, type TabId } from './components/TabBar'
import { scenarioFrom, StoreProvider, useStore } from './data/store'
import { CaseOpen } from './screens/CaseOpen/CaseOpen'
import { Board } from './screens/Games/Board'
import { GamePage } from './screens/Games/GamePage'
import { Games } from './screens/Games/Games'
import { Play } from './screens/Games/Play'
import { Faq } from './screens/Account/Faq'
import { Friends } from './screens/Account/Friends'
import { Notifications } from './screens/Account/Notifications'
import { Settings } from './screens/Account/Settings'
import { Support } from './screens/Account/Support'
import { appPath } from './lib/base'
import { PromoHub } from './screens/Promo/PromoHub'
import { PromoPage } from './screens/Promo/PromoPage'
import { useScroll } from './lib/useOrigin'
import { Home } from './screens/Home/Home'
import { Kit } from './screens/Kit/Kit'
import { Receipt } from './screens/Receipt/Receipt'
import { Cart } from './screens/Shop/Cart'
import { Checkout } from './screens/Shop/Checkout'
import { Drop } from './screens/Shop/Drop'
import { Done } from './screens/Shop/Done'
import { Orders } from './screens/Shop/Orders'
import { Product } from './screens/Shop/Product'
import { Shop } from './screens/Shop/Shop'
import { Scan } from './screens/Scan/Scan'
import { Wheel } from './screens/Wheel/Wheel'
import { Tasks } from './screens/Tasks/Tasks'
import { Stub } from './screens/Stub/Stub'
import { Season } from './screens/Season/Season'
import { Advent } from './screens/Advent/Advent'
import { About } from './screens/Season/About'
import { Rewards } from './screens/Season/Rewards'
import { Leaders } from './screens/Season/Leaders'
import { Moment } from './screens/Season/Moment'
import s from './App.module.css'

const PATH: Record<TabId, string> = { home: '/', tasks: '/tasks', scan: '/promo', games: '/games', shop: '/shop' }

function Shell() {
  const { pathname } = useLocation()
  const go = useNavigate()
  const { readyCount } = useStore()
  const active = (Object.keys(PATH) as TabId[]).find((id) => PATH[id] === pathname)
  return (
    <div className={s.shell}>
      <Outlet />
      <TabBar badge={{ tasks: readyCount }} active={active} onSelect={(id) => (id === 'scan' && pathname === '/promo' ? go('/scan', { state: { from: pathname } }) : go(PATH[id]))} />
    </div>
  )
}

/** Широкое окно браузера: приложение показываем внутри iPhone */
function useFramed() {
  const [wide, setWide] = useState(() => matchMedia('(min-width: 600px)').matches)
  useEffect(() => {
    const mq = matchMedia('(min-width: 600px)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide && window.top === window.self && !appPath().startsWith('/kit') && chromeWanted()
}

export function App() {
  return useFramed() ? <DeviceFrame /> : <Screens />
}

/** Лоадер на каждое открытие и обновление. ?loader=0 — без него */
const wantLoader = () => !appPath().startsWith('/kit') && new URLSearchParams(location.search).get('loader') !== '0'

function Screens() {
  const [phase, setPhase] = useState<'load' | 'reveal' | 'ready'>(() => (wantLoader() ? 'load' : 'ready'))
  const reveal = useCallback(() => setPhase('reveal'), [])
  const done = useCallback(() => setPhase('ready'), [])
  useEffect(() => {
    if (phase !== 'load') document.documentElement.removeAttribute('data-boot')
  }, [phase])
  return (
    <>
      {!appPath().startsWith('/kit') && <IosChrome />}
      {phase !== 'load' && <Pages />}
      {phase !== 'ready' && <Loader onReveal={reveal} onDone={done} />}
      <Snowfall fixed />
    </>
  )
}

/** Колесо предлагаем сразу после лоадера на главной. ?wheel=0 — без него */
const wantWheel = () =>
  wantLoader() && appPath() === '/' && new URLSearchParams(location.search).get('wheel') !== '0'

function Pages() {
  useScroll()
  const [offer, setOffer] = useState(wantWheel)
  /* состояние демо: /?state=morning | day | evening | eveningFreeze | done */
  const [scenario] = useState(() => scenarioFrom(new URLSearchParams(location.search).get('state')))
  return (
    <StoreProvider scenario={scenario}>
      <Routes>
        <Route path="/kit" element={<Kit />} />
        <Route path="/case/:id" element={<CaseOpen />} />
        <Route path="/wheel" element={<Wheel onLeave={() => setOffer(false)} />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/drop" element={<Drop />} />
        <Route path="/promo/:id" element={<PromoPage />} />
        <Route path="/shop/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/done" element={<Done />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/support" element={<Support />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/advent" element={<Advent />} />
        <Route path="/season" element={<Season />} />
        <Route path="/season/about" element={<About />} />
        <Route path="/season/rewards" element={<Rewards />} />
        <Route path="/season/board" element={<Leaders />} />
        <Route path="/season/passed/:id" element={<Moment kind="passed" />} />
        <Route path="/season/up" element={<Moment kind="up" />} />
        <Route path="/season/end" element={<Moment kind="end" />} />
        <Route path="/games/:id" element={<GamePage />} />
        <Route path="/games/:id/top" element={<Board />} />
        <Route path="/games/:id/play" element={<Play />} />
        <Route element={<Shell />}>
          <Route path="/" element={offer ? <Navigate to="/wheel" replace /> : <Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/promo" element={<PromoHub />} />
          <Route path="/games" element={<Games />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Stub title="Профиль" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  )
}
