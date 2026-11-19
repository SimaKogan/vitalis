import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecipe } from '../data/recipes'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useProfile } from '../hooks/useProfile'
import { useShopping } from '../hooks/ShoppingContext'
import { recipeText, useI18n } from '../i18n'
import { isValid, targets } from '../lib/calc'
import { addWeekToList, planWeek } from '../lib/menu'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function Menu() {
  const { t, lang, num, content } = useI18n()
  const [profile] = useProfile()
  const shop = useShopping()
  const [seed, setSeed] = useLocalStorage<number>('vitalis.menuSeed', 1)
  const [strictOnly, setStrictOnly] = useLocalStorage<boolean>('vitalis.menuStrict', false)
  const [added, setAdded] = useState(false)

  const tg = isValid(profile) ? targets(profile) : null
  const kcal = tg?.kcal
  const protein = tg?.protein
  const carbs = tg?.carbs
  const fat = tg?.fat
  const plan = useMemo(
    () => (kcal && protein && carbs && fat ? planWeek({ kcal, protein, carbs, fat }, { seed, strictOnly }) : []),
    [kcal, protein, carbs, fat, seed, strictOnly],
  )

  // Israel starts the week on Sunday
  const order = lang === 'he' ? (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const) : DAYS

  const addWeek = () => {
    shop.replaceAll(addWeekToList(shop.items, plan))
    setAdded(true)
    window.setTimeout(() => setAdded(false), 3000)
  }

  if (!tg) {
    return (
      <div className="wrap section empty">
        <h1 className="page-title">{t('menu.title')}</h1>
        <p>{t('menu.needProfile')}</p>
        <Link to="/calculator" className="btn primary">
          {t('menu.toCalc')}
        </Link>
      </div>
    )
  }

  return (
    <div className="wrap section">
      <h1 className="page-title">{t('menu.title')}</h1>
      <p className="page-lead">{t('menu.lead')}</p>
      <p className="target-line">{t('menu.target', { kcal: num(tg.kcal), p: tg.protein, c: tg.carbs, f: tg.fat })}</p>

      <div className="filters">
        <div className="chips" role="group" aria-label={t('menu.diet')}>
          <button type="button" className={`chip${!strictOnly ? ' on' : ''}`} aria-pressed={!strictOnly} onClick={() => setStrictOnly(false)}>
            {t('menu.diet.all')}
          </button>
          <button type="button" className={`chip${strictOnly ? ' on' : ''}`} aria-pressed={strictOnly} onClick={() => setStrictOnly(true)}>
            {t('menu.diet.gf')}
          </button>
        </div>
        <div className="list-actions">
          <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
            {t('menu.shuffle')}
          </button>
          <button type="button" className="btn primary" onClick={addWeek}>
            {added ? t('menu.added') : t('menu.addAll')}
          </button>
          {added && (
            <Link to="/shopping" className="text-link">
              {t('menu.openList')}
            </Link>
          )}
        </div>
      </div>

      <div className="week">
        {order.map((d, i) => {
          const day = plan[i]
          if (!day) return null
          return (
            <article key={d} className="day" style={{ ['--i' as string]: i }}>
              <h2>{t(`menu.day.${d}` as 'menu.day.mon')}</h2>
              <ul className="day-meals">
                {day.meals.map((m) => {
                  const r = getRecipe(m.slug)!
                  return (
                    <li key={m.slot}>
                      <span className="slot">{t(`meal.${m.slot}`)}</span>
                      <Link to={`/recipes/${m.slug}`}>
                        <span aria-hidden="true">{r.emoji}</span> {recipeText(content, m.slug).title}
                      </Link>
                      <span className="portion">
                        {t('menu.portion', { n: num(m.portion, 2) })}, {m.nutrition.kcal} {t('unit.kcal')}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <p className="day-total">
                <strong>{t('menu.dayTotal')}: {num(day.totals.kcal)} {t('unit.kcal')}</strong>
                <span>
                  {t('macro.protein')} {day.totals.protein} · {t('macro.carbs')} {day.totals.carbs} · {t('macro.fat')} {day.totals.fat}
                </span>
                <span>{t('menu.pct', { pct: Math.round((day.totals.kcal / tg.kcal) * 100) })}</span>
              </p>
            </article>
          )
        })}
      </div>
      <p className="fineprint">{t('menu.note')}</p>
    </div>
  )
}
