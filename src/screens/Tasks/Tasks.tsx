import { useSearchParams } from 'react-router'
import { Amount } from '../../components/Amount'
import { useClaim } from '../../components/useClaim'
import { TaskTile, TaskTrio } from '../../components/TaskTile'
import { TopBar } from '../../components/TopBar'
import { left } from '../../data/format'
import { gameCover, useStore, type QuestStatus } from '../../data/store'
import type { Reward } from '../../data/types'
import { DailyChest } from './DailyChest'
import { useOpen } from '../../lib/useOrigin'
import { PartnerCard, QuestRow, SuperQuest, type QuestView } from './parts'
import { QuestSheet } from './QuestSheet'
import s from './Tasks.module.css'

/* сначала то, что можно собрать, собранное — в конец */
const ORDER: Record<QuestStatus, number> = { ready: 0, active: 1, review: 2, todo: 3, claimed: 4 }
const byStatus = (a: QuestView, b: QuestView) => ORDER[a.status] - ORDER[b.status]

/** Задания: супер, партнёры, неделя, день. ?open=p1 раскрывает задание */
export function Tasks() {
  const open = useOpen()
  const store = useStore()
  const { quests, balance, now, dailyChest, tasks, minutesToMidnight, weekEndsAt } = store
  const [params, setParams] = useSearchParams()
  const { claim: collect, reward } = useClaim('К заданиям')

  const of = (kind: QuestView['kind']) => quests.filter((q) => q.kind === kind)
  const opened = quests.find((q) => q.id === params.get('open'))
  const show = (id: string) => setParams({ open: id }, { replace: true })
  const hide = () => setParams({}, { replace: true })
  const midnight = now + minutesToMidnight * 60_000
  const endsAt = (q: QuestView) => (q.endsAt ? Date.parse(q.endsAt) : q.kind === 'weekly' ? weekEndsAt : midnight)

  function claim(id: string, title: string, reward: Reward, image?: string) {
    hide()
    collect(id, title, reward, image)
  }

  function run(q: QuestView) {
    if (q.how === 'receipt') open('/scan')
    else if (q.game) open(`/games/${q.game}/play`)
  }

  const [superQuest] = of('super')
  return (
    <main className={s.main}>
      <TopBar nick="Задания" balance={balance} after={190} />
      <span className={s.balance}>
        <Amount value={balance.soft} kind="soft" coin={18} />
        <Amount value={balance.hard} kind="hard" coin={18} />
      </span>

      {superQuest && (
        <SuperQuest
          q={superQuest}
          now={now}
          onOpen={() => show(superQuest.id)}
          onClaim={() => claim(superQuest.id, superQuest.title, superQuest.reward)}
        />
      )}

      <Section title="От партнёров">
        {of('partner')
          .sort(byStatus)
          .map((q) => (
            <PartnerCard key={q.id} q={q} onOpen={() => show(q.id)} onClaim={() => claim(q.id, q.title, q.reward)} />
          ))}
      </Section>

      <Section title="Еженедельные" aside={left(weekEndsAt - now)}>
        {of('weekly')
          .sort(byStatus)
          .map((q) => (
            <QuestRow key={q.id} q={q} onOpen={() => show(q.id)} onClaim={() => claim(q.id, q.title, q.reward)} />
          ))}
      </Section>

      <Section title="Ежедневные" aside={left(midnight - now)}>
        <TaskTrio>
          {tasks.map((t) => (
            <TaskTile
              key={t.id}
              title={t.short}
              hint={t.hint}
              label={t.title}
              reward={t.reward}
              game={t.game}
              cover={gameCover(t.game)}
              receipt={t.type === 'receipt'}
              boost={Boolean(t.bonus)}
              progress={{ value: t.progress, goal: t.goal }}
              done={t.status === 'claimed'}
              ready={t.status === 'ready'}
              onClick={() => (t.status === 'ready' ? claim(t.id, t.title, t.reward) : show(t.id))}
            />
          ))}
        </TaskTrio>
        <DailyChest
          status={dailyChest.status}
          reward={dailyChest.reward}
          lit={tasks.map((t) => t.done)}
          next={left(midnight - now)}
          onOpen={() => claim('chest', 'Сундук дня', dailyChest.reward, '/assets/wheel/soft-5.webp')}
        />
      </Section>

      {opened && (
        <QuestSheet
          key={opened.id}
          q={opened}
          endsAt={endsAt(opened)}
          now={now}
          onClose={hide}
          onClaim={() => claim(opened.id, opened.title, opened.reward)}
          onGo={() => run(opened)}
          onSubmit={(link) => store.submitVideo(opened.id, link)}
          onApprove={() => store.approve(opened.id)}
        />
      )}
      {reward}
    </main>
  )
}

function Section({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className={s.section}>
      <header>
        <h2>{title}</h2>
        {aside && <span>{aside}</span>}
      </header>
      {children}
    </section>
  )
}
