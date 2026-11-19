import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RecipeCard } from '../components/RecipeCard'
import { RECIPES, type Meal } from '../data/recipes'
import { MINERAL_NOTES } from '../data/rules'
import { recipeText, useI18n } from '../i18n'

type Filter = 'all' | 'healthy' | 'gluten-free'

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function Recipes() {
  const { t, tp, content } = useI18n()
  const [params, setParams] = useSearchParams()
  const collection = (params.get('c') as Filter) || 'all'
  const [meal, setMeal] = useState<Meal | 'any'>('any')
  const [query, setQuery] = useState('')

  const collections: { key: Filter; label: string }[] = [
    { key: 'all', label: t('recipes.all') },
    { key: 'healthy', label: t('recipes.healthy') },
    { key: 'gluten-free', label: t('recipes.gf') },
  ]

  const setCollection = (c: Filter) => {
    const next = new URLSearchParams(params)
    if (c === 'all') next.delete('c')
    else next.set('c', c)
    setParams(next, { replace: true })
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return RECIPES.filter((r) => {
      if (collection !== 'all' && r.collection !== collection) return false
      if (meal !== 'any' && r.meal !== meal) return false
      if (q) {
        const text = recipeText(content, r.slug)
        if (!`${text.title} ${text.summary}`.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [collection, meal, query, content])

  const strictView = collection === 'gluten-free'

  return (
    <div className="wrap section">
      <h1 className="page-title">{strictView ? t('recipes.titleGf') : t('recipes.title')}</h1>
      <p className="page-lead">{strictView ? t('recipes.leadGf') : t('recipes.lead')}</p>

      <div className="filters">
        <div className="chips" role="group" aria-label={t('recipes.collection')}>
          {collections.map((c) => (
            <button key={c.key} type="button" className={`chip${collection === c.key ? ' on' : ''}`} aria-pressed={collection === c.key} onClick={() => setCollection(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label={t('recipes.meal')}>
          <button type="button" className={`chip${meal === 'any' ? ' on' : ''}`} aria-pressed={meal === 'any'} onClick={() => setMeal('any')}>
            {t('recipes.anyMeal')}
          </button>
          {MEALS.map((m) => (
            <button key={m} type="button" className={`chip${meal === m ? ' on' : ''}`} aria-pressed={meal === m} onClick={() => setMeal(m)}>
              {t(`meal.${m}`)}
            </button>
          ))}
        </div>
        <label className="search">
          <span className="sr-only">{t('recipes.search')}</span>
          <input type="search" placeholder={t('recipes.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      {strictView && (
        <details className="notes">
          <summary>{t('recipes.whyLeftOut')}</summary>
          <dl>
            {MINERAL_NOTES.map((n) => (
              <div key={n.id}>
                <dt>{content.minerals[n.id]?.heading ?? n.heading}</dt>
                <dd>{content.minerals[n.id]?.text ?? n.text}</dd>
              </div>
            ))}
          </dl>
          <p className="fineprint">{t('recipes.medical')}</p>
        </details>
      )}

      {visible.length === 0 ? (
        <div className="empty">
          <p>{t('recipes.none')}</p>
          <button type="button" className="btn ghost" onClick={() => { setMeal('any'); setQuery(''); setCollection('all') }}>
            {t('recipes.clear')}
          </button>
        </div>
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {tp('recipes.count', visible.length)}
          </p>
          <div className="grid">
            {visible.map((r) => (
              <RecipeCard key={r.slug} recipe={r} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
