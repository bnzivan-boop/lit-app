import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import mock from '../../../data/mock.json'
import { Amount } from '../../components/Amount'
import { Button, IconButton } from '../../components/Button'
import { Card } from '../../components/Card'
import { CaseCard, CaseCardSkeleton, CaseCarousel } from '../../components/CaseCard'
import { DropBar } from '../../components/DropBar'
import type { FireState } from '../../components/Fire'
import { Header, HeaderSkeleton } from '../../components/Header'
import { Hero, HeroSkeleton } from '../../components/Hero'
import { Loader } from '../../components/loader/Loader'
import { LeagueLine, LeagueRow, LeagueRowSkeleton } from '../../components/LeagueRow'
import { MenuSheet } from '../../components/MenuSheet'
import { ProgressBar, SegmentBar } from '../../components/ProgressBar'
import { PromoBanner } from '../../components/PromoBanner'
import { Skeleton } from '../../components/Skeleton'
import { Stats, StatsSkeleton } from '../../components/Stats'
import { TabBar, type TabId } from '../../components/TabBar'
import { TaskTile, TaskTileSkeleton, TaskTrio } from '../../components/TaskTile'
import { LootCard } from '../../components/LootCard'
import { gameCover, LOOT, type Task } from '../../data/store'
import { ChargeTile, StreakTile, TileSkeleton } from '../../components/Tiles'
import { Icon, type IconName } from '../../components/Icon'
import type { League, Rarity } from '../../data/types'
import { Link } from 'react-router'
import { ReceiptTicket } from '../../components/ReceiptTicket'
import { BoostTile, TicketTile } from '../../components/RewardTiles'
import { LiquidBar } from '../../components/LiquidBar'
import { RewardScreen } from '../../components/RewardScreen'
import { Rewards } from '../../components/Rewards'
import { useStore, type QuestStatus } from '../../data/store'
import { PartnerCard, QuestRow, SuperQuest, type QuestView } from '../Tasks/parts'
import { board, GAMES } from '../../data/games'
import { BoxBar } from '../Games/BoxBar'
import { Feature, Panel } from '../Games/Panel'
import { Podium } from '../Games/Podium'
import { PRODUCTS } from '../../data/shop'
import { CdekBadge } from '../Shop/CdekBadge'
import { PointMap } from '../Shop/PointMap'
import { CartButton } from '../Shop/CartButton'
import { LeagueMark } from '../Shop/LeagueMark'
import { ProductCard } from '../Shop/ProductCard'
import { Stepper } from '../Shop/Stepper'
import { Row, Rows, SwitchRow } from '../Account/Rows'
import { PROMOS } from '../../data/promos'
import { PromoCard } from '../Promo/PromoCard'
import { PromoTimer } from '../Promo/PromoTimer'
import { ScanDock } from '../Promo/ScanDock'
import { DailyChest } from '../Tasks/DailyChest'
import { QuestSheet } from '../Tasks/QuestSheet'
import { Section } from './Section'
import s from './Components.module.css'

const user = { ...mock.user, league: mock.user.league as League }
const milestones = mock.streak.milestones
const tasks = mock.dailyTasks as Task[]
const group = mock.leagueWeek.group

function State({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className={s.state}>
      <span className={s.name}>{name}</span>
      {children}
    </div>
  )
}

/** Фон карточки под компонентами, которые живут внутри неё */
const OnCard = ({ children }: { children: ReactNode }) => <div className={s.onCard}>{children}</div>

function Buttons() {
  return (
    <Section title="Кнопки">
      {(['primary', 'secondary'] as const).map((v) => (
        <div key={v} className={s.group}>
          <State name={v === 'primary' ? 'Главная' : 'Второстепенная'}>
            <Button variant={v}>Играть в «Энерджи Джамп»</Button>
          </State>
          <State name="Нажатие">
            <Button variant={v} data-pressed>
              Играть в «Энерджи Джамп»
            </Button>
          </State>
          <State name="Неактивная">
            <Button variant={v} disabled>
              Играть в «Энерджи Джамп»
            </Button>
          </State>
          <State name="Загрузка">
            <Button variant={v} loading>
              Играть в «Энерджи Джамп»
            </Button>
          </State>
        </div>
      ))}
      <div className={s.group}>
        <State name="Маленькая: обычная, нажатие, неактивная, загрузка">
          <div className={s.wrap}>
            <Button variant="secondary" size="sm">
              Открыть за <Amount value={40} kind="soft" />
            </Button>
            <Button variant="secondary" size="sm" data-pressed>
              Открыть за <Amount value={40} kind="soft" />
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Открыть за <Amount value={40} kind="soft" />
            </Button>
            <Button variant="secondary" size="sm" loading>
              Открыть за <Amount value={40} kind="soft" />
            </Button>
          </div>
        </State>
        <BellState />
      </div>
    </Section>
  )
}

function BellState() {
  const [on, setOn] = useState(false)
  return (
    <State name="Иконка: нажми, нажатие, включена, неактивная">
      <div className={s.wrap}>
        <IconButton icon="bell" label="Напомнить о дропе" aria-pressed={on} onClick={() => setOn(!on)} />
        <IconButton icon="bell" label="Напомнить о дропе" data-pressed />
        <IconButton icon="bell" label="Напомнить о дропе" aria-pressed />
        <IconButton icon="bell" label="Напомнить о дропе" disabled />
      </div>
    </State>
  )
}

function Headers() {
  return (
    <Section title="Шапка">
      <State name="Обычная">
        <div className={s.bleed}>
          <Header {...user} />
        </div>
      </State>
      <State name="Нажат профиль">
        <div className={s.bleed}>
          <Header {...user} pressed />
        </div>
      </State>
      <State name="Длинный ник и большой баланс">
        <div className={s.bleed}>
          <Header {...user} nick="korostkina.energy.2026" league="platinum" balance={{ soft: 128450, hard: 12480 }} />
        </div>
      </State>
      <State name="Загрузка">
        <div className={s.bleed}>
          <HeaderSkeleton />
        </div>
      </State>
    </Section>
  )
}

function TabBars() {
  const [active, setActive] = useState<TabId>('home')
  const phone = { '--safe-bottom': '34px' } as CSSProperties
  return (
    <Section title="Нижняя панель">
      <State name="С системной полосой, 84 px. Вкладки переключаются">
        <div className={`${s.bleed} ${s.phone}`} style={phone}>
          <TabBar fixed={false} active={active} onSelect={setActive} />
        </div>
      </State>
      <State name="Без системной полосы, 68 px">
        <div className={s.bleed}>
          <TabBar fixed={false} active="tasks" />
        </div>
      </State>
      <State name="Есть что собрать: счётчик на «Заданиях»">
        <div className={s.bleed}>
          <TabBar fixed={false} active="home" badge={{ tasks: 2 }} />
        </div>
      </State>
      <State name="Нажатие: «Игры»">
        <div className={s.bleed}>
          <TabBar fixed={false} active="home" pressed="games" />
        </div>
      </State>
      <State name="Нажатие: «Скан чека»">
        <div className={s.bleed}>
          <TabBar fixed={false} active="home" pressed="scan" />
        </div>
      </State>
      <State name="Неактивные: «Игры» и «Скан чека»">
        <div className={s.bleed}>
          <TabBar fixed={false} active="home" disabled={['scan', 'games']} />
        </div>
      </State>
    </Section>
  )
}

function Cards() {
  return (
    <Section title="Карточка">
      <State name="Обычная">
        <Card title="Сегодня" count="1 из 3">
          <p className={s.filler}>Отступ 16, скругление 24, заголовок 26</p>
        </Card>
      </State>
      <State name="С подписью">
        <Card title="Неделя в лиге" aside="итоги через 4 д">
          <p className={s.filler}>Подпись справа вместо счётчика</p>
        </Card>
      </State>
      <State name="Загрузка">
        <Card title="Сегодня" loading>
          <div className={s.lines}>
            <Skeleton w="85%" />
            <Skeleton w="60%" />
          </div>
        </Card>
      </State>
    </Section>
  )
}

function Heroes() {
  const fire = useRef<FireState>({ power: 0.7, burst: 0 })
  const low = useRef<FireState>({ power: 0.45, burst: 0 })
  return (
    <Section title="Герой">
      <State name="Опыт почти полный, заряд есть">
        <div className={s.hero}>
          <Hero {...user} fire={fire} />
        </div>
      </State>
      <State name="Начало уровня, длинный ник, заряд пустой">
        <div className={s.hero}>
          <Hero
            {...user}
            nick="korostkina.energy.2026"
            level={108}
            xp={14200}
            xpNext={66000}
            balance={{ soft: 128450, hard: 12480 }}
            fire={low}
          />
        </div>
      </State>
      <State name="Загрузка">
        <div className={s.hero}>
          <HeroSkeleton />
        </div>
      </State>
    </Section>
  )
}

function Tiles() {
  const max = mock.charge.max
  const streak = { milestones, todayDone: false, freezes: 0, days: 40, minutesLeft: 134 }
  return (
    <Section title="Заряд и стрик">
      <State name="Заряд: копится, нажатие">
        <div className={s.tiles}>
          <ChargeTile current={90} max={max} minutesToFull={150} />
          <ChargeTile current={90} max={max} minutesToFull={150} pressed />
        </div>
      </State>
      <State name="Полный и главное действие, полный без акцента">
        <div className={s.tiles}>
          <ChargeTile current={max} max={max} minutesToFull={0} main />
          <ChargeTile current={max} max={max} minutesToFull={0} />
        </div>
      </State>
      <State name="Пустой, неактивный">
        <div className={s.tiles}>
          <ChargeTile current={0} max={max} minutesToFull={240} />
          <ChargeTile current={90} max={max} minutesToFull={150} disabled />
        </div>
      </State>
      <State name="Стрик: до действия, после действия">
        <div className={s.tiles}>
          <StreakTile {...streak} freezes={1} />
          <StreakTile {...streak} days={41} todayDone freezes={1} />
        </div>
      </State>
      <State name="Угроза: без заморозки, с заморозкой">
        <div className={s.tiles}>
          <StreakTile {...streak} threat />
          <StreakTile {...streak} threat freezes={1} />
        </div>
      </State>
      <State name="Угроза: нажатие. Загрузка">
        <div className={s.tiles}>
          <StreakTile {...streak} threat pressed />
          <TileSkeleton />
        </div>
      </State>
    </Section>
  )
}

function Progress() {
  return (
    <Section title="Прогресс">
      <OnCard>
        <State name="Тонкий 4 px">
          <ProgressBar value={90} max={240} label="Пример" />
        </State>
        <State name="Толстый 8 px">
          <ProgressBar value={1800} max={3000} label="Пример" size="lg" />
        </State>
        <State name="Угроза">
          <ProgressBar value={40} max={45} label="Пример" size="lg" tone="warn" />
        </State>
        <State name="Пустой и полный">
          <div className={s.lines}>
            <ProgressBar value={0} max={1} label="Пример" size="lg" />
            <ProgressBar value={1} max={1} label="Пример" size="lg" />
          </div>
        </State>
        <State name="На surface-2: сегменты, угроза, сплошной">
          <div className={s.onSurface2}>
            <SegmentBar segments={['done', 'done', 'done', 'done', 'next', 'idle', 'idle']} label="Пример" />
            <SegmentBar segments={['done', 'done', 'done', 'done', 'warn', 'idle', 'idle']} label="Пример" />
            <ProgressBar value={90} max={240} label="Пример" onSurface2 />
          </div>
        </State>
        <State name="Загрузка">
          <Skeleton h={8} r={4} />
        </State>
      </OnCard>
    </Section>
  )
}

function Tasks() {
  const tile = (t: (typeof tasks)[number]) => ({
    title: t.short,
    hint: t.hint,
    label: t.title,
    reward: t.reward,
    game: t.game,
    cover: gameCover(t.game),
    receipt: t.type === 'receipt',
    boost: Boolean(t.bonus),
  })
  const [a, b, c] = tasks
  return (
    <Section title="Задание дня">
      <State name="Обычные">
        <TaskTrio>
          <TaskTile {...tile(a)} />
          <TaskTile {...tile(b)} />
          <TaskTile {...tile(c)} />
        </TaskTrio>
      </State>
      <State name="Готово, главное с прогрессом, чек — главное">
        <TaskTrio>
          <TaskTile {...tile(a)} done />
          <TaskTile {...tile(b)} progress={{ value: 1800, goal: 3000 }} main />
          <TaskTile {...tile(c)} main />
        </TaskTrio>
      </State>
      <State name="Нажатие, неактивное, загрузка">
        <TaskTrio>
          <TaskTile {...tile(a)} pressed />
          <TaskTile {...tile(b)} disabled />
          <TaskTileSkeleton />
        </TaskTrio>
      </State>
      <State name="Можно собрать">
        <TaskTrio>
          <TaskTile {...tile(a)} ready />
          <TaskTile {...tile(b)} ready />
          <TaskTile {...tile(c)} ready />
        </TaskTrio>
      </State>
    </Section>
  )
}

const NONE = () => {}
const STATUSES: [QuestStatus, string][] = [
  ['todo', 'Не начато'],
  ['active', 'В процессе'],
  ['ready', 'Можно собрать'],
  ['claimed', 'Собрано'],
]

function Quests() {
  const { quests, now } = useStore()
  const [open, setOpen] = useState<QuestView | null>(null)
  const [won, setWon] = useState(false)
  const pick = (kind: QuestView['kind']) => quests.find((q) => q.kind === kind)!
  const as = (q: QuestView, status: QuestStatus): QuestView => ({
    ...q,
    status,
    progress: status === 'todo' ? 0 : status === 'active' ? Math.ceil(q.goal / 2.5) : q.goal,
  })
  const sup = pick('super')
  const partner = quests.filter((q) => q.kind === 'partner').find((q) => q.goal > 1) ?? pick('partner')
  const week = pick('weekly')
  const video = quests.find((q) => q.how === 'upload')!
  const checking: QuestView = { ...video, status: 'review', link: 'https://vk.com/clip-12345_67890' }
  const chest = { reward: { soft: 150, hard: 5, xp: 300 }, next: 'ещё 9 ч', onOpen: () => setWon(true) }
  const side = { soft: 270, hard: 572, level: 14, xp: 65350, xpNext: 66000 }
  return (
    <Section title="Задания">
      <State name="Супер-задание">
        <SuperQuest q={as(sup, 'active')} now={now} onOpen={() => setOpen(as(sup, 'active'))} onClaim={NONE} />
      </State>
      <State name="Супер-задание, можно собрать">
        <SuperQuest q={as(sup, 'ready')} now={now} onOpen={NONE} onClaim={() => setWon(true)} />
      </State>
      {STATUSES.map(([status, name]) => (
        <State key={status} name={`Партнёр и неделя: ${name.toLowerCase()}`}>
          <PartnerCard q={as(partner, status)} onOpen={() => setOpen(as(partner, status))} onClaim={() => setWon(true)} />
          <QuestRow q={as(week, status)} onOpen={() => setOpen(as(week, status))} onClaim={() => setWon(true)} />
        </State>
      ))}
      <State name="Видео: на проверке">
        <QuestRow q={checking} onOpen={() => setOpen(checking)} onClaim={NONE} />
        <Button variant="secondary" onClick={() => setOpen(as(video, 'todo'))}>
          Открыть поле для ссылки
        </Button>
      </State>
      {[0, 1, 2].map((n) => (
        <State key={n} name={`Сундук дня: ${n} из 3`}>
          <DailyChest {...chest} status="todo" lit={[n > 0, n > 1, false]} />
        </State>
      ))}
      <State name="Сундук дня: можно открыть">
        <DailyChest {...chest} status="ready" lit={[true, true, true]} />
      </State>
      <State name="Сундук дня: открыт">
        <DailyChest {...chest} status="claimed" lit={[true, true, true]} />
      </State>
      <State name="Нажатие">
        <PartnerCard q={as(partner, 'active')} onOpen={NONE} onClaim={NONE} pressed />
        <QuestRow q={as(week, 'active')} onOpen={NONE} onClaim={NONE} pressed />
      </State>
      <State name="Жидкая шкала и награда">
        <LiquidBar value={6} max={10} label="Пример" left="6 штук" right="из 10" />
        <Rewards reward={sup.reward} size="lg" />
      </State>
      <State name="Раскрытое задание и награда">
        <Button variant="secondary" onClick={() => setOpen(as(partner, 'ready'))}>
          Открыть задание
        </Button>
        <Button variant="secondary" onClick={() => setWon(true)}>
          Показать награду
        </Button>
      </State>
      {open && <QuestSheet q={open} endsAt={now + 4 * 864e5} now={now} onClose={() => setOpen(null)} onClaim={() => (setOpen(null), setWon(true))} onGo={() => setOpen(null)} />}
      {won && (
        <RewardScreen
          title={partner.title}
          reward={{ hard: 25, soft: 50, xp: 1000 }}
          before={side}
          after={{ soft: 320, hard: 597, level: 15, xp: 66350, xpNext: 71000 }}
          onClose={() => setWon(false)}
        />
      )}
    </Section>
  )
}

function Leagues() {
  const row = (place: number) => group.find((g) => g.place === place)!
  return (
    <Section title="Строка лиги">
      <OnCard>
        <State name="Соседи, своя строка, линия повышения">
          <div>
            {[5, 6, 7].map((p) => (
              <LeagueRow key={p} {...row(p)} />
            ))}
            <LeagueLine kind="promote" />
          </div>
        </State>
        <State name="Своя строка в зоне вылета">
          <div>
            <LeagueLine kind="demote" />
            <LeagueRow place={29} nick="Korostkina" power={410} me threat />
            <LeagueRow {...row(30)} />
          </div>
        </State>
        <State name="Загрузка">
          <div>
            <LeagueRowSkeleton />
            <LeagueRowSkeleton />
          </div>
        </State>
      </OnCard>
    </Section>
  )
}

function Cases() {
  const soft = user.balance.soft
  const [remind, setRemind] = useState(false)
  return (
    <Section title="Кейсы и дроп">
      <State name="Карусель: доступны, не хватает софта">
        <CaseCarousel>
          {mock.cases.map((c) => (
            <CaseCard key={c.id} title={c.title} rarity={c.rarity as Rarity} image={c.image} price={c.price.soft} balance={soft} />
          ))}
        </CaseCarousel>
      </State>
      <State name="Нажатие">
        <CaseCard title="Старт" rarity="common" image={mock.cases[0].image} price={40} balance={soft} pressed />
      </State>
      <State name="Открывается">
        <CaseCard title="Старт" rarity="common" image={mock.cases[0].image} price={40} balance={soft} loading />
      </State>
      <State name="Загрузка">
        <CaseCardSkeleton />
      </State>
      <State name="Дроп идёт и разобрали">
        {(['live', 'over'] as const).map((phase) => (
          <DropBar key={phase} title={mock.drop.title} image={mock.drop.image} quantity={50} price={mock.drop.price.hard} startsAt={Date.parse(mock.drop.startsAt)} msLeft={0} phase={phase} left={37} remind={false} />
        ))}
      </State>
      <State name="Дроп. Колокольчик включает напоминание">
        <DropBar
          title={mock.drop.title}
          image={mock.drop.image}
          quantity={mock.drop.quantity}
          price={mock.drop.price.hard}
          startsAt={Date.parse(mock.drop.startsAt)}
          msLeft={187_200_000}
          remind={remind}
          onRemind={() => setRemind(!remind)}
        />
      </State>
    </Section>
  )
}

function Rest() {
  return (
    <>
      <Section title="Реклама">
        <State name="Обычная, нажатие">
          <PromoBanner {...mock.banners[0]} />
          <PromoBanner {...mock.banners[0]} pressed />
        </State>
      </Section>
      <Section title="Статистика">
        <State name="Обычная">
          <Stats items={mock.stats} />
        </State>
        <State name="Загрузка">
          <StatsSkeleton />
        </State>
      </Section>
      <ReceiptDemo />
      <LootDemo />
      <WheelDemo />
      <MenuDemo />
      <LoaderDemo />
    </>
  )
}

function LoaderDemo() {
  const [on, setOn] = useState(false)
  return (
    <Section title="Лоадер">
      <State name="Полный показ">
        <Button variant="secondary" onClick={() => setOn(true)}>
          Показать лоадер
        </Button>
      </State>
      {on && <Loader onReveal={() => {}} onDone={() => setOn(false)} />}
    </Section>
  )
}

function ReceiptDemo() {
  const receipt = {
    ...mock.receipt,
    moved: 3,
    ready: 2,
    hard: 80,
    doubled: true,
    xp: 300,
    boostUntil: 0,
  }
  return (
    <Section title="Скан чека">
      <State name="Напечатанный чек">
        <ReceiptTicket receipt={receipt} still />
      </State>
      <State name="Буст и билет">
        <div className={s.tiles}>
          <BoostTile msLeft={86_399_000} extended />
          <TicketTile count={1} total={3} />
        </div>
      </State>
      <State name="Экраны">
        <div className={s.wrap}>
          {[
            ['/scan', 'Скан'],
            ['/scan?error=empty', 'Нет LIT'],
            ['/scan?error=used', 'Уже добавлен'],
            ['/scan?error=unread', 'Не читается'],
          ].map(([to, name]) => (
            <Link key={to} to={to} className={`press ${s.link}`}>
              {name}
            </Link>
          ))}
        </div>
      </State>
    </Section>
  )
}

function LootDemo() {
  return (
    <Section title="Открытие кейса">
      <State name="Призы внутри">
        <CaseCarousel>
          {LOOT.map((l) => (
            <div key={l.id} style={{ width: 'auto' }}>
              <LootCard loot={l} />
            </div>
          ))}
        </CaseCarousel>
      </State>
      <State name="Экраны: выигрыш нужной редкости и нехватка софта">
        <div className={s.wrap}>
          {[
            ['/case/start?win=common', 'Обычный'],
            ['/case/start?win=rare', 'Редкий'],
            ['/case/impulse?win=epic', 'Эпический'],
            ['/case/start?win=legend', 'Легендарный'],
            ['/case/start?soft=2000', 'Много софта, ×10'],
            ['/case/ultimate', 'Не хватает'],
          ].map(([to, name]) => (
            <Link key={to} to={to} className={`press ${s.link}`}>
              {name}
            </Link>
          ))}
        </div>
      </State>
    </Section>
  )
}

function WheelDemo() {
  return (
    <Section title="Колесо фортуны">
      <State name="Экран и заданный выигрыш">
        <div className={s.wrap}>
          {[
            ['/wheel', 'Колесо'],
            ['/wheel?win=h1000', 'Сундук харда'],
            ['/wheel?win=s1500', 'Сундук софта'],
            ['/wheel?win=s500', 'Гора софта'],
            ['/wheel?win=h1', 'Одна монета'],
          ].map(([to, name]) => (
            <Link key={to} to={to} className={`press ${s.link}`}>
              {name}
            </Link>
          ))}
        </div>
      </State>
    </Section>
  )
}

function MenuDemo() {
  const [open, setOpen] = useState(false)
  return (
    <Section title="Меню">
      <State name="Шторка: потяни вниз, тапни по фону или нажми Esc">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Открыть меню
        </Button>
      </State>
      {open && (
        <MenuSheet user={user} items={mock.menu} onCopyId={() => {}} onClose={() => setOpen(false)} onSelect={() => setOpen(false)} />
      )}
    </Section>
  )
}

const ICONS: IconName[] = [
  'home', 'tasks', 'scan', 'games', 'shop', 'bolt', 'flame', 'freeze', 'clock', 'bell', 'check', 'chevron',
  'pin', 'question', 'chat', 'gear', 'info', 'friend', 'play', 'menu', 'close', 'copy', 'ticket',
]

function Icons() {
  return (
    <Section title="Иконки">
      <div className={s.icons}>
        {ICONS.map((n) => (
          <span key={n}>
            <Icon name={n} size={24} />
          </span>
        ))}
      </div>
    </Section>
  )
}

function GamesKit() {
  const game = (id: string) => GAMES.find((g) => g.id === id)!
  const pad = { paddingTop: 34 }
  return (
    <Section title="Игры">
      <State name="Новинка">
        <Feature game={game('energy-jump')} note="рекорд 1 800" task="Набери 3 000" onOpen={NONE} onPlay={NONE} />
      </State>
      <State name="Кадр: обычный, с заданием дня">
        <div style={pad}>
          <Panel game={game('energy-jet')} note="рекорд 950" task shape={{ bottom: [0, 18] }} onClick={NONE} />
        </div>
      </State>
      <State name="Кадр: нажатие">
        <Panel game={game('energy-rush')} note="ещё не играл" pressed onClick={NONE} />
      </State>
      <State name="Mystery box дня: ждёт, можно открыть, получен">
        <BoxBar taken={false} free={0} next="9 ч" onOpen={NONE} />
        <BoxBar taken free={1} next="9 ч" onOpen={NONE} />
        <BoxBar taken free={0} next="9 ч" onOpen={NONE} />
      </State>
      <State name="Тройка лучших">
        <div style={{ paddingTop: 48 }}>
          <Podium rows={board(game('energy-jump'), 1800, 'Korostkina').rows} />
        </div>
      </State>
    </Section>
  )
}

const SPOTS = [
  { code: 'a', type: 'PVZ' as const, address: 'ул. Садовая, 8', work: '', fitting: true, lat: 0.8, lng: 0.2 },
  { code: 'b', type: 'POSTAMAT' as const, address: 'пр. Ленина, 25', work: '', fitting: false, lat: 0.5, lng: 0.6 },
  { code: 'c', type: 'PVZ' as const, address: 'ул. Победы, 46', work: '', fitting: false, lat: 0.1, lng: 0.9 },
]

function ShopKit() {
  const [spot, setSpot] = useState('b')
  const [qty, setQty] = useState(2)
  const item = (id: string) => PRODUCTS.find((p) => p.id === id)!
  return (
    <Section title="Магазин">
      <State name="Товар: хватает, не хватает, закрыт лигой, нажатие">
        <div className={s.tiles}>
          <ProductCard product={item('wink')} hard={572} onClick={NONE} />
          <ProductCard product={item('shorts')} hard={572} onClick={NONE} />
          <ProductCard product={item('xbox')} hard={572} closed onClick={NONE} />
          <ProductCard product={item('station')} hard={572} pressed onClick={NONE} />
        </div>
      </State>
      <State name="Медали лиг: открыта и закрыта">
        <div className={s.wrap} style={{ gap: 18, padding: 6 }}>
          {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const).map((l, i) => (
            <LeagueMark key={l} league={l} locked={i > 1} />
          ))}
        </div>
      </State>
      <State name="СДЭК: знак и карта пунктов">
        <CdekBadge />
        <PointMap seed={428} picked={spot} onPick={setSpot} points={SPOTS} />
      </State>
      <State name="Корзина и количество">
        <div className={s.wrap} style={{ gap: 18 }}>
          <CartButton count={0} onClick={NONE} />
          <CartButton count={3} onClick={NONE} />
          <Stepper value={qty} max={5} onChange={(n) => setQty(Math.max(1, n))} />
        </div>
      </State>
    </Section>
  )
}

function AccountKit() {
  const [on, setOn] = useState(true)
  return (
    <Section title="Настройки">
      <State name="Строки: с переходом, без, переключатель, неактивный">
        <Rows note="Пояснение под группой.">
          <Row icon="phone" title="Телефон" value="не указан" onClick={NONE} />
          <Row icon="chat" title="Telegram" value="@korostkina" />
          <SwitchRow icon="bell" title="Старт дропа" value="перед началом" on={on} onChange={setOn} />
          <SwitchRow icon="box" title="Заказы" on={false} disabled onChange={NONE} />
        </Rows>
      </State>
    </Section>
  )
}

function PromoKit() {
  return (
    <Section title="Чеки и акции">
      <State name="Баннеры акций, нажатие">
        {PROMOS.map((p, i) => (
          <div key={p.id} style={{ paddingTop: 30 }}>
            <PromoCard promo={p} ends="11 дней" pressed={i === 1} onClick={NONE} />
          </div>
        ))}
      </State>
      <State name="Сканировать чек: без билетов, с билетами, нажатие">
        <ScanDock inline tickets={0} onClick={NONE} />
        <ScanDock inline tickets={3} boosted onClick={NONE} />
        <ScanDock inline tickets={3} pressed onClick={NONE} />
      </State>
      <State name="До конца акции">
        <PromoTimer msLeft={21 * 864e5 + 3_600_000} />
      </State>
    </Section>
  )
}

export function Components() {
  return (
    <>
      <Heroes />
      <Buttons />
      <Headers />
      <TabBars />
      <Cards />
      <Tiles />
      <Progress />
      <Tasks />
      <Quests />
      <GamesKit />
      <ShopKit />
      <AccountKit />
      <PromoKit />
      <Leagues />
      <Cases />
      <Rest />
      <Icons />
    </>
  )
}
