import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRecipe } from '../data/recipes'
import { useShopping } from '../hooks/ShoppingContext'
import { recipeText, useI18n } from '../i18n'
import { highlights, isGlutenFree, nutritionPerServing } from '../lib/diet'

/** Keyed by slug so servings and "added" state reset when you open another recipe. */
export function RecipeDetail() {
  const { slug } = useParams()
  return <RecipeView key={slug} slug={slug} />
}

function RecipeView({ slug }: { slug: string | undefined }) {
  const { t, tp, num, content, ing, amount } = useI18n()
  const recipe = getRecipe(slug)
  const { addRecipe } = useShopping()
  const [servings, setServings] = useState<number | null>(null)
  const [added, setAdded] = useState(false)

  if (!recipe) {
    return (
      <div className="wrap section empty">
        <h1 className="page-title">{t('detail.notFound')}</h1>
        <p>{t('detail.notFoundText')}</p>
        <Link to="/recipes" className="btn primary">
          {t('detail.allRecipes')}
        </Link>
      </div>
    )
  }

  const text = recipeText(content, recipe.slug)
  const count = servings ?? recipe.servings
  const factor = count / recipe.servings
  const n = nutritionPerServing(recipe)
  const h = highlights(recipe)
  const strict = recipe.collection === 'gluten-free'

  const add = () => {
    addRecipe(recipe, factor)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2500)
  }

  return (
    <article className="wrap section detail" style={{ ['--h' as string]: recipe.hue }}>
      <Link to={strict ? '/recipes?c=gluten-free' : '/recipes'} className="text-link back">
        {t('detail.back')}
      </Link>

      <header className="detail-head">
        <div className="detail-art" aria-hidden="true">
          <span>{recipe.emoji}</span>
        </div>
        <div>
          <h1 className="page-title">{text.title}</h1>
          <p className="page-lead">{text.summary}</p>
          <p className="recipe-meta">
            {t(`meal.${recipe.meal}`)}, {recipe.minutes} {t('unit.min')}
          </p>
          <ul className="badges">
            {strict && <li className="badge strict">{t('badge.gf')}</li>}
            {strict && <li className="badge strict">{t('badge.soyFree')}</li>}
            {strict && <li className="badge strict">{t('badge.noBlockers')}</li>}
            {!strict && isGlutenFree(recipe) && <li className="badge">{t('badge.gf')}</li>}
            {h.iodine && <li className="badge iodine">{t('badge.iodineSource')}</li>}
            {h.ironWithVitC && <li className="badge iron">{t('badge.ironVitC')}</li>}
            <li className="badge">{t('badge.noAdditives')}</li>
          </ul>
        </div>
      </header>

      <dl className="nutrition" aria-label={t('detail.nutritionAria')}>
        <div><dt>{t('common.calories')}</dt><dd>{num(n.kcal)}</dd></div>
        <div><dt>{t('macro.protein')}</dt><dd>{n.protein} {t('unit.g')}</dd></div>
        <div><dt>{t('macro.carbs')}</dt><dd>{n.carbs} {t('unit.g')}</dd></div>
        <div><dt>{t('macro.fat')}</dt><dd>{n.fat} {t('unit.g')}</dd></div>
      </dl>
      <p className="fineprint">{t('detail.perServing')}</p>

      <div className="detail-cols">
        <section aria-labelledby="ing-h">
          <div className="section-head">
            <h2 id="ing-h">{t('detail.ingredients')}</h2>
            <div className="stepper" role="group" aria-label={t('detail.servings')}>
              <button type="button" onClick={() => setServings(Math.max(1, count - 1))} aria-label={t('detail.fewer')} disabled={count <= 1}>
                −
              </button>
              <span aria-live="polite">{tp('detail.servings', count)}</span>
              <button type="button" onClick={() => setServings(Math.min(12, count + 1))} aria-label={t('detail.more')}>
                +
              </button>
            </div>
          </div>
          <ul className="ingredients">
            {recipe.ingredients.map(({ id, grams }) => (
              <li key={id}>
                <span>{ing(id)}</span>
                <b>{amount(id, grams * factor)}</b>
              </li>
            ))}
          </ul>
          <button type="button" className="btn primary wide" onClick={add}>
            {added ? t('detail.added') : t('detail.add')}
          </button>
          {added && (
            <Link to="/shopping" className="text-link">
              {t('detail.openList')}
            </Link>
          )}
        </section>

        <section aria-labelledby="steps-h">
          <h2 id="steps-h">{t('detail.method')}</h2>
          <ol className="steps">
            {text.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {text.tip && (
            <p className="tip">
              <strong>{t('detail.tip')}</strong> {text.tip}
            </p>
          )}
        </section>
      </div>
    </article>
  )
}
