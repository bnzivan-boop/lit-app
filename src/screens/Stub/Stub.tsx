import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import s from './Stub.module.css'

/* Временная заглушка: экраны появятся на следующих шагах */
export function Stub({ title }: { title: string }) {
  const go = useNavigate()
  return (
    <main className={s.stub}>
      <h1>{title}</h1>
      <p>Этот экран сделаем на следующих шагах.</p>
      <Button variant="secondary" onClick={() => go('/')}>
        На главную
      </Button>
    </main>
  )
}
