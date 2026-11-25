import { useEffect, useRef, useState } from 'react'
import { Section } from './Section'
import s from './Kit.module.css'

/* Витрина читает значения из самих CSS-переменных, поэтому не может разойтись с tokens.css. */

type Rgb = [number, number, number]

function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function toRgb(hex: string): Rgb | null {
  /* сборщик сокращает #ffffff до #fff */
  const full = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, '$&$&') : hex
  const m = /^#([0-9a-f]{6})$/i.exec(full)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}

function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  const ra = toRgb(a)
  const rb = toRgb(b)
  if (!ra || !rb) return null
  const [hi, lo] = [luminance(ra), luminance(rb)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function printHex(v: string) {
  const m = /^rgba\((\d+), ?(\d+), ?(\d+), ?([\d.]+)\)$/.exec(v)
  if (!m) return v.startsWith('#') ? v.toUpperCase() : v
  const hex = m.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('')
  return `#${hex.toUpperCase()}, ${Math.round(Number(m[4]) * 100)}%`
}

const fmt = (n: number) => n.toFixed(1).replace('.', ',')

/* Цвета */

const SURFACES = [
  ['--bg', 'фон приложения'],
  ['--surface-1', 'карточки'],
  ['--surface-2', 'вложенные блоки, второстепенные кнопки'],
  ['--line', 'разделители'],
  ['--track', 'трек прогресса на surface-2'],
  ['--idle', 'пустой кружок, неактивный сегмент'],
] as const

const TEXTS = [
  ['--text', 'Основной текст'],
  ['--text-muted', 'Второстепенный текст'],
  ['--accent', 'Прогресс и своё место'],
  ['--warn', 'Угроза потери'],
  ['--warn-text', 'Текст на плашке угрозы'],
] as const

const RARITIES = [
  ['--rarity-common', 'Обычный'],
  ['--rarity-rare', 'Редкий'],
  ['--rarity-epic', 'Эпический'],
  ['--rarity-legend', 'Легендарный'],
] as const

function Swatch({ token, note }: { token: string; note: string }) {
  return (
    <li className={s.swatch}>
      <span className={s.swatchColor} style={{ background: `var(${token})` }} />
      <span className={s.swatchText}>
        <span className={s.token}>{token}</span>
        <span className={s.note}>{note}</span>
      </span>
      <span className={s.value}>{printHex(readToken(token))}</span>
    </li>
  )
}

const BACKDROPS = ['--bg', '--surface-1', '--surface-2']

function TextColor({ token, label }: { token: string; label: string }) {
  const color = readToken(token)
  const ratios = BACKDROPS.map((b) => contrast(color, readToken(b)) ?? 0)
  return (
    <li className={s.textColor}>
      <span className={s.textColorHead}>
        <span style={{ color: `var(${token})` }}>{label}</span>
        <span className={s.value}>
          {token} {printHex(color)}
        </span>
      </span>
      <span className={s.backdrops}>
        {BACKDROPS.map((b, i) => (
          <span key={b} className={s.backdrop} style={{ background: `var(${b})`, color: `var(${token})` }}>
            <span className={s.ratio}>{fmt(ratios[i])}</span>
            {ratios[i] < 4.5 && <span className={s.fail}>меньше 4,5</span>}
          </span>
        ))}
      </span>
    </li>
  )
}

function Colors() {
  const inkRatio = contrast(readToken('--accent-ink'), readToken('--accent')) ?? 0
  return (
    <>
      <Section title="Фон и поверхности">
        <div className={s.ladder}>
          <span className={s.ladderName}>bg</span>
          <div className={s.ladder1}>
            <span className={s.ladderName}>surface-1</span>
            <div className={s.ladder2}>
              <span className={s.ladderName}>surface-2</span>
              <span className={s.ladderTrack}>
                <span />
              </span>
            </div>
          </div>
        </div>
        <ul className={s.list}>
          {SURFACES.map(([t, n]) => (
            <Swatch key={t} token={t} note={n} />
          ))}
        </ul>
      </Section>

      <Section title="Текст и контраст">
        <p className={s.lead}>Контраст на bg, surface-1 и surface-2. Норма для текста — от 4,5.</p>
        <ul className={s.list}>
          {TEXTS.map(([t, n]) => (
            <TextColor key={t} token={t} label={n} />
          ))}
        </ul>
      </Section>

      <Section title="Тиффани">
        <p className={s.lead}>Только главное действие и прогресс.</p>
        <div className={s.accentBlock}>
          <span className={s.accentWord}>Собрать заряд</span>
          <span className={s.accentRatio}>{fmt(inkRatio)}</span>
        </div>
        <div className={s.tint}>
          <span className={s.tintPlace}>6</span>
          <span className={s.tintName}>Ты</span>
          <span className={s.tintPower}>2 940</span>
        </div>
        <ul className={s.list}>
          <Swatch token="--accent" note="главное действие, прогресс" />
          <Swatch token="--accent-ink" note="текст на тиффани" />
          <Swatch token="--accent-tint" note="подсветка «это ты»" />
          <Swatch token="--accent-low" note="начало шкалы опыта" />
          <Swatch token="--glow-mid" note="свечение героя, середина" />
          <Swatch token="--glow-low" note="свечение героя, край" />
          <Swatch token="--streak-blue" note="градиент стрика" />
          <Swatch token="--streak-violet" note="градиент стрика" />
          <Swatch token="--streak-deep" note="градиент стрика, край" />
        </ul>
      </Section>

      <Section title="Угроза">
        <p className={s.lead}>Только угроза потери: стрик сгорает, вылет из лиги.</p>
        <div className={s.warnBlock}>Стрик 40 дней сгорит через 2 ч 14 мин</div>
        <ul className={s.list}>
          <Swatch token="--warn" note="обводка, иконка, число" />
          <Swatch token="--warn-tint" note="фон плашки" />
          <Swatch token="--warn-text" note="текст на плашке" />
        </ul>
      </Section>

      <Section title="Редкость">
        <div className={s.rarityRow}>
          {RARITIES.map(([t, n]) => (
            <span key={t} className={s.rarity} style={{ background: `var(${t})` }}>
              {n}
            </span>
          ))}
        </div>
        <ul className={s.list}>
          {RARITIES.map(([t, n]) => (
            <TextColor key={t} token={t} label={n} />
          ))}
        </ul>
      </Section>
    </>
  )
}

/* Типографика */

const DISPLAY_SCALE = [
  ['--fs-hero-max', 'Герой-цифра, максимум', '41', ''],
  ['--fs-hero', 'Герой-цифра, минимум', '6 место', ''],
  ['--fs-screen-lg', 'Заголовок экрана, крупный', 'Магазин', s.caps],
  ['--fs-screen', 'Заголовок экрана', 'Неделя в лиге', s.caps],
  ['--fs-tile', 'Цифра в плитке и статистике', '240', ''],
  ['--fs-case-lg', 'Название кейса на баннере', 'Старт', s.caps],
  ['--fs-nick', 'Ник в герое', 'Korostkina', s.caps],
  ['--fs-figure', 'Крупная цифра в карточке', '240', ''],
  ['--fs-section', 'Заголовок блока', 'Можно открыть', s.caps],
  ['--fs-case', 'Название кейса', 'Mystery box «Старт»', s.caps],
] as const

const LABEL_SCALE = [
  ['--fs-button', 'Главная кнопка', 'Играть в «Энерджи Джамп»'],
  ['--fs-button-sm', 'Маленькая кнопка, число в строке', 'Открыть за 40'],
] as const

const BODY_SCALE = [
  ['--fs-body', 'Текст', 'Сыграй в «Энерджи Раш»'],
  ['--fs-body-sm', 'Текст мельче', 'Задание: набрать 3 000 очков'],
  ['--fs-caption', 'Подпись', 'Полный через 2 ч 30 мин'],
  ['--fs-min', 'Минимум, мельче нельзя', 'Главная'],
] as const

function TypeSample({ token, role, text, className }: { token: string; role: string; text: string; className: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [spec, setSpec] = useState('')
  useEffect(() => {
    if (!ref.current) return
    const c = getComputedStyle(ref.current)
    const family = c.fontFamily.split(',')[0].replace(/["']/g, '')
    const tracking = parseFloat(c.letterSpacing)
    const pct = Number.isNaN(tracking) ? 0 : Math.round((tracking / parseFloat(c.fontSize)) * 100)
    const trackingText = pct === 0 ? '' : `, трекинг ${pct < 0 ? '−' : ''}${Math.abs(pct)}%`
    setSpec(`${family} ${c.fontWeight}, ${parseFloat(c.fontSize)} px${trackingText}`)
  }, [])
  return (
    <li className={s.type}>
      <span ref={ref} className={className} style={{ fontSize: `var(${token})` }}>
        {text}
      </span>
      <span className={s.typeMeta}>
        <span>{role}</span>
        <span className={s.note}>
          {token} · {spec}
        </span>
      </span>
    </li>
  )
}

function Type() {
  return (
    <>
      <Section title="Шрифты">
        <div className={s.faces}>
          <div>
            <p className={s.faceDisplay}>Аа 0123456789</p>
            <p className={s.note}>Roboto Condensed 800: цифры, заголовки, акценты</p>
          </div>
          <div>
            <p className={s.faceLabel}>Аа 0123456789</p>
            <p className={s.note}>Roboto Condensed 700: кнопки и числа в строках, без трекинга</p>
          </div>
          <div>
            <p className={s.faceBody}>Аа 0123456789</p>
            <p className={s.note}>Liter 400: весь остальной текст</p>
          </div>
        </div>
      </Section>

      <Section title="Размеры">
        <ul className={s.list}>
          {DISPLAY_SCALE.map(([t, r, x, c]) => (
            <TypeSample key={t} token={t} role={r} text={x} className={`${s.display} ${c}`} />
          ))}
          {LABEL_SCALE.map(([t, r, x]) => (
            <TypeSample key={t} token={t} role={r} text={x} className={s.label} />
          ))}
          {BODY_SCALE.map(([t, r, x]) => (
            <TypeSample key={t} token={t} role={r} text={x} className={s.body} />
          ))}
        </ul>
      </Section>

      <Section title="Цифра с хвостом">
        <p className={s.lead}>Трекинг хвоста считается от его размера, а не от крупной цифры.</p>
        <div className={s.tails}>
          <span>
            <span className={s.tailWrong}>
              240<small>/240</small>
            </span>
            <span className={s.note}>в макете, слиплось</span>
          </span>
          <span>
            <span className={s.tailRight}>
              240<small>/240</small>
            </span>
            <span className={s.note}>правильно</span>
          </span>
        </div>
      </Section>
    </>
  )
}

/* Отступы, формы, размеры */

const SPACES = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-8', '--space-12']

const RADII = [
  ['--r-card', 'карточка'],
  ['--r-fab', 'скан чека'],
  ['--r-block', 'вложенный блок'],
  ['--r-button', 'кнопка'],
  ['--r-button-sm', 'маленькая кнопка'],
  ['--r-chip', 'чип'],
] as const

const SIZES = [
  ['--button-h', 'главная кнопка'],
  ['--fab', 'скан чека'],
  ['--tap', 'минимальная зона нажатия'],
  ['--avatar', 'аватар'],
  ['--bar-h-lg', 'прогресс, толстый'],
  ['--bar-h', 'прогресс, тонкий'],
] as const

const COINS = ['--coin-sm', '--coin', '--coin-lg']

const MOTION = [
  ['--t-press', 'нажатие, сжатие до 0,97'],
  ['--t-fast', 'быстрый переход'],
  ['--t-base', 'обычный переход'],
  ['--t-slow', 'медленный переход'],
  ['--t-progress', 'заполнение прогресса, задержка 100 мс'],
] as const

function Shape() {
  return (
    <>
      <Section title="Отступы">
        <p className={s.lead}>Сетка 4 px. Поля экрана 16, между блоками 16, между разделами 44, внутри карточки 16.</p>
        <ul className={s.list}>
          {SPACES.map((t) => (
            <li key={t} className={s.measure}>
              <span className={s.token}>{t}</span>
              <span className={s.measureBar} style={{ width: `var(${t})` }} />
              <span className={s.value}>{readToken(t)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Скругления">
        <ul className={s.radii}>
          {RADII.map(([t, n]) => (
            <li key={t}>
              <span className={s.radius} style={{ borderRadius: `var(${t})` }}>
                <span className={s.radiusValue}>{parseFloat(readToken(t))}</span>
              </span>
              <span className={s.note}>{n}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Размеры элементов">
        <ul className={s.list}>
          {SIZES.map(([t, n]) => (
            <li key={t} className={s.size}>
              <span className={s.sizeBox} style={{ height: `var(${t})` }} />
              <span className={s.swatchText}>
                <span className={s.token}>{t}</span>
                <span className={s.note}>{n}</span>
              </span>
              <span className={s.value}>{readToken(t)}</span>
            </li>
          ))}
          <li className={s.size}>
            <span />
            <span className={s.swatchText}>
              <span className={s.token}>--tabbar-h</span>
              <span className={s.note}>нижняя панель с учётом safe-area</span>
            </span>
            <span className={s.value}>{readToken('--tabbar-h')}</span>
          </li>
        </ul>
      </Section>

      <Section title="Монеты">
        <div className={s.coins}>
          {(['soft', 'hard'] as const).map((c) => (
            <div key={c} className={s.coinCol}>
              <img src={`/assets/currency/coin-${c}.png`} alt="" width={88} height={88} />
              <span>{c === 'soft' ? 'Софт' : 'Хард'}</span>
              {COINS.map((t) => (
                <span key={t} className={s.amount}>
                  {c === 'soft' ? '270' : '572'}
                  <img
                    src={`/assets/currency/coin-${c}.png`}
                    alt=""
                    style={{ width: `var(${t})`, height: `var(${t})` }}
                  />
                  <span className={s.note}>{readToken(t)}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Движение">
        <p className={s.lead}>Кривая {readToken('--ease')}</p>
        <ul className={s.list}>
          {MOTION.map(([t, n]) => (
            <li key={t} className={s.row}>
              <span className={s.swatchText}>
                <span className={s.token}>{t}</span>
                <span className={s.note}>{n}</span>
              </span>
              <span className={s.value}>{readToken(t)}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

export function Tokens() {
  return (
    <>
      <Colors />
      <Type />
      <Shape />
    </>
  )
}
