import { useState, type FormEvent } from 'react'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Rewards } from '../../components/Rewards'
import { RewardScreen } from '../../components/RewardScreen'
import { Screen } from '../../components/Screen'
import { Toast } from '../../components/Toast'
import { num } from '../../data/format'
import { codeError, codeMask, inviteLink, REFERRAL, refFromLink } from '../../data/referral'
import { useStore } from '../../data/store'
import { copyText } from '../../lib/copy'
import { haptic } from '../../lib/motion'
import { shareTelegram } from '../../lib/telegram'
import { useOrigin } from '../../lib/useOrigin'
import { Field } from '../Shop/Forms'
import s from './Friends.module.css'

const date = (t: string) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }).format(Date.parse(t))
type Snap = { soft: number; hard: number; level: number; xp: number; xpNext: number }

/** Рассказать другу: свой код, кто уже пришёл и поле для чужого кода */
export function Friends() {
  const back = useOrigin()
  const { referral, balance, user, boost, claimFriend } = useStore()
  const { code, friends } = referral
  const [toast, setToast] = useState('')
  const [won, setWon] = useState<{ nick: string; before: Snap } | null>(null)
  const snap = (): Snap => ({ ...balance, level: user.level, xp: user.xp, xpNext: user.xpNext })
  const { inviter, newcomer } = REFERRAL
  /* буст удваивает XP: показываем то, что начислится */
  const reward = { ...inviter, xp: inviter.xp && inviter.xp * (boost.msLeft > 0 ? boost.multiplier : 1) }

  async function copy() {
    const ok = await copyText(code)
    if (ok) haptic('land')
    setToast(ok ? 'Код скопирован' : 'Не получилось скопировать')
  }
  function share() {
    haptic('press')
    shareTelegram(inviteLink(code), `Залетай в LIT Energy. Мой код: ${code}`)
  }

  return (
    <Screen
      title="Зови друзей"
      onBack={back}
      footer={
        <Button onClick={share}>
          <Icon name="friend" size={20} /> Отправить другу
        </Button>
      }
    >
      <section className={s.ticket}>
        <i className={s.flame} aria-hidden />
        <p>за каждого друга</p>
        <div className={s.sum}>
          {inviter.soft && <Big value={inviter.soft} kind="soft" />}
          {inviter.hard && <Big value={inviter.hard} kind="hard" />}
          {inviter.xp && (
            <span>
              <b>{num(inviter.xp)}</b>
              <em>XP</em>
            </span>
          )}
        </div>
        <button type="button" className={`press ${s.code}`} onClick={copy} aria-label={`Скопировать код ${code}`}>
          <span>
            <small>твой код</small>
            {code}
          </span>
          <Icon name="copy" size={24} />
        </button>
      </section>

      <ol className={s.steps}>
        <li>Отправь другу код или ссылку</li>
        <li>Друг регистрируется и вводит код в этом разделе</li>
        <li>
          {newcomer.soft ? (
            <span>
              Тебе бонус за друга, ему <Amount value={newcomer.soft} kind="soft" plus coin={18} />
            </span>
          ) : (
            'Тебе приходит бонус'
          )}
        </li>
      </ol>

      <section className={s.section}>
        <h2>Твои друзья</h2>
        {friends.length === 0 ? (
          <p className={s.empty}>Пока никого. Отправь код первому.</p>
        ) : (
          <ul className={s.list}>
            {friends.map((f) => (
              <li key={f.nick}>
                <span className={s.avatar} style={{ '--hue': (f.nick.charCodeAt(0) * 47) % 360 } as React.CSSProperties}>
                  {f.nick[0].toUpperCase()}
                </span>
                <span className={s.friend}>
                  <b>{f.nick}</b>
                  пришёл {date(f.at)}
                </span>
                {f.claimed ? (
                  <span className={s.done} aria-label="бонус получен">
                    <Icon name="check" size={20} />
                  </span>
                ) : (
                  <button
                    type="button"
                    className={`press ${s.claim}`}
                    onClick={() => {
                      setWon({ nick: f.nick, before: snap() })
                      claimFriend(f.nick)
                    }}
                  >
                    Собрать
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <EnterCode onDone={() => setToast('Код принят')} />

      {toast && <Toast text={toast} ok={!toast.startsWith('Не')} onDone={() => setToast('')} />}
      {won && <RewardScreen title={`Друг ${won.nick} в игре`} reward={reward} before={won.before} after={snap()} action="К друзьям" onClose={() => setWon(null)} />}
    </Screen>
  )
}

function Big({ value, kind }: { value: number; kind: 'soft' | 'hard' }) {
  return (
    <span>
      <b>{num(value)}</b>
      <img src={`/assets/currency/coin-${kind}.png`} alt={kind === 'soft' ? 'софт' : 'хард'} />
    </span>
  )
}

/** Код друга вводится один раз */
function EnterCode({ onDone }: { onDone: () => void }) {
  const { referral, enterCode } = useStore()
  const [open, setOpen] = useState(Boolean(refFromLink))
  const [code, setCode] = useState(refFromLink)
  const [error, setError] = useState('')
  const { newcomer } = REFERRAL

  if (referral.invitedBy)
    return (
      <section className={s.accepted}>
        <Icon name="check" size={22} />
        <span>
          <b>Код {referral.invitedBy} принят</b>
          {newcomer.soft && 'бонус уже на балансе'}
        </span>
      </section>
    )

  function submit(e: FormEvent) {
    e.preventDefault()
    const problem = codeError(code, referral.code)
    if (problem) {
      haptic('land')
      return setError(problem)
    }
    haptic('done')
    enterCode(code)
    onDone()
  }

  return (
    <section className={s.enter} data-open={open || undefined}>
      <button type="button" className={s.enterHead} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>
          <b>Есть код друга?</b>
          введи один раз, если тебя позвали
        </span>
        <Icon name="chevron" size={20} />
      </button>
      <div className={s.drop} inert={!open}>
        <form noValidate onSubmit={submit}>
          <Field
            label="Код друга"
            required
            value={code}
            error={error}
            placeholder="LIT-0000-0000"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            onText={(v) => {
              /* стирание по одному символу не трогаем, остальное приводим к виду LIT-0000-0000 */
              setCode(v === code.slice(0, -1) ? v : codeMask(v))
              setError('')
            }}
          />
          <Button type="submit" variant="secondary" disabled={!code}>
            Применить
            {newcomer.soft && <Rewards reward={newcomer} />}
          </Button>
        </form>
      </div>
    </section>
  )
}
