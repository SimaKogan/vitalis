import { Link } from 'react-router-dom'
import type { Recipe } from '../data/recipes'
import { highlights, isGlutenFree, nutritionPerServing } from '../lib/diet'
import { recipeText, useI18n } from '../i18n'

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { t, content } = useI18n()
  const text = recipeText(content, recipe.slug)
  const n = nutritionPerServing(recipe)
  const h = highlights(recipe)
  const strict = recipe.collection === 'gluten-free'

  return (
    <Link to={`/recipes/${recipe.slug}`} className="recipe-card" style={{ ['--h' as string]: recipe.hue }}>
      <div className="recipe-art" aria-hidden="true">
        <span>{recipe.emoji}</span>
      </div>
      <div className="recipe-body">
        <h3>{text.title}</h3>
        <p className="recipe-meta">{t('card.meta', { meal: t(`meal.${recipe.meal}`), min: recipe.minutes, kcal: n.kcal })}</p>
        <p className="recipe-summary">{text.summary}</p>
        <ul className="badges" aria-label={t('card.dietary')}>
          {strict && <li className="badge strict">{t('badge.gfSoy')}</li>}
          {!strict && isGlutenFree(recipe) && <li className="badge">{t('badge.gf')}</li>}
          {h.iodine && <li className="badge iodine">{t('badge.iodine')}</li>}
          {h.ironWithVitC ? (
            <li className="badge iron">{t('badge.ironVitCShort')}</li>
          ) : (
            h.iron && <li className="badge iron">{t('badge.iron')}</li>
          )}
        </ul>
      </div>
    </Link>
  )
}
