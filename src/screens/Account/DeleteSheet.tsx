import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { BASE } from '../../lib/base'
import s from './DeleteSheet.module.css'

/** Удаление аккаунта: честно, что пропадёт. В прототипе сбрасывает демо */
export function DeleteSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet label="Удалить аккаунт" onClose={onClose}>
      <h2 className={s.title}>Удалить аккаунт?</h2>
      <p className={s.text}>Пропадут софт, хард, уровень, стрик и места в рейтингах. Вернуть их не получится.</p>
      <div className={s.row}>
        <Button onClick={onClose}>Оставить</Button>
        <Button variant="secondary" onClick={() => location.assign(BASE)}>
          Удалить
        </Button>
      </div>
    </Sheet>
  )
}
