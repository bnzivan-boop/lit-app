import { Icon } from '../../components/Icon'
import { networkOf, shortLink } from '../../data/video'
import s from './VideoField.module.css'

/** Что отправлено и где оно сейчас */
export function VideoReview({ link, onEdit }: { link: string; onEdit: () => void }) {
  return (
    <div className={s.review}>
      <div className={s.file}>
        <span className={s.play} aria-hidden>
          <Icon name="play" size={22} />
        </span>
        <span className={s.fileText}>
          <b>Ролик: {networkOf(link)}</b>
          <span>{shortLink(link)}</span>
        </span>
        <button type="button" className={`press ${s.edit}`} onClick={onEdit}>
          Изменить
        </button>
      </div>
      <ol className={s.path}>
        <li data-on="done">Отправлено</li>
        <li data-on="now">Проверяем</li>
        <li>Награда</li>
      </ol>
    </div>
  )
}
