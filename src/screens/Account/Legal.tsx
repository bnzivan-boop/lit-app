import { useParams, Navigate } from 'react-router'
import mock from '../../../data/mock.json'
import { Screen } from '../../components/Screen'
import { useOrigin } from '../../lib/useOrigin'
import s from './Legal.module.css'

type Doc = { title: string; sections: { heading?: string; text?: string }[] }
const LEGAL = mock.legal as { company: { title: string; value: string }[]; offer: Doc; privacy: Doc }

/** Документы: оферта, политика конфиденциальности, информация о компании. Тексты — из данных */
export function Legal() {
  const { doc } = useParams()
  const back = useOrigin('/')

  if (doc === 'company')
    return (
      <Screen title="Информация о компании" onBack={back}>
        <dl className={s.company}>
          {LEGAL.company.map((r) => (
            <div key={r.title}>
              <dt>{r.title}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </Screen>
    )

  const d = doc === 'offer' ? LEGAL.offer : doc === 'privacy' ? LEGAL.privacy : null
  if (!d) return <Navigate to="/settings" replace />
  return (
    <Screen title={d.title} onBack={back}>
      <article className={s.doc}>
        {d.sections.map((x, i) => (x.heading ? <h2 key={i}>{x.heading}</h2> : <p key={i}>{x.text}</p>))}
      </article>
    </Screen>
  )
}
